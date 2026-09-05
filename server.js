/*
  Noisy Uploader V2 - backend
  Uploader: Catbox.moe (https://catbox.moe/user/api.php, reqtype=fileupload)
  Credit: Ryusei Hoshino (https://github.com/dev-ryusei-hoshino) - flow diadaptasi dari script beliau.
  Endpoint utama: POST /api/catbox-upload (multipart field "file", maks 200MB) -> {success, url, ...}
  Endpoint lama watermark (/api/upload, /api/remove, /api/job) tetap tersedia untuk kompatibilitas.
*/
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36';
const API_BASE = 'https://api-v2.imgupscaler.ai';
const API_PREFIX = '/api';
const PRODUCT_CODE = 'magiceraser';
const ROUTER_KEY = 'me_remove_watermark_v1';
const PROMPT = '移除所有水印和移除右下角四角星水印';
const PROXY_SOURCE = 'https://api.ikyyxd.my.id/v2l/proxy-free/ikyy-xsample';

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Statis: hasil build React (dist/) jika ada, fallback ke UI lama (public-legacy/).
const DIST = path.join(__dirname, 'dist');
const LEGACY = path.join(__dirname, 'public-legacy');
if (fs.existsSync(path.join(DIST, 'index.html'))) {
  app.use(express.static(DIST));
} else if (fs.existsSync(LEGACY)) {
  app.use(express.static(LEGACY));
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.mimetype);
    if (!ok) return cb(new Error('Format harus JPG/PNG/WEBP'));
    cb(null, true);
  }
});

// Uploader umum (Catbox): simpan ke disk temp, stream ke catbox, hapus temp.
const CATBOX_MAX = 200 * 1024 * 1024;
const CATBOX_BLOCKED_EXT = new Set(['.exe', '.bat', '.cmd', '.msi', '.scr', '.ps1', '.com', '.pif']);
const catboxUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, os.tmpdir()),
    filename: (req, file, cb) => cb(null, `noisy-${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname || '')}`)
  }),
  limits: { fileSize: CATBOX_MAX },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (CATBOX_BLOCKED_EXT.has(ext)) return cb(new Error('Ekstensi ' + ext + ' diblokir demi keamanan'));
    cb(null, true);
  }
});

const CATBOX_URL = 'https://catbox.moe/user/api.php';
const CATBOX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0';

// Anti-scraping ringan: batasi request per IP (in-memory, sliding window).
// IP developer selalu bebas: localhost, daftar RATE_LIMIT_BYPASS_IPS, atau header X-Rate-Limit-Bypass.
const BYPASS_IPS = (process.env.RATE_LIMIT_BYPASS_IPS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const BYPASS_KEY = process.env.RATE_LIMIT_BYPASS_KEY || '';
const RATE_LIMIT_DISABLED = ['1', 'true'].includes((process.env.RATE_LIMIT_DISABLED || '').toLowerCase());
const LOCAL_IPS = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? true : Number(process.env.TRUST_PROXY) || 1);
}

function ipMatches(ip, rule) {
  if (rule === ip) return true;
  if (!rule.includes('/')) return false;
  const [base, bitsStr] = rule.split('/');
  const bits = parseInt(bitsStr, 10);
  if (Number.isNaN(bits) || bits < 0 || bits > 32) return false;
  const toInt = (v) => v.split('.').reduce((a, o) => ((a << 8) + Number(o)) >>> 0, 0) >>> 0;
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (toInt(ip) & mask) === (toInt(base) & mask);
}

function isBypassed(req) {
  if (RATE_LIMIT_DISABLED) return true;
  const ip = req.ip || req.socket?.remoteAddress || '';
  if (LOCAL_IPS.has(ip)) return true;
  if (BYPASS_IPS.some((rule) => ipMatches(ip, rule))) return true;
  if (BYPASS_KEY && req.headers['x-rate-limit-bypass'] === BYPASS_KEY) return true;
  return false;
}

