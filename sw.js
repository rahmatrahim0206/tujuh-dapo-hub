// Service Worker DAPO-HUB (Versi Teroptimasi & Tangguh Offline)
// Menjamin aplikasi dapat berjalan 100% luring tanpa koneksi internet

const CACHE_NAME = 'dapohub-cache-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/2210/2210143.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js'
];

// Install: Simpan semua aset vital ke dalam cache saat instalasi awal
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mengamankan aset untuk mode luring...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Bersihkan cache versi lama agar data selalu diperbarui jika ada update resmi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Fetch: Mengambil data dari Cache terlebih dahulu saat offline, atau unduh di latar belakang jika online
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        // Jika ada di cache, langsung tampilkan (Sangat cepat & luring aman!)
        // Lakukan pembaruan senyap di latar belakang jika perangkat sedang terhubung internet
        if (navigator.onLine) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {/* Abaikan error fetch latar belakang */});
        }
        return cachedResponse;
      }

      // Jika tidak ada di cache, lakukan fetch ke jaringan biasa
      return fetch(event.request).catch(() => {
        // Jika gagal fetch dan offline, berikan fallback bersih untuk dokumen utama
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html', { ignoreSearch: true });
        }
      });
    })
  );
});