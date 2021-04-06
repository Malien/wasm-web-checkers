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
                    "/styles.css",
                    "/manifest.json",
                    "/main.js",
                    "/worker.js",
                    "/main.pl",
                    "/icon@1x.png",
                    "/icon@1.5x.png",
                    "/icon@2x.png",
                    "/icon@3x.png",
                    "/icon@4x.png",
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
