import { expose } from "comlink"
import { AnyFunction } from "../util"
import init, { movesFor, availableMoves, canEat, initializeBoard } from "./checkers/pkg/checkers-rs"
import { RSWorkerInterface, RSWorkerProxy } from "./types"

// init("/checkers-rs.wasm").then(() => {
//     console.log("sizes", sizes())
//     const board = initializeBoard()
//     console.log("initialized board", board)
//     console.log("moves", movesFor(board, [2, 5]))
//     // const position: Position = [2, 5]
//     // const start = performance.now()
//     // for (let i=0; i<10000; ++i) {
//     //     movesFor(board, position)
//     // }
//     // console.log(performance.now() - start)
//     console.log("availableMoves", availableMoves(board, "white"))
// })

const ready = init("/checkers-rs.wasm").then(() => {})

const readify = <F extends AnyFunction>(
    f: F
): ((...args: Parameters<F>) => Promise<ReturnType<F>>) => async (...args) => {
    await ready
    return f(...args)
}

const workerInterface: RSWorkerProxy = {
    initializeBoard: readify(initializeBoard),
    availableMoves: readify(availableMoves),
    movesFor: readify(movesFor),
    canEat: readify(canEat),
    ready,
}

expose(workerInterface)
