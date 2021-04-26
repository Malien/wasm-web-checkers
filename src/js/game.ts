import * as comlink from "comlink"
import { allocateArray, Tuple } from "../util"
import {
    BoardRow,
    Cell,
    GameBoard,
    GameLogicModule,
    JSMove,
    JSWorkerProxy,
    Move,
} from "../common"

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

export const repeat = <N extends number, T>(arr: T[], times: N) =>
    allocateArray(times).flatMap(() => arr)

const boardRow = (withPieces: Cell) => repeat(["0", withPieces], 4) as BoardRow
const offsetBoardRow = (withPieces: Cell) => repeat([withPieces, "0"], 4) as BoardRow

export const initializedBoard: GameBoard = [
    boardRow("b"),
    offsetBoardRow("b"),
    boardRow("b"),
    offsetBoardRow("1"),
    boardRow("1"),
    offsetBoardRow("w"),
    boardRow("w"),
    offsetBoardRow("w"),
]

export class JSGameLogic implements GameLogicModule {
    private moveAugmentations = new WeakMap<Move, GameBoard>()
    private worker: comlink.Remote<JSWorkerProxy>

    ready = Promise.resolve()

    constructor(workerFile: string = "js-worker.js", workerName: string = "js-game-logic-worker") {
        const worker = new Worker(workerFile, { name: workerName, type: "classic" })
        this.worker = comlink.wrap(worker)
    }

    private simplifyMoves = (moves: JSMove[]) => moves.map(this.simplifyMove)

    private simplifyMove = ({ from, to, nextBoard }: JSMove) => {
        const move = { from, to }
        this.moveAugmentations.set(move, nextBoard)
        return move
    }

    testBoard: GameLogicModule["testBoard"] = idx =>
        Promise.resolve(testBoards[idx - 1]!)

    initializeBoard: GameLogicModule["initializeBoard"] = () =>
        Promise.resolve(initializedBoard)

    movesFor: GameLogicModule["movesFor"] = (board, position) =>
        this.worker.movesFor(board, position).then(this.simplifyMoves)

    canEat: GameLogicModule["canEat"] = (board, player) => this.worker.canEat(board, player)

    evaluateBestMove: GameLogicModule["evaluateBestMove"] = async (
        board,
        player,
        algorithm,
        searchDepth
    ) => {
        const res = await this.worker.evaluateBestMove(board, player, algorithm, searchDepth)
        if (!res) return undefined
        const [move, score] = res
        return [this.simplifyMove(move), score]
    }

    nextBoard: GameLogicModule["nextBoard"] = move => {
        const board = this.moveAugmentations.get(move)
        if (!board)
            throw new Error(
                "Board object cannot be retrieved from provided move." +
                    "Have you provided move object from another module?"
            )
        return Promise.resolve(board)
    }
    
    encodeBoard: GameLogicModule["encodeBoard"] = Promise.resolve
}
