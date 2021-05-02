export type Piece = "b" | "w" | "bq" | "wq"
export type Cell = "1" | "0" | Piece
export type BoardRow = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]
export type GameBoard = [
    BoardRow,
    BoardRow,
    BoardRow,
    BoardRow,
    BoardRow,
    BoardRow,
    BoardRow,
    BoardRow
]

export type Player = "white" | "black"
export type SearchAlgorithm = "minimax" | "alphabeta"

export type Position = [x: number, y: number]

export type ValidIdx = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
export type ValidPosition = [x: ValidIdx, y: ValidIdx]

export type Move = {
    from: Position
    to: Position
}

export interface GameLogicEngine {
    ready: Promise<void>
    testBoard(idx: 1 | 2 | 3 | 4 | 5 | 6): Promise<GameBoard>
    initializeBoard(): Promise<GameBoard>
    // availableMoves(board: GameBoard, player: Player): Promise<Move[]>
    movesFor(board: GameBoard, position: Position): Promise<Move[]>
    evaluateBestMove(
        board: GameBoard,
        forPlayer: Player,
        usingAlgorithm: SearchAlgorithm,
        searchDepth: number
    ): Promise<[move: Move, score: number] | undefined>
    canEat(board: GameBoard, player: Player): Promise<Position[]>
    nextBoard(move: Move): Promise<GameBoard>
    encodeBoard(board: GameBoard): Promise<GameBoard>
}

export type EngineType = "swipl" | "js"