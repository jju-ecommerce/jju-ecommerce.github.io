/* 쭈대표 AI 오피스 · service worker */
var CACHE = 'jju-office-v26';
var ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './assets/office-floorplan.jpg',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/logo-badge.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* HTTP 캐시에 남은 옛 파일을 쓰지 않고 새로 받습니다. */
      return Promise.all(ASSETS.map(function (url) {
        return c.add(new Request(url, { cache: 'reload' })).catch(function () { /* partial cache is fine */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
        return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

/* ---------------- 🔔 웹 푸시 알림 ---------------- */
var OFFICE_URL = 'https://jju-ecommerce.github.io/jju-office/';

self.addEventListener('push', function (e) {
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) {
    try { data = { body: e.data ? e.data.text() : '' }; } catch (e2) { data = {}; }
  }
  var title = data.title || '쭈대표 AI 오피스';
  var body = data.body || '새 글이 도착했어요.';
  var url = data.url || OFFICE_URL;
  var tag = data.tag || ('office-' + Date.now());

  e.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      tag: tag,
      renotify: true,
      icon: './icons/icon-192.png',
      badge: './icons/favicon-32.png',
      data: { url: url },
      vibrate: [90, 40, 90]
    })
  );
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var target = (e.notification.data && e.notification.data.url) || OFFICE_URL;

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url.indexOf('/jju-office/') !== -1 && 'focus' in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
      return null;
    })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== location.origin) return; /* Supabase REST calls go straight to the network */

  var dest = req.destination;
  var fresh = dest === 'document' || dest === 'script' || dest === 'style';

  if (fresh) {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match('./index.html'); });
      })
    );
    return;
  }

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html').then(function (hit) {
          return hit || caches.match('./');
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) {
        fetch(req).then(function (res) {
          if (res && res.ok) caches.open(CACHE).then(function (c) { c.put(req, res.clone()); });
        }).catch(function () {});
        return hit;
      }
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