const rateBuckets = new Map();
function rateLimit({ windowMs = 60000, max = 30 } = {}) {
  return (req, res, next) => {
    if (isBypassed(req)) return next();
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const b = rateBuckets.get(key);
    if (!b || now - b.start >= windowMs) {
      rateBuckets.set(key, { start: now, count: 1 });
      if (rateBuckets.size > 10000) {
        for (const [k, v] of rateBuckets) if (now - v.start >= windowMs) rateBuckets.delete(k);
      }
      return next();
    }
    b.count += 1;
    if (b.count > max) {
      return res.status(429).json({ success: false, message: 'Terlalu banyak permintaan. Coba lagi nanti.' });
    }
    next();
  };
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return null;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function genSerial() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---- proxy pool ----
let proxyCache = { list: [], fetchedAt: 0 };
async function fetchProxies(force = false) {
  const now = Date.now();
  if (!force && proxyCache.list.length && now - proxyCache.fetchedAt < 5 * 60 * 1000) return proxyCache.list;
  try {
    const r = await axios.get(PROXY_SOURCE, { timeout: 15000 });
    const list = (Array.isArray(r.data) ? r.data : [])
      .map((p) => {
        const parts = String(p).split(':');
        if (parts.length !== 4) return null;
        const [host, port, username, password] = parts;
        return { protocol: 'http', host, port: parseInt(port, 10), auth: { username, password }, raw: p };
      })
      .filter(Boolean);
    proxyCache = { list, fetchedAt: now };
    console.log(`[proxy] fetched ${list.length}`);
    return list;
  } catch (e) {
    console.log('[proxy] fetch fail:', e.message);
    return proxyCache.list;
  }
}

// jobId -> proxy index used at create (-1 = direct)
const jobProxyMap = new Map();

function baseHeaders(extra = {}) {
  return {
    'User-Agent': UA,
    Origin: 'https://magiceraser.org',
    Referer: 'https://magiceraser.org/',
    'Product-Code': PRODUCT_CODE,
    'Product-Serial': genSerial(),
    ...extra
  };
}

async function apiUploadUrl(fileName) {
  const form = new FormData();
  form.append('file_name', fileName);
  const res = await axios.post(`${API_BASE}${API_PREFIX}/common/upload/upload-image`, form, {
    headers: { ...baseHeaders(), ...form.getHeaders() },
    timeout: 30000,
    validateStatus: () => true
  });
  if (res.status !== 200 || res.data?.code !== 100000 || !res.data?.result?.url) {
    throw new Error('Gagal minta upload URL: ' + JSON.stringify(res.data).slice(0, 300));
  }
  return res.data.result; // {object_name, url}
}

async function apiSignObject(objectName, retries = 3) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      const form = new FormData();
      form.append('object_name', objectName);
      const res = await axios.post(`${API_BASE}${API_PREFIX}/common/upload/sign-object`, form, {
        headers: { ...baseHeaders(), ...form.getHeaders() },
        timeout: 30000,
        validateStatus: () => true
      });
      if (res.data?.code === 100000 && res.data?.result?.url) return res.data.result.url;
      lastErr = new Error('Sign gagal: ' + JSON.stringify(res.data).slice(0, 300));
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastErr;
}

async function apiCreateJob(imageUrl, proxy = null) {
  const headers = baseHeaders({ 'router-key': ROUTER_KEY });
  const client = axios.create({ baseURL: API_BASE, timeout: 35000, validateStatus: () => true, ...(proxy ? { proxy } : {}) });
  const form = new FormData();
  form.append('prompt', PROMPT);
  form.append('original_image_url', imageUrl);
  form.append('resolution', '0.8');
  form.append('output_format', 'jpg');
  const res = await client.post(`${API_PREFIX}/runtime/jobs/create-job`, form, {
    headers: { ...headers, ...form.getHeaders() }
  });
  return res.data;
}

async function apiGetJob(jobId, proxy = null) {
  const headers = baseHeaders(); // tanpa router-key (sesuai ij() di bundle)
  const client = axios.create({ baseURL: API_BASE, timeout: 30000, validateStatus: () => true, ...(proxy ? { proxy } : {}) });
  const res = await client.get(`${API_PREFIX}/runtime/jobs/get-job/${jobId}`, { headers });
  return res.data;
}

// ---- routes ----
app.get('/api/health', rateLimit({ windowMs: 60000, max: 60 }), async (req, res) => {
  const proxies = await fetchProxies();
  res.json({ ok: true, service: 'Noisy Uploader V2', engine: 'catbox.moe', router: ROUTER_KEY, proxies: proxies.length, maxUploadMB: 200, time: new Date().toISOString() });
});

