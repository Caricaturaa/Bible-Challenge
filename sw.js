/* Bible Challenge offline support */
var CACHE = "bc-v7";
var FILES = ["./", "index.html", "css/app.css?v=5", "css/social.css?v=7", "js/data.js?v=5", "js/core.js?v=5", "js/api.js?v=7", "js/games.js?v=5", "js/social.js?v=7", "manifest.webmanifest",
  "img/icon-192.jpg", "img/favicon-32.png"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== CACHE; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // always try the network first so updates arrive right away; use the saved copy when offline
  e.respondWith(fetch(e.request).then(function (r) {
    if (r && r.ok) { var c = r.clone(); caches.open(CACHE).then(function (x) { x.put(e.request, c); }); }
    return r;
  }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match("index.html"); }); }));
});
