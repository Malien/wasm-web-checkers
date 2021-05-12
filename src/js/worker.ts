import { expose } from "comlink"
import { SearchAlgorithm } from "../common"
import { JSWorkerInterface, JSMove, Cell, Player, Piece, GameBoard, Position } from "./common"


const pieceBit = (cell: Cell) => (cell >> 2) & 1
const queenBit = (cell: Cell) => (cell >> 1) & 1
const colorBit = (cell: Cell) => cell & 1
const cellToPiece = (cell: Cell) => (cell & 0b011) as Piece
const cellColor = (cell: Cell) => colorBit(cell) as Player

const piecePlayer = (piece: Piece) => (piece & 1) as Player

const cellAt = (board: GameBoard, { x, y }: Position) => board[y * 8 + x] as Cell

const copyBoard = (board: GameBoard) => new Uint8Array(board) as GameBoard

// Modifies board object
const replace = (board: GameBoard, { x, y }: Position, cell: Cell) => {
    board[y * 8 + x] = cell
}

function promote(y: number, piece: Cell) {
    if (piece === Cell.BlackPiece && y === 7) return Cell.BlackQueen
    if (piece === Cell.WhitePiece && y === 0) return Cell.WhiteQueen
    return piece
}

// Modified board object
const remove = (fromBoard: GameBoard, pos: Position) => replace(fromBoard, pos, Cell.Black)

// Modified board object
const move = (board: GameBoard, from: Position, to: Position) => {
    replace(board, to, promote(to.y, cellAt(board, from)))
    remove(board, from)
}

const isOccupied = (board: GameBoard, pos: Position) => cellAt(board, pos) !== Cell.Black
const isEnemy = (board: GameBoard, pos: Position, player: Player) => {
    const cell = cellAt(board, pos)
    if (!pieceBit(cell)) return false
    return player !== cellColor(cell)
}

type MoveHandler = (board: GameBoard, from: Position, piece: Piece) => JSMove | undefined

const add = (a: number, b: number) => a + b
const subtract = (a: number, b: number) => a - b

const ifPlayer =
    (isPlayer: Player, handler: MoveHandler): MoveHandler =>
    (board, from, piece) => {
        if (isEnemy(board, from, isPlayer)) return undefined
        return handler(board, from, piece)
    }

const ifPiece =
    (isPiece: Piece, handler: MoveHandler): MoveHandler =>
    (board, from, piece) => {
        if (piece !== isPiece) return undefined
        return handler(board, from, piece)
    }

const ifCheckedPosition =
    (check: (pos: Position) => boolean, handler: MoveHandler): MoveHandler =>
    (board, from, piece) => {
        if (!check(from)) return undefined
        return handler(board, from, piece)
    }

const eatHandler =
    (
        xoffset: (a: number, b: number) => number,
        yoffset: (a: number, b: number) => number
    ): MoveHandler =>
    (board, from, piece) => {
        const { x, y } = from
        const jumpOver = { x: xoffset(x, 1), y: yoffset(y, 1) }
        const to = { x: xoffset(x, 2), y: yoffset(y, 2) }
        const condition = isEnemy(board, jumpOver, piecePlayer(piece)) && !isOccupied(board, to)
        if (!condition) return undefined

        const nextBoard = copyBoard(board)
        move(nextBoard, from, to)
        remove(nextBoard, jumpOver)
        return { from, to, nextBoard }
    }

const moveHandler =
    (
        xoffset: (a: number, b: number) => number,
        yoffset: (a: number, b: number) => number
    ): MoveHandler =>
    (board, from) => {
        const { x, y } = from
        const to = { x: xoffset(x, 1), y: yoffset(y, 1) }
        if (isOccupied(board, to)) return undefined
        const nextBoard = copyBoard(board)
        move(nextBoard, from, to)
        return { from, to, nextBoard }
    }