// Uploader utama: Catbox.moe (credit flow: Ryusei Hoshino)
app.post('/api/catbox-upload', rateLimit({ windowMs: 60000, max: 10 }), catboxUpload.single('file'), async (req, res) => {
  const tmpPath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File wajib diisi (maks 200MB)' });
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', fs.createReadStream(tmpPath), { filename: req.file.originalname || 'file' });
    const t0 = Date.now();
    // Catbox kadang membalas 200 dengan body kosong (flaky/rate-limit sesaat).
    // Retry 3x dengan jeda singkat; ulangan hampir selalu sukses.
    let url = '';
    let lastRaw = '';
    for (let attempt = 1; attempt <= 3; attempt++) {
      const r = await axios.post(CATBOX_URL, form, {
        headers: { ...form.getHeaders(), 'User-Agent': CATBOX_UA, Referer: 'https://catbox.moe/' },
        timeout: 120000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        validateStatus: () => true
      });
      const candidate = (typeof r.data === 'string' ? r.data.trim() : '').split('\n')[0];
      if (r.status === 200 && candidate.startsWith('http')) {
        url = candidate;
        break;
      }
      lastRaw = String(r.data || '').slice(0, 300);
      if (attempt < 3) await new Promise((res) => setTimeout(res, 1500));
    }
    const elapsedMs = Date.now() - t0;
    if (!url) {
      return res.status(502).json({ success: false, message: 'Catbox menolak upload', raw: lastRaw });
    }
    let remoteSize = null;
    let remoteType = null;
    try {
      // HEAD catbox selalu content-length 0; pakai Range GET utk ukuran asli.
      const head = await axios.get(url, {
        headers: { 'User-Agent': CATBOX_UA, Range: 'bytes=0-0' },
        timeout: 15000,
        maxRedirects: 5,
        responseType: 'arraybuffer',
        validateStatus: () => true
      });
      remoteType = head.headers['content-type'] || null;
      if (head.status === 206) {
        const m = /\/\d+$/.exec(String(head.headers['content-range'] || ''));
        if (m) remoteSize = parseInt(m[0].slice(1), 10);
      } else if (head.status === 200) {
        const cl = parseInt(head.headers['content-length'], 10);
        if (!Number.isNaN(cl)) remoteSize = cl; // 0 = file kosong
      } else if (head.status === 404) {
        remoteSize = 0; // link mati
      }
    } catch { /* abaikan, link tetap valid */ }
    res.json({
      success: true,
      url,
      elapsedMs,
      file: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileSizeFormatted: formatSize(req.file.size),
        fileType: req.file.mimetype,
        uploadTime: new Date().toISOString(),
        remoteType,
        remoteSize
      }
    });
  } catch (e) {
    console.error('[catbox]', e.code || e.message);
    if (e.code === 'ECONNABORTED') return res.status(504).json({ success: false, message: 'Timeout ke Catbox (file besar/koneksi lambat). Coba file lebih kecil.' });
    res.status(500).json({ success: false, message: e.message || 'Upload gagal' });
  } finally {
    if (tmpPath) fs.unlink(tmpPath, () => {});
  }
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File gambar wajib diisi (JPG/PNG/WEBP, maks 12MB)' });
    const safeName = (req.file.originalname || 'upload.jpg').replace(/[^\w.\-]+/g, '_');
    const up = await apiUploadUrl(safeName);
    await axios.put(up.url, req.file.buffer, {
      headers: { 'Content-Type': req.file.mimetype },
      timeout: 60000,
      maxBodyLength: Infinity,
      validateStatus: () => true
    }).then((r) => {
      if (r.status !== 200) throw new Error('Upload ke OSS gagal (HTTP ' + r.status + ')');
    });
    const signedUrl = await apiSignObject(up.object_name);
    res.json({ success: true, imageUrl: signedUrl, objectName: up.object_name });
  } catch (e) {
    console.error('[upload]', e.message);
    res.status(500).json({ success: false, message: e.message || 'Upload gagal' });
  }
});

app.post('/api/fetch-upload', async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return res.status(400).json({ success: false, message: 'URL gambar tidak valid' });
    }
    const dl = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      maxContentLength: 12 * 1024 * 1024,
      headers: { 'User-Agent': UA },
      validateStatus: () => true
    });
    if (dl.status !== 200) return res.status(422).json({ success: false, message: 'Gagal unduh URL (HTTP ' + dl.status + ')' });
    const ct = dl.headers['content-type'] || '';
    if (!ct.startsWith('image/')) return res.status(422).json({ success: false, message: 'URL bukan gambar (content-type: ' + ct + ')' });
    const buf = Buffer.from(dl.data);
    if (buf.length > 12 * 1024 * 1024) return res.status(400).json({ success: false, message: 'Gambar dari URL melebihi 12MB' });
    const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : 'jpg';
    const up = await apiUploadUrl('from-url.' + ext);
    await axios.put(up.url, buf, { headers: { 'Content-Type': ct.split(';')[0] }, timeout: 60000, maxBodyLength: Infinity, validateStatus: () => true })
      .then((r) => { if (r.status !== 200) throw new Error('Upload ke OSS gagal'); });
    const signedUrl = await apiSignObject(up.object_name);
    res.json({ success: true, imageUrl: signedUrl });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Fetch upload gagal' });
  }
});

