import * as comlink from "comlink"
import { allocateArray, Disposable, Tuple } from "../util"
import type { BoardRow, Cell, GameBoard, GameLogicEngine, Move, Player, Position } from "../common"
import * as workerTypes from "./common"

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

const fromWorkerPosition = ({ x, y }: workerTypes.Position): Position => [x, y]
const fromWorkerBoard = (board: workerTypes.GameBoard): GameBoard => [
    fromWorkerRow(board, 0),
    fromWorkerRow(board, 1),
    fromWorkerRow(board, 2),
    fromWorkerRow(board, 3),
    fromWorkerRow(board, 4),
    fromWorkerRow(board, 5),
    fromWorkerRow(board, 6),
    fromWorkerRow(board, 7),
]

const fromWorkerRow = (board: workerTypes.GameBoard, y: number): BoardRow => [
    fromWorkerCell(board, 0, y),
    fromWorkerCell(board, 1, y),
    fromWorkerCell(board, 2, y),
    fromWorkerCell(board, 3, y),
    fromWorkerCell(board, 4, y),
    fromWorkerCell(board, 5, y),
    fromWorkerCell(board, 6, y),
    fromWorkerCell(board, 7, y),
]

const fromWorkerCell = (board: workerTypes.GameBoard, x: number, y: number): Cell => {
    switch (board[y * 8 + x] as workerTypes.Cell) {
        case workerTypes.Cell.White:
            return "0"
        case workerTypes.Cell.Black:
            return "1"
        case workerTypes.Cell.WhitePiece:
            return "w"
        case workerTypes.Cell.BlackPiece:
            return "b"
        case workerTypes.Cell.WhiteQueen:
            return "wq"
        case workerTypes.Cell.BlackQueen:
            return "bq"
    }
}

const toWorkerCell = (cell: Cell): workerTypes.Cell => {
    switch (cell) {
        case "0":
            return workerTypes.Cell.White
        case "1":
            return workerTypes.Cell.Black
        case "w":
            return workerTypes.Cell.WhitePiece
        case "b":
            return workerTypes.Cell.BlackPiece
        case "wq":
            return workerTypes.Cell.WhiteQueen
        case "bq":
            return workerTypes.Cell.BlackQueen
    }
}

const toWorkerBoard = (board: GameBoard): workerTypes.GameBoard =>
    Uint8Array.from(board.flat(), toWorkerCell)

const toWorkerPosition = ([x, y]: Position): workerTypes.Position => ({ x, y })

const toWorkerPlayer = (player: Player): workerTypes.Player => {
    switch (player) {
        case "white":
            return workerTypes.Player.White
        case "black":
            return workerTypes.Player.Black
    }
}

export class JSGameLogic implements GameLogicEngine, Disposable {
    private moveAugmentations = new WeakMap<Move, workerTypes.GameBoard>()
    private proxy: comlink.Remote<workerTypes.JSWorkerProxy>
    private worker: Worker

    ready = Promise.resolve()

    constructor(workerFile: string = "js-worker.js", workerName: string = "js-game-logic-worker") {
        this.worker = new Worker(workerFile, { name: workerName, type: "classic" })
        this.proxy = comlink.wrap(this.worker)
    }

    private simplifyMoves = (moves: workerTypes.JSMove[]) => moves.map(this.simplifyMove)

    private simplifyMove = ({ from, to, nextBoard }: workerTypes.JSMove): Move => {
        const move = { from: fromWorkerPosition(from), to: fromWorkerPosition(to) }
        this.moveAugmentations.set(move, nextBoard)
        return move
    }

    testBoard: GameLogicEngine["testBoard"] = idx => Promise.resolve(testBoards[idx - 1]!)

    initializeBoard: GameLogicEngine["initializeBoard"] = () => Promise.resolve(initializedBoard)

    movesFor: GameLogicEngine["movesFor"] = (board, position) =>
        this.proxy
            .movesFor(toWorkerBoard(board), toWorkerPosition(position))
            .then(this.simplifyMoves)

    async canEat(board: GameBoard, player: Player) {
        const positions = await this.proxy.canEat(toWorkerBoard(board), toWorkerPlayer(player))
        return positions.map(fromWorkerPosition)
    }

    evaluateBestMove: GameLogicEngine["evaluateBestMove"] = async (
        board,
        player,
        algorithm,
        searchDepth
    ) => {
        const res = await this.proxy.evaluateBestMove(
            toWorkerBoard(board),
            toWorkerPlayer(player),
            algorithm,
            searchDepth
        )
        if (!res) return undefined
        const [move, score] = res
        return [this.simplifyMove(move), score]
    }

    nextBoard: GameLogicEngine["nextBoard"] = move => {
        const board = this.moveAugmentations.get(move)
        if (!board)
            throw new Error(
                "Board object cannot be retrieved from provided move." +
                    "Have you provided move object from another module?"
            )
        return Promise.resolve(fromWorkerBoard(board))
    }

    encodeBoard(board: GameBoard) {
        return Promise.resolve(board)
    }

    dispose() {
        this.proxy[comlink.releaseProxy]()
        this.worker.terminate()
    }
}