const topLeftEat = ifCheckedPosition(({ x, y }) => x > 1 && y > 1, eatHandler(subtract, subtract))
const topRightEat = ifCheckedPosition(({ x, y }) => x < 6 && y > 1, eatHandler(add, subtract))
const bottomLeftEat = ifCheckedPosition(({ x, y }) => x > 1 && y < 6, eatHandler(subtract, add))
const bottomRightEat = ifCheckedPosition(({ x, y }) => x < 6 && y < 6, eatHandler(add, add))

const eatHandlers = [
    ifPlayer(Player.White, topLeftEat),
    ifPlayer(Player.White, topRightEat),
    ifPlayer(Player.Black, bottomLeftEat),
    ifPlayer(Player.Black, bottomRightEat),

    ifPiece(Piece.WhiteQueen, bottomLeftEat),
    ifPiece(Piece.WhiteQueen, bottomRightEat),
    ifPiece(Piece.BlackQueen, topLeftEat),
    ifPiece(Piece.BlackQueen, topRightEat),
]

const topLeftMove = ifCheckedPosition(({ x, y }) => x > 0 && y > 0, moveHandler(subtract, subtract))
const topRightMove = ifCheckedPosition(({ x, y }) => x < 7 && y > 0, moveHandler(add, subtract))
const bottomLeftMove = ifCheckedPosition(({ x, y }) => x > 0 && y < 7, moveHandler(subtract, add))
const bottomRightMove = ifCheckedPosition(({ x, y }) => x < 7 && y < 7, moveHandler(add, add))

const moveHandlers = [
    ifPlayer(Player.White, topLeftMove),
    ifPlayer(Player.White, topRightMove),
    ifPlayer(Player.Black, bottomLeftMove),
    ifPlayer(Player.Black, bottomRightMove),

    ifPiece(Piece.WhiteQueen, bottomLeftMove),
    ifPiece(Piece.WhiteQueen, bottomRightMove),
    ifPiece(Piece.BlackQueen, topLeftMove),
    ifPiece(Piece.BlackQueen, topRightMove),
]

function* playerPositions(board: GameBoard, player: Player) {
    for (let y = 0; y < 8; ++y) {
        for (let x = 0; x < 8; ++x) {
            const position = { x, y }
            const cell = cellAt(board, position)
            if (pieceBit(cell)) {
                const piece = cellToPiece(cell)
                if (player === piecePlayer(piece)) {
                    yield { position, piece }
                }
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
        let hadMore = false
        for (const chainMove of chainEatMoves(move.nextBoard, move.to, piece)) {
            hadMore = true
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

const nextPlayer = (player: Player) => player === Player.White ? Player.Black : Player.White

const cellValue = (cell: Cell) => (colorBit(cell) * -2 + 1) * (pieceBit(cell) + queenBit(cell) * 5)

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
    if (!hasMoves(board, Player.White)) return -200
    if (!hasMoves(board, Player.Black)) return 200
    return board.reduce((acc, curr) => acc + cellValue(curr as Cell))
}

function isMinimizingPlayer(player: Player): player is Player.Black {
    return player === Player.Black
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
    if (depth === 0) {
        return [null, evaluateBoard(board)] as const
    }

    const moves = availableMoves(board, player)
    if (isMinimizingPlayer(player)) {
        return minimizeMoves(moves, nextPlayer(player), depth - 1)
    } else {
        return maximizeMoves(moves, nextPlayer(player), depth - 1)
    }
}

const bestMove =
    (init: number, cmp: (a: number, b: number) => boolean) =>
    (moves: Iterable<JSMove>, player: Player, depth: number): EvaluationResult | undefined => {
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
            const res = alphabeta(currentMove.nextBoard, nextPlayer(player), alpha, beta, depth - 1)
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
            const res = alphabeta(currentMove.nextBoard, nextPlayer(player), alpha, beta, depth - 1)
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
    const cell = cellAt(board, position)
    if (!pieceBit(cell)) return []
    const piece = cellToPiece(cell)
    const player = piecePlayer(piece)
    if (canPlayerMakeEatMove(board, player)) {
        return [...chainEatMoves(board, position, piece)]
    }
    return [...validMoves(moveHandlers, board, position, piece)]
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
