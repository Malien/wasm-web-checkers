import * as comlink from "comlink"
import { Disposable, Tuple } from "../util"
import type { GameBoard, GameLogicEngine, Move } from "../common"
import type { RSWorkerProxy, RSMove } from "./types"

export const testBoards: Tuple<GameBoard, 6> = [
    [
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "b", "0", "b", "0"],
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "b", "0", "1", "0", "1", "0"],
        ["0", "w", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
    ],
    [
        ["0", "b", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "w", "0", "1", "0", "1", "0"],
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
        ["0", "1", "0", "b", "0", "b", "0", "1"],
        ["1", "0", "1", "0", "w", "0", "w", "0"],
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
    ],
    [
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
        ["0", "1", "0", "w", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
    ],
    [
        ["0", "b", "0", "b", "0", "b", "0", "1"],
        ["w", "0", "1", "0", "1", "0", "b", "0"],
        ["0", "1", "0", "1", "0", "1", "0", "w"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
    ],
    [
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["wq", "0", "1", "0", "1", "0", "1", "0"],
        ["0", "bq", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
    ],
    [
        ["0", "b", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "w", "0", "1", "0", "1", "0"],
        ["0", "1", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
        ["0", "1", "0", "b", "0", "b", "0", "1"],
        ["1", "0", "1", "0", "w", "0", "w", "0"],
        ["0", "w", "0", "1", "0", "1", "0", "1"],
        ["1", "0", "1", "0", "1", "0", "1", "0"],
    ],
]

export class RSGameLogic implements GameLogicEngine, Disposable {
    private moveAugmentations = new WeakMap<Move, GameBoard>()
    private proxy: comlink.Remote<RSWorkerProxy>
    private worker: Worker

    ready = Promise.resolve()

    constructor(workerFile: string = "rs-worker.js", workerName: string = "rs-game-logic-worker") {
        this.worker = new Worker(workerFile, { name: workerName, type: "classic" })
        this.proxy = comlink.wrap(this.worker)
    }

    private simplifyMoves = (moves: RSMove[]) => moves.map(this.simplifyMove)

    private simplifyMove = ({ from, to, nextBoard }: RSMove) => {
        const move = { from, to }
        this.moveAugmentations.set(move, nextBoard)
        return move
    }

    testBoard: GameLogicEngine["testBoard"] = idx => Promise.resolve(testBoards[idx - 1]!)

    initializeBoard: GameLogicEngine["initializeBoard"] = () => this.proxy.initializeBoard()

    movesFor: GameLogicEngine["movesFor"] = (board, position) =>
        this.proxy.movesFor(board, position).then(this.simplifyMoves)

    canEat: GameLogicEngine["canEat"] = (board, player) => this.proxy.canEat(board, player)

    evaluateBestMove: GameLogicEngine["evaluateBestMove"] = async (
        board,
        player,
        algorithm,
        searchDepth
    ) => {
        throw new Error("Not implemented")
        // const res = await this.worker.evaluateBestMove(board, player, algorithm, searchDepth)
        // if (!res) return undefined
        // const [move, score] = res
        // return [this.simplifyMove(move), score]
    }

    nextBoard: GameLogicEngine["nextBoard"] = move => {
        const board = this.moveAugmentations.get(move)
        if (!board)
            throw new Error(
                "Board object cannot be retrieved from provided move." +
                    "Have you provided move object from another module?"
            )
        return Promise.resolve(board)
    }

    encodeBoard(board: GameBoard) {
        return Promise.resolve(board)
    }

    dispose() {
        this.proxy[comlink.releaseProxy]()
        this.worker.terminate()
    }
}
