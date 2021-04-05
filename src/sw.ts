/// <reference lib="webworker" />
/// <reference lib="es2020" />

declare var self: ServiceWorkerGlobalScope
export {}

self.addEventListener("install", ev => {
    console.log("Installed service worker")

    ev.waitUntil(
        caches
            .open("caches-v1")
            .then(cache =>
                cache.addAll([
                    "/",
                    "/main.js",
                    "/worker.js",
                    "/main.pl",
                    "/swipl-wasm/swipl-web.js",
                    "/swipl-wasm/swipl-web.wasm",
                    "/swipl-wasm/swipl-web.data",
                ])
            )
    )
})

self.addEventListener("fetch", ev => {
    ev.respondWith(caches.match(ev.request).then(response => response || fetch(ev.request)))
})
