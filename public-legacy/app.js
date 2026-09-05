/* Noisy Uploader Online - frontend (Catbox) */
const $ = (s) => document.querySelector(s);
const drop = $('#drop'), fileInput = $('#fileInput'), browseBtn = $('#browseBtn');
const dropIdle = $('#dropIdle'), dropPreview = $('#dropPreview');
const fileName = $('#fileName'), fileSub = $('#fileSub'), fileIco = $('#fileIco'), changeBtn = $('#changeBtn');
const goBtn = $('#goBtn'), errBox = $('#errBox'), statusLine = $('#statusLine');
const progress = $('#progress'), progressFill = $('#progressFill'), progressLabel = $('#progressLabel'), progressSize = $('#progressSize');
const resultEmpty = $('#resultEmpty'), resultDone = $('#resultDone');
const resLink = $('#resLink'), openBtn = $('#openBtn'), copyBtn = $('#copyBtn'), resMeta = $('#resMeta');
const histList = $('#histList'), clearHist = $('#clearHist');

let state = { file: null, uploading: false };

function showErr(msg) {
  if (!msg) { errBox.hidden = true; errBox.textContent = ''; return; }
  errBox.hidden = false; errBox.textContent = msg;
}
function setStatus(t) { statusLine.textContent = t; }

function friendlyErr(e, fallback) {
  const m = String(e?.message || e || '');
  if (e?.name === 'TypeError' || /failed to fetch|networkerror|load failed/i.test(m)) {
    if (location.protocol === 'file:') {
      return 'Backend tidak terjangkau karena file dibuka langsung (file://). Jalankan: npm start, lalu buka http://localhost:3000';
    }
    return 'Backend tidak terjangkau. Pastikan server jalan (npm start) dan Anda membuka http://localhost:3000.';
  }
  return m || fallback || 'Terjadi kesalahan jaringan.';
}

if (location.protocol === 'file:') {
  window.addEventListener('DOMContentLoaded', () => {
    showErr('Anda membuka via file:// sehingga /api/* tidak bisa diakses. Jalankan "npm start" lalu buka http://localhost:3000');
    setStatus('Server belum terhubung (file://).');
  });
}

function fmtSize(b) {
  if (b === 0) return '0 Bytes';
  const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + s[i];
}
function iconFor(name, type) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || type.startsWith('image/')) return 'ph-file-image';
  if (['mp4', 'webm', 'mkv'].includes(ext) || type.startsWith('video/')) return 'ph-file-video';
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext) || type.startsWith('audio/')) return 'ph-file-audio';
  if (['zip', 'rar', '7z'].includes(ext)) return 'ph-file-archive';
  if (['pdf'].includes(ext)) return 'ph-file-pdf';
  return 'ph-file-text';
}

const BLOCKED = ['exe', 'bat', 'cmd', 'msi', 'scr', 'ps1', 'com', 'pif'];
function setFile(f) {
  showErr('');
  if (!f) return;
  const ext = (f.name.split('.').pop() || '').toLowerCase();
  if (BLOCKED.includes(ext)) { showErr('Ekstensi .' + ext + ' diblokir demi keamanan.'); return; }
  if (f.size > 200 * 1024 * 1024) { showErr('File maksimal 200MB.'); return; }
  if (f.size === 0) { showErr('File kosong tidak bisa diupload.'); return; }
  state.file = f;
  fileName.textContent = f.name;
  fileSub.textContent = fmtSize(f.size) + ' • ' + (ext ? ext.toUpperCase() : (f.type || 'FILE'));
  fileIco.innerHTML = `<i class="ph-bold ${iconFor(f.name, f.type)}"></i>`;
  dropIdle.hidden = true; dropPreview.hidden = false;
  progress.hidden = true; progressFill.style.width = '0%';
  goBtn.disabled = false;
  setStatus('File siap. Klik Upload ke Catbox.');
}

browseBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
changeBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
drop.addEventListener('click', () => fileInput.click());
drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
fileInput.addEventListener('change', () => { if (fileInput.files[0]) setFile(fileInput.files[0]); });
['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.style.borderColor = 'var(--accent)'; }));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.style.borderColor = ''; }));
drop.addEventListener('drop', (e) => {
  const f = e.dataTransfer?.files?.[0];
  if (f) setFile(f);
});

// riwayat (localStorage)
function loadHist() {
  try { return JSON.parse(localStorage.getItem('noisy-uploads') || '[]'); } catch { return []; }
}
function saveHist(h) {
  try { localStorage.setItem('noisy-uploads', JSON.stringify(h.slice(0, 10))); } catch {}
}
function renderHist() {
  const h = loadHist();
  histList.innerHTML = '';
  if (!h.length) {
    const li = document.createElement('li');
    li.className = 'hist-empty mono';
    li.textContent = 'Belum ada upload.';
    histList.appendChild(li);
    return;
  }
  h.forEach((it) => {
    const li = document.createElement('li');
    li.className = 'hist-item';
    const a = document.createElement('a');
    a.href = it.url; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = `<i class="ph-bold ${iconFor(it.name, '')}"></i><span class="hist-name">${it.name}</span><span class="mono hist-size">${it.size || ''}</span>`;
    const c = document.createElement('button');
    c.className = 'icon-btn hist-copy';
    c.title = 'Salin link';
    c.innerHTML = '<i class="ph-bold ph-copy"></i>';
    c.addEventListener('click', () => copyText(it.url, 'Link riwayat disalin.'));
    li.append(a, c);
    histList.appendChild(li);
  });
}
function pushHist(name, url, size) {
  const h = loadHist().filter((x) => x.url !== url);
  h.unshift({ name, url, size, at: new Date().toISOString() });
  saveHist(h);
  renderHist();
}
clearHist.addEventListener('click', () => { saveHist([]); renderHist(); });

async function copyText(t, okMsg) {
  try {
    await navigator.clipboard.writeText(t);
    setStatus(okMsg || 'Disalin ke clipboard.');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = t;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); setStatus(okMsg || 'Disalin ke clipboard.'); }
    catch { showErr('Gagal menyalin otomatis. Salin manual: ' + t); }
    ta.remove();
  }
}
copyBtn.addEventListener('click', () => copyText(resLink.href, 'Link disalin. Bagikan ke siapa saja.'));
$('#demoCopy').addEventListener('click', () => copyText($('#demoUrl').textContent.trim(), 'Contoh link disalin.'));

