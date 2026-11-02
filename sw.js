/* Offline shell: the app opens with no signal; data calls always go to the network. Bump VERSION on every deploy. */
var VERSION = "cut-tracker-v10";
var SHELL = ["./", "./index.html", "./config.js", "./store.js", "./figures.js", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png", "./plan.css", "./plan.html", "./coach.html", "./core.html", "./cook.html"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== VERSION; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Network first so a new deploy shows up right away; cache when offline.
  e.respondWith(fetch(e.request).then(function(res){
    var copy = res.clone();
    caches.open(VERSION).then(function(c){ c.put(e.request, copy); });
    return res;
  }).catch(function(){ return caches.match(e.request).then(function(r){ return r || caches.match("./index.html"); }); }));
});
