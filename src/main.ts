import "./App"

if (navigator.serviceWorker) {
    navigator.serviceWorker
        .register("sw.js")
        .then(() => {
            if (localStorage.getItem("sw-notified") !== "true") {
                document.querySelector("checkers-app")?.showSWReadyMessage()
                localStorage.setItem("sw-notified", "true")
            }
        })
        .catch(console.error)
}