// upload via XHR agar ada progress %
goBtn.addEventListener('click', () => {
  if (state.uploading) return;
  if (!state.file) { showErr('Pilih file dulu.'); return; }
  if (location.protocol === 'file:') { showErr('Anda membuka via file://. Jalankan "npm start" lalu buka http://localhost:3000'); return; }
  showErr('');
  state.uploading = true;
  goBtn.disabled = true;
  resultEmpty.hidden = true; resultDone.hidden = true;
  progress.hidden = false;
  progressFill.style.width = '0%';
  progressLabel.textContent = 'Mengupload… 0%';
  progressSize.textContent = fmtSize(state.file.size);
  setStatus('Mengupload ke Catbox…');

  const fd = new FormData();
  fd.append('file', state.file, state.file.name);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/catbox-upload');
  xhr.upload.addEventListener('progress', (e) => {
    if (!e.lengthComputable) return;
    const p = Math.round((e.loaded / e.total) * 100);
    progressFill.style.width = p + '%';
    progressLabel.textContent = `Mengupload… ${p}%`;
    progressSize.textContent = `${fmtSize(e.loaded)} / ${fmtSize(e.total)}`;
  });
  xhr.addEventListener('load', () => {
    state.uploading = false;
    goBtn.disabled = false;
    let j = null;
    try { j = JSON.parse(xhr.responseText); } catch { /* fallthrough */ }
    if (xhr.status < 200 || xhr.status >= 300 || !j?.success) {
      progressLabel.textContent = 'Upload gagal.';
      setStatus('Gagal. Perbaiki error di atas lalu coba lagi.');
      showErr(j?.message || `Upload gagal (HTTP ${xhr.status}). Coba file lebih kecil.`);
      return;
    }
    progressFill.style.width = '100%';
    progressLabel.textContent = 'Selesai 100%';
    resLink.href = j.url;
    resLink.textContent = j.url;
    openBtn.href = j.url;
    resMeta.textContent = `${j.file.fileName} • ${j.file.fileSizeFormatted} • ${j.elapsedMs}ms`;
    resultDone.hidden = false;
    setStatus('Selesai. Klik Salin Link.');
    pushHist(j.file.fileName, j.url, j.file.fileSizeFormatted);
    try { resultDone.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch {}
  });
  xhr.addEventListener('error', () => {
    state.uploading = false;
    goBtn.disabled = false;
    showErr(friendlyErr(new TypeError('Failed to fetch'), 'Upload gagal'));
    setStatus('Gagal. Pastikan server jalan lalu coba lagi.');
  });
  xhr.addEventListener('timeout', () => {
    state.uploading = false;
    goBtn.disabled = false;
    showErr('Timeout 2 menit (file besar/koneksi lambat). Coba file lebih kecil.');
    setStatus('Timeout. Coba lagi.');
  });
  xhr.timeout = 120000;
  xhr.send(fd);
});

// theme
const themeBtn = $('#themeBtn');
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  themeBtn.innerHTML = t === 'dark' ? '<i class="ph-bold ph-moon"></i>' : '<i class="ph-bold ph-sun"></i>';
  try { localStorage.setItem('noisy-theme', t); } catch {}
}
themeBtn.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
try {
  const saved = localStorage.getItem('noisy-theme');
  if (saved) setTheme(saved);
  else if (matchMedia('(prefers-color-scheme: light)').matches) setTheme('light');
  else setTheme('dark');
} catch { setTheme('dark'); }

// reveal
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
document.querySelectorAll('.section, .hero-visual, .strip').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
if (matchMedia('(prefers-reduced-motion: reduce)').matches) document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));

// faq accordion: smooth single-open
document.querySelectorAll('.faq-item').forEach((item) => {
  const btn = item.querySelector('.faq-q');
  btn.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach((o) => {
      o.classList.remove('open');
      o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// health (silent on fail agar aman saat deploy statis)
fetch('/api/health').then((r) => r.json()).then((j) => {
  if (j.ok) $('#healthMeta').textContent = `© 2026 Noisy Uploader • maks ${j.maxUploadMB || 200}MB • v1.0`;
}).catch(() => { /* biarkan teks statis */ });

renderHist();