app.post('/api/remove', async (req, res) => {
  const { imageUrl } = req.body || {};
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
    return res.status(400).json({ success: false, message: 'imageUrl wajib berupa URL http(s). Upload dulu via /api/upload.' });
  }
  const proxies = await fetchProxies();
  // urutan coba: direct dulu, lalu proxy 0..4 (dibatasi agar total < ~3 menit; tiap attempt 35s)
  const attempts = [{ proxy: null, label: 'direct' }];
  for (let i = 0; i < Math.min(proxies.length, 4); i++) attempts.push({ proxy: proxies[i], label: `proxy-${i}` });

  let lastError = null;
  for (let i = 0; i < attempts.length; i++) {
    const { proxy, label } = attempts[i];
    try {
      console.log(`[remove] try ${label} url=${imageUrl.slice(0, 90)}`);
      const data = await apiCreateJob(imageUrl, proxy);
      const code = data?.code;
      if (code === 100000 && data?.result?.job_id) {
        const jobId = data.result.job_id;
        jobProxyMap.set(jobId, proxy);
        return res.json({ success: true, jobId, via: label });
      }
      if (code === 300017) {
        lastError = 'Limit gratis habis di jalur ' + label + ', coba jalur lain...';
        continue; // coba proxy berikutnya
      }
      if (code === 300003) {
        return res.status(422).json({ success: false, message: 'Gambar tidak lolos safety review. Ganti foto lain.', code });
      }
      if (code === 300008) {
        lastError = 'AI gagal memproses (URL mungkin 404/tidak bisa diunduh server). Pastikan pakai hasil /api/upload (signed URL).';
        // tetap coba jalur lain sekali, tapi kemungkinan besar input bermasalah
        continue;
      }
      lastError = data?.message?.en || data?.message?.id || ('API code ' + code);
    } catch (e) {
      if (e.code === 'ECONNABORTED') {
        lastError = `Timeout 35 dtk di jalur ${label} (server AI sibuk atau gambar terlalu besar).`;
      } else {
        lastError = e.code || e.message;
      }
      console.log(`[remove] ${label} error:`, lastError);
    }
  }
  return res.status(502).json({
    success: false,
    message: 'Semua jalur timeout/sibuk. ' + (lastError || '') + ' Coba lagi dengan foto JPG kecil (<2MB), upload ulang untuk URL fresh, lalu klik Hapus Watermark.',
    hint: 'API-nya hidup (cek diag: upload 0.3s, create fast-300017). Timeout terjadi saat server mengunduh/memproses gambar asli. Proxy diputar otomatis untuk bypass limit.'
  });
});

app.get('/api/job/:jobId', async (req, res) => {
  const { jobId } = req.params;
  if (!jobId) return res.status(400).json({ success: false, message: 'jobId wajib' });
  const savedProxy = jobProxyMap.get(jobId) || null;
  const proxies = await fetchProxies();
  const candidates = [];
  if (savedProxy) candidates.push(savedProxy);
  candidates.push(null);
  for (let i = 0; i < Math.min(proxies.length, 4); i++) {
    if (savedProxy && proxies[i].host === savedProxy.host) continue;
    candidates.push(proxies[i]);
  }
  let last = null;
  for (const px of candidates) {
    try {
      const data = await apiGetJob(jobId, px);
      if (data?.code === 100000) {
        const st = data.result || {};
        return res.json({
          success: true,
          status: st.status, // 0=processing, 1=done, -1=failed
          outputUrl: st.output_url || st.output_image_url || null,
          inputUrl: st.input_url || st.input_image_url || null,
          raw: data
        });
      }
      if (data?.code === 400202) {
        last = 'Job tidak ditemukan (mungkin gagal di create).';
        break; // tidak perlu coba proxy lain untuk failed job
      }
      last = data?.message?.en || JSON.stringify(data).slice(0, 200);
    } catch (e) {
      last = e.code || e.message;
    }
  }
  return res.json({ success: false, message: last || 'Belum ada hasil, coba poll lagi.' });
});

app.use((err, req, res, next) => {
  if (err?.message?.includes('Format harus')) return res.status(400).json({ success: false, message: err.message });
  if (err?.message?.includes('diblokir')) return res.status(400).json({ success: false, message: err.message });
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'File melebihi batas (uploader: 200MB)' });
  res.status(500).json({ success: false, message: err?.message || 'Server error' });
});

// SPA fallback: semua GET non-API dilayani index.html React (route /, /privacy.html, /terms.html).
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  const file = path.join(DIST, 'index.html');
  if (fs.existsSync(file)) return res.sendFile(file);
  if (req.path === '/') return res.sendFile(path.join(LEGACY, 'index.html'));
  next();
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Noisy Uploader V2 jalan di http://localhost:${PORT}`));
}
module.exports = app;
