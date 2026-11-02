/* Offline shell: the app opens with no signal; data calls always go to the network. Bump VERSION on every deploy. */
var VERSION = "cut-tracker-v11";
var SHELL = ["./", "./index.html", "./config.js", "./store.js", "./figures.js", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png", "./plan.css", "./plan.html", "./coach.html", "./core.html", "./cook.html"];
// The account library comes from a CDN. Without it cached, an offline open falls back to "this phone" mode with an empty log.
var LIBS = ["https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"];
function isLib(url){ return url.hostname === "cdn.jsdelivr.net" && (url.pathname.indexOf("/npm/@supabase/") === 0 || url.pathname.indexOf("/npm/zxing-wasm@") === 0); }

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(SHELL).then(function(){ return c.addAll(LIBS).catch(function(){}); }); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== VERSION; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin !== location.origin) {
    // Versioned CDN files never change: serve from cache, fetch once.
    if (!isLib(url)) return;
    e.respondWith(caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(res){ if (res.ok || res.type === "opaque") { var copy = res.clone(); caches.open(VERSION).then(function(c){ c.put(e.request, copy); }); } return res; });
    }));
    return;
  }
  // Network first so a new deploy shows up right away; cache when offline.
  e.respondWith(fetch(e.request).then(function(res){
    var copy = res.clone();
    caches.open(VERSION).then(function(c){ c.put(e.request, copy); });
    return res;
  }).catch(function(){ return caches.match(e.request).then(function(r){ return r || caches.match("./index.html"); }); }));
});
