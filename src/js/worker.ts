import { expose } from "comlink"
import { allocateArray } from "../util"
import type {
    Cell,
    GameBoard,
    Position,
    Player,
    Piece,
    ValidPosition,
    SearchAlgorithm,
} from "../common"
import type { JSWorkerInterface, JSMove } from "./types"

const boundCheck = (pos: Position): pos is ValidPosition => {
    const [x, y] = pos
    return x >= 0 && x < 8 && y >= 0 && y < 8
}

const boundsException = ([x, y]: Position) => new Error(`Position [${x}, ${y}] is out of bounds`)

const elementAt = (board: GameBoard, pos: Position) => {
    if (boundCheck(pos)) {
        const [x, y] = pos
        return board[y][x]
    } else throw boundsException(pos)
}

const copyBoard = (board: GameBoard) =>
    allocateArray(8).map((_, idx) => [...board[idx]!]) as GameBoard

// Modifies board object
const replace = (board: GameBoard, pos: Position, cell: Cell) => {
    if (boundCheck(pos)) {
        const [x, y] = pos
        board[y][x] = cell
    } else throw boundsException(pos)
}

function promote(y: 7, piece: "b"): "bq"
function promote(y: number, piece: "b"): "b" | "bq"
function promote(y: 0, piece: "w"): "wq"
function promote(y: number, piece: "w"): "w" | "wq"
function promote<C extends Cell>(y: number, piece: C): C
function promote(y: number, piece: Cell) {
    if (piece === "b" && y === 7) return "bq"
    if (piece === "w" && y === 0) return "wq"
    return piece
}

// Modified board object
const remove = (fromBoard: GameBoard, pos: Position) => replace(fromBoard, pos, "1")

// Modified board object
const move = (board: GameBoard, from: Position, to: Position) => {
    replace(board, to, promote(to[1], elementAt(board, from)))
    remove(board, from)
}

const playerAffiliationMap: Record<Piece, Player> = {
    b: "black",
    bq: "black",
    w: "white",
    wq: "white",
}

function playerAffiliation(piece: Piece): Player
function playerAffiliation(cell: Cell): Player | undefined
function playerAffiliation(cell: Cell): Player | undefined {
    return playerAffiliationMap[cell as Piece]
}

const isOccupied = (board: GameBoard, pos: Position) => elementAt(board, pos) !== "1"
const isEnemy = (board: GameBoard, pos: Position, player: Player) => {
    const otherPlayer = playerAffiliation(elementAt(board, pos))
    if (!otherPlayer) return false
    return player !== otherPlayer
}

type MoveHandler = (board: GameBoard, from: Position, piece: Piece) => JSMove | undefined

const add = (a: number, b: number) => a + b
const subtract = (a: number, b: number) => a - b

const ifPlayer = (isPlayer: Player, handler: MoveHandler): MoveHandler => (board, from, piece) => {
    if (isEnemy(board, from, isPlayer)) return undefined
    return handler(board, from, piece)
}

const ifPiece = (isPiece: Piece, handler: MoveHandler): MoveHandler => (board, from, piece) => {
    if (piece !== isPiece) return undefined
    return handler(board, from, piece)
}

const ifCheckedPosition = (
    check: (pos: Position) => boolean,
    handler: MoveHandler
): MoveHandler => (board, from, piece) => {
    if (!check(from)) return undefined
    return handler(board, from, piece)
}

const eatHandler = (
    xoffset: (a: number, b: number) => number,
    yoffset: (a: number, b: number) => number
): MoveHandler => (board, from, piece) => {
    const [x, y] = from
    const jumpOver: Position = [xoffset(x, 1), yoffset(y, 1)]
    const to: Position = [xoffset(x, 2), yoffset(y, 2)]
    const condition = isEnemy(board, jumpOver, playerAffiliation(piece)) && !isOccupied(board, to)
    if (!condition) return undefined

    const nextBoard = copyBoard(board)
    move(nextBoard, from, to)
    remove(nextBoard, jumpOver)
    return { from, to, nextBoard }
}

const moveHandler = (
    xoffset: (a: number, b: number) => number,
    yoffset: (a: number, b: number) => number
): MoveHandler => (board, from) => {
    const [x, y] = from
    const to: Position = [xoffset(x, 1), yoffset(y, 1)]
    if (isOccupied(board, to)) return undefined
    const nextBoard = copyBoard(board)
    move(nextBoard, from, to)
    return { from, to, nextBoard }
}

