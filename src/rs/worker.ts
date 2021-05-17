import { expose } from "comlink"
import { AnyFunction } from "../util"
import init, { movesFor, availableMoves, canEat, initializeBoard, minimax, alphabeta } from "./checkers/pkg/checkers-rs"
import { RSWorkerProxy } from "./types"

const ready = init("checkers-rs.wasm").then(() => {})

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
    async evaluateBestMove(board, player, algorithm, searchDepth) {
        await ready
        if (algorithm === "minimax") {
            return minimax(board, player, searchDepth)
        } else {
            return alphabeta(board, player, searchDepth)
        }
    },
    ready,
}

expose(workerInterface)
