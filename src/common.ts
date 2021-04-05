import type { TermRef } from "./swipl"

export type Cell = "1" | "0" | "b" | "w" | "bq" | "wq"
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

export type Move = {
    from: Position, to: Position
}

export type PLMove = Move & {
    nextBoard: TermRef
}

type AnyFunction = (...args: any[]) => any
type ValuePromised<T> = T extends AnyFunction ? (...args: Parameters<T>) => Promise<ReturnType<T>> : Promise<T>
type CoverPromises<T> = { [K in keyof T]: ValuePromised<T[K]> }

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
    evaluateBestMove(boardTerm: TermRef, forPlayer: Player, using: SearchAlgorithm, searchDepth: number): [move: PLMove, score: number] | undefined
    canEat(boardTerm: TermRef, player: Player): Position[]
    nextPlayer(player: Player): Player
}>