const topLeftEat = ifCheckedPosition(([x, y]) => x > 1 && y > 1, eatHandler(subtract, subtract))
const topRightEat = ifCheckedPosition(([x, y]) => x < 6 && y > 1, eatHandler(add, subtract))
const bottomLeftEat = ifCheckedPosition(([x, y]) => x > 1 && y < 6, eatHandler(subtract, add))
const bottomRightEat = ifCheckedPosition(([x, y]) => x < 6 && y < 6, eatHandler(add, add))

const eatHandlers = [
    ifPlayer("white", topLeftEat),
    ifPlayer("white", topRightEat),
    ifPlayer("black", bottomLeftEat),
    ifPlayer("black", bottomRightEat),

    ifPiece("wq", bottomLeftEat),
    ifPiece("wq", bottomRightEat),
    ifPiece("bq", topLeftEat),
    ifPiece("bq", topRightEat),
]

const topLeftMove = ifCheckedPosition(([x, y]) => x > 0 && y > 0, moveHandler(subtract, subtract))
const topRightMove = ifCheckedPosition(([x, y]) => x < 7 && y > 0, moveHandler(add, subtract))
const bottomLeftMove = ifCheckedPosition(([x, y]) => x > 0 && y < 7, moveHandler(subtract, add))
const bottomRightMove = ifCheckedPosition(([x, y]) => x < 7 && y < 7, moveHandler(add, add))

const moveHandlers = [
    ifPlayer("white", topLeftMove),
    ifPlayer("white", topRightMove),
    ifPlayer("black", bottomLeftMove),
    ifPlayer("black", bottomRightMove),

    ifPiece("wq", bottomLeftMove),
    ifPiece("wq", bottomRightMove),
    ifPiece("bq", topLeftMove),
    ifPiece("bq", topRightMove),
]

function* playerPositions(board: GameBoard, player: Player) {
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            const position: Position = [j, i]
            const element = elementAt(board, position)
            if (player === playerAffiliation(element)) {
                yield { position, piece: element as Piece }
            }
        }
    }
}

function* validMoves(handlers: MoveHandler[], board: GameBoard, position: Position, piece: Piece) {
    for (const handler of handlers) {
        const move = handler(board, position, piece)
        if (move) yield move
    }
}

function* chainEatMoves(board: GameBoard, position: Position, piece: Piece): Generator<JSMove> {
    for (const move of validMoves(eatHandlers, board, position, piece)) {
        const hadMore = false
        for (const chainMove of chainEatMoves(move.nextBoard, move.to, piece)) {
            yield chainMove
        }
        if (!hadMore) yield move
    }
}

const canPlayerMakeEatMove = (board: GameBoard, player: Player) => {
    for (const { position, piece } of playerPositions(board, player)) {
        if (existsEatMove(board, position, piece)) return true
    }
    return false
}

const existsEatMove = (board: GameBoard, position: Position, piece: Piece) => {
    for (const _ of validMoves(eatHandlers, board, position, piece)) {
        return true
    }
    return false
}

const nextPlayer: Record<Player, Player> = {
    black: "white",
    white: "black",
}

const pieceValueMap: Record<Cell, number> = {
    0: 0,
    1: 0,
    w: 1,
    b: -1,
    wq: 5,
    bq: -5,
}

const pieceValue = (cell: Cell) => pieceValueMap[cell]

const hasMoves = (board: GameBoard, player: Player) => {
    for (const { position, piece } of playerPositions(board, player)) {
        for (const _ of validMoves(moveHandlers, board, position, piece)) {
            return true
        }
        for (const _ of validMoves(eatHandlers, board, position, piece)) {
            return true
        }
    }
    return false
}

const evaluateBoard = (board: GameBoard) => {
    if (!hasMoves(board, "white")) return -200
    if (!hasMoves(board, "black")) return 200
    return board.flat().map(pieceValue).reduce(add, 0)
}

function isMinimizingPlayer(player: "black"): true
function isMinimizingPlayer(player: "white"): false
function isMinimizingPlayer(player: Player): player is "black"
function isMinimizingPlayer(player: Player): player is "black" {
    return player === "black"
}

