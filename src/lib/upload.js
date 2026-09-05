/* Port logika upload dari app.js lama (vanilla) ke modul React.
   Backend API tidak berubah: POST /api/catbox-upload (multipart "file").
   VITE_API_BASE opsional: kosong = API di domain yang sama (Vercel all-in-one),
   atau URL server API terpisah (mis. https://api-noisy.onrender.com) untuk deploy terpisah. */
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '');

export function fmtSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function iconFor(name, type = '') {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || type.startsWith('image/'))
    return 'ph-file-image';
  if (['mp4', 'webm', 'mkv'].includes(ext) || type.startsWith('video/')) return 'ph-file-video';
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext) || type.startsWith('audio/'))
    return 'ph-file-audio';
  if (['zip', 'rar', '7z'].includes(ext)) return 'ph-file-archive';
  if (['pdf'].includes(ext)) return 'ph-file-pdf';
  return 'ph-file-text';
}

export const BLOCKED = ['exe', 'bat', 'cmd', 'msi', 'scr', 'ps1', 'com', 'pif'];
export const MAX_MB = 200;
export const MAX_BYTES = 200 * 1024 * 1024;

export function friendlyErr(e, fallback) {
  const m = String(e?.message || e || '');
  if (e?.name === 'TypeError' || /failed to fetch|networkerror|load failed/i.test(m)) {
    return 'Backend tidak terjangkau. Pastikan server jalan (npm start) dan Anda membuka http://localhost:3000.';
  }
  return m || fallback || 'Terjadi kesalahan jaringan.';
}

/* XHR agar ada progress upload real. Resolve {ok, url, file, elapsedMs} atau {ok:false, message}. */
export function uploadFile(file, onProgress) {
  return new Promise((resolve) => {
    const fd = new FormData();
    fd.append('file', file, file.name);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_BASE + '/api/catbox-upload');
    xhr.timeout = 150000;

    xhr.upload.addEventListener('progress', (e) => {
      if (!e.lengthComputable) return;
      onProgress?.({
        pct: Math.round((e.loaded / e.total) * 100),
        loaded: e.loaded,
        total: e.total,
      });
    });

    xhr.addEventListener('load', () => {
      let j = null;
      try {
        j = JSON.parse(xhr.responseText);
      } catch {
        /* fallthrough */
      }
      if (xhr.status < 200 || xhr.status >= 300 || !j?.success) {
        resolve({ ok: false, message: j?.message || `Upload gagal (HTTP ${xhr.status}). Coba file lebih kecil.` });
        return;
      }
      resolve({ ok: true, url: j.url, file: j.file, elapsedMs: j.elapsedMs });
    });

    xhr.addEventListener('error', () => {
      resolve({ ok: false, message: friendlyErr(new TypeError('Failed to fetch'), 'Upload gagal') });
    });

    xhr.addEventListener('timeout', () => {
      resolve({ ok: false, message: 'Timeout 2 menit (file besar/koneksi lambat). Coba file lebih kecil.' });
    });

    xhr.send(fd);
  });
}

/* riwayat upload, tersimpan di localStorage perangkat (bukan server). */
const HIST_KEY = 'noisy-uploads';
const HIST_MAX = 10;

export function loadHist() {
  try {
    return JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
  } catch {
    return [];
  }
}

export function pushHist(name, url, size) {
  const h = loadHist().filter((x) => x.url !== url);
  h.unshift({ name, url, size, at: new Date().toISOString() });
  try {
    localStorage.setItem(HIST_KEY, JSON.stringify(h.slice(0, HIST_MAX)));
  } catch {
    /* ignore */
  }
  return h.slice(0, HIST_MAX);
}

export function clearHist() {
  try {
    localStorage.setItem(HIST_KEY, '[]');
  } catch {
    /* ignore */
  }
  return [];
}

export function removeHist(url) {
  const h = loadHist().filter((x) => x.url !== url);
  try {
    localStorage.setItem(HIST_KEY, JSON.stringify(h));
  } catch {
    /* ignore */
  }
  return h;
}

export async function copyText(t) {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = t;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }
}

export function validateFile(f) {
  const ext = (f.name.split('.').pop() || '').toLowerCase();
  if (BLOCKED.includes(ext)) return 'Ekstensi .' + ext + ' diblokir demi keamanan.';
  if (f.size > MAX_BYTES) return 'File maksimal 200MB.';
  if (f.size === 0) return 'File kosong tidak bisa diupload.';
  return null;
}
