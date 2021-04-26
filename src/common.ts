import type { TermRef } from "./swipl/swipl"
import { CoverPromises } from "./util"

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

export type PLMove = Move & {
    nextBoard: TermRef
}

export type SwiplWorker = CoverPromises<{
    ready: void
    testBoard(idx: 1 | 2 | 3 | 4 | 5 | 6): TermRef
    initializeBoard(): TermRef
    retrieveMove(term: TermRef): PLMove
    retrieveMoveOrEatList(term: TermRef): PLMove[]
    retrieveBoard(term: TermRef): GameBoard
    retrievePosition(term: TermRef): Position
    availableMoves(boardTerm: TermRef, player: Player): PLMove[]
    movesFor(boardTerm: TermRef, position: Position): PLMove[]
    swapBoards(into: TermRef, from: TermRef): GameBoard
    evaluateBestMove(
        boardTerm: TermRef,
        forPlayer: Player,
        usingAlgorithm: SearchAlgorithm,
        searchDepth: number
    ): [move: PLMove, score: number] | undefined
    canEat(boardTerm: TermRef, player: Player): Position[]
    nextPlayer(player: Player): Player
}>

export type JSMove = Move & {
    nextBoard: GameBoard
}

export type JSWorkerInterface = {
    // testBoard(idx: 1 | 2 | 3 | 4 | 5 | 6): GameBoard
    // initializedBoard: GameBoard
    availableMoves(board: GameBoard, player: Player): JSMove[]
    movesFor(board: GameBoard, position: Position): JSMove[]
    evaluateBestMove(
        board: GameBoard,
        forPlayer: Player,
        usingAlgorithm: SearchAlgorithm,
        searchDepth: number
    ): [move: JSMove, score: number] | undefined
    canEat(board: GameBoard, player: Player): Position[]
}

export type JSWorkerProxy = CoverPromises<JSWorkerInterface>

export interface GameLogicModule {
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