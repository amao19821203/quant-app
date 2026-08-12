// 量化选股 PWA Service Worker
// 网络优先 + 强制绕过 HTTP 缓存：在线时始终拉取最新部署（重新部署后立即生效，不被 GitHub Pages 的 10 分钟 Cache-Control 卡住）；
// 离线时回退到上次缓存，保证手机无网也能打开查看。
const CACHE = 'quant-v2';

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
      // cache:'no-cache' 强制向服务器重新校验，确保拿到最新 HTML（不被浏览器/边缘缓存的 10 分钟 max-age 拖住）
      const net = await fetch(req, {cache: 'no-cache'});
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
