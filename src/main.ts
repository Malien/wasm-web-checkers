import "./App"

import init, { sizes, initializeBoard } from "./rs/checkers/pkg/checkers_rs"
init("/checkers-rs.wasm").then(() => {
    console.log("sizes", sizes())
    console.log("initialized board", initializeBoard())
})