function minimax(
    board: GameBoard,
    player: Player,
    depth: 0
): [move: null, score: number] | undefined
function minimax(
    board: GameBoard,
    player: Player,
    depth: number
): [move: JSMove | null, score: number] | undefined
function minimax(board: GameBoard, player: Player, depth: number) {
    if (depth == 0) {
        return [null, evaluateBoard(board)] as const
    }

    const moves = availableMoves(board, player)
    if (isMinimizingPlayer(player)) {
        return minimizeMoves(moves, nextPlayer[player], depth - 1)
    } else {
        return maximizeMoves(moves, nextPlayer[player], depth - 1)
    }
}

const bestMove = (init: number, cmp: (a: number, b: number) => boolean) => (
    moves: Iterable<JSMove>,
    player: Player,
    depth: number
): EvaluationResult | undefined => {
    let score = init
    let move: JSMove | undefined
    for (const currentMove of moves) {
        const res = minimax(currentMove.nextBoard, player, depth)
        const currentScore = res ? res[1] : evaluateBoard(currentMove.nextBoard)
        if (cmp(currentScore, score)) {
            score = currentScore
            move = currentMove
        }
    }
    return move && [move, score]
}

const less = (a: number, b: number) => a < b
const greater = (a: number, b: number) => a > b

const minimizeMoves = bestMove(Number.POSITIVE_INFINITY, less)
const maximizeMoves = bestMove(Number.NEGATIVE_INFINITY, greater)

const alphabeta = (
    board: GameBoard,
    player: Player,
    alpha: number,
    beta: number,
    depth: number
) => {
    if (depth == 0) {
        return [null, evaluateBoard(board)] as const
    }

    const moves = availableMoves(board, player)
    if (isMinimizingPlayer(player)) {
        let score = Number.POSITIVE_INFINITY
        let move: JSMove | undefined
        for (const currentMove of moves) {
            const res = alphabeta(currentMove.nextBoard, nextPlayer[player], alpha, beta, depth - 1)
            const currentScore = res ? res[1] : evaluateBoard(currentMove.nextBoard)
            if (currentScore < score) {
                score = currentScore
                move = currentMove
                beta = Math.min(beta, score)
            }
            if (beta <= alpha) break
        }
        return move && ([move, score] as const)
    } else {
        let score = Number.NEGATIVE_INFINITY
        let move: JSMove | undefined
        for (const currentMove of moves) {
            const res = alphabeta(currentMove.nextBoard, nextPlayer[player], alpha, beta, depth - 1)
            const currentScore = res ? res[1] : evaluateBoard(currentMove.nextBoard)
            if (currentScore > score) {
                score = currentScore
                move = currentMove
                alpha = Math.max(alpha, score)
            }
            if (alpha >= beta) break
        }
        return move && ([move, score] as const)
    }
}

function* availableMoves(board: GameBoard, player: Player) {
    let hadEats = false
    for (const { position, piece } of playerPositions(board, player)) {
        for (const move of chainEatMoves(board, position, piece)) {
            hadEats = true
            yield move
        }
    }
    if (!hadEats) {
        for (const { position, piece } of playerPositions(board, player)) {
            for (const move of validMoves(moveHandlers, board, position, piece)) {
                yield move
            }
        }
    }
}

const movesFor = (board: GameBoard, position: Position) => {
    const cell = elementAt(board, position)
    if (cell === "0" || cell === "1") return []
    const player = playerAffiliation(cell)
    if (canPlayerMakeEatMove(board, player)) {
        return [...chainEatMoves(board, position, cell)]
    }
    return [...validMoves(moveHandlers, board, position, cell)]
}

const canEat = (board: GameBoard, player: Player) =>
    [...playerPositions(board, player)]
        .filter(({ position, piece }) => existsEatMove(board, position, piece))
        .map(v => v.position)

type EvaluationResult = [move: JSMove, score: number]

const evaluateBestMove = (
    board: GameBoard,
    player: Player,
    algorithm: SearchAlgorithm,
    searchDepth: number
): EvaluationResult | undefined => {
    if (algorithm === "minimax") {
        return minimax(board, player, searchDepth) as EvaluationResult | undefined
    } else if (algorithm === "alphabeta") {
        return alphabeta(
            board,
            player,
            Number.NEGATIVE_INFINITY,
            Number.POSITIVE_INFINITY,
            searchDepth
        ) as EvaluationResult | undefined
    }
    throw new Error("Not implemented")
}

const workerInterface: JSWorkerInterface = {
    movesFor,
    canEat,
    evaluateBestMove,
    availableMoves(board, player) {
        return [...availableMoves(board, player)]
    },
}

expose(workerInterface)
