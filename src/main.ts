import "./App"
import { Position } from "./common"

import init, { sizes, initializeBoard, movesFor } from "./rs/checkers/pkg/checkers_rs"
init("/checkers-rs.wasm").then(() => {
    console.log("sizes", sizes())
    const board = initializeBoard()
    console.log("initialized board", board)
    console.log("moves", movesFor(board, [2, 5]))
    const position: Position = [2, 5]
    const start = performance.now()
    for (let i=0; i<10000; ++i) {
        movesFor(board, position)
    }
    console.log(performance.now() - start)
})
