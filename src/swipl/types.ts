import { GameBoard, Move, Player, Position, SearchAlgorithm } from "../common"
import { CoverPromises } from "../util"
import { TermRef } from "./lib/swipl"

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
    encodeBoard(board: GameBoard): TermRef
}>
