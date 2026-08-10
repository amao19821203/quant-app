// 量化选股 PWA Service Worker
// 网络优先：在线时始终拉取最新部署（重新部署后立即生效）；
// 离线时回退到上次缓存，保证手机无网也能打开查看。
const CACHE = 'quant-v1';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith((async function () {
    try {
      const net = await fetch(req);
      const c = await caches.open(CACHE);
      c.put(req, net.clone());
      return net;
    } catch (err) {
      const c = await caches.open(CACHE);
      const hit = await c.match(req);
      return hit || Response.error();
    }
  })());
});
