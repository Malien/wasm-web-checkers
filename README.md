# prolog-web-checkers
Trying to run swipl in the browser using wasm, and making it easier to use swipl C FLI from JS/TS. That's all while trying to create a working client-side game of checkers. Now with Rust and JS implementations for comparison.

Safari is kinda fucked right now. Layout is, for some reason, out of whack. And there is not touch-icon meta thingy.

To build ~~jus `yarn install`, `yarn build` and `serve dist` via any http server of your choice. duh.~~

Hehehe, nope. First you gotta build rust project inside. Make sure you have rust toolchain and wasm-pack installed. Then you can do `yarn build:rs`, `yarn build` and `serve dist` via any http server of your choice. duh.
