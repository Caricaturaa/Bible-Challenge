/* Bible Challenge offline support */
var CACHE = "bc-v11";
var FILES = ["./", "index.html", "css/app.css?v=5", "css/social.css?v=9", "js/data.js?v=5", "js/core.js?v=5", "js/api.js?v=10", "js/games.js?v=5", "js/social.js?v=11", "manifest.webmanifest",
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

/* incoming call notifications */
self.addEventListener("push", function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: "Bible Challenge", body: e.data ? e.data.text() : "" }; }
  var call = d.type === "call", url = call ? "./?call=" + d.call_id : "./";
  // a call keeps "ringing": each alert replaces the last one so the phone sounds again
  var prep = call ? self.registration.getNotifications().then(function (ns) { ns.forEach(function (n) { if (n.tag && n.tag.indexOf("call-" + d.call_id) === 0) n.close(); }); }).catch(function () {}) : Promise.resolve();
  e.waitUntil(prep.then(function () {
    return self.registration.showNotification(d.title || "Bible Challenge", {
      body: d.body || "", icon: "img/icon-192.jpg", badge: "img/favicon-32.png",
      tag: call ? "call-" + d.call_id + "-" + (d.n || 0) : "bc", renotify: true, requireInteraction: call, silent: false,
      vibrate: [600, 300, 600, 300, 600], data: { url: url, type: d.type, id: d.call_id }
    });
  }));
});
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var d = e.notification.data || {};
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if ("focus" in c) { if (d.type === "call") c.postMessage({ type: "call", id: d.id }); return c.focus(); }
    }
    return self.clients.openWindow(d.url || "./");
  }));
});
