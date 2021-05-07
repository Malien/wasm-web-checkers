import { GameBoard, Move, Player, Position, SearchAlgorithm } from "../common"
import { CoverPromises } from "../util"

export type RSMove = Move & {
    nextBoard: GameBoard
}

export type RSWorkerInterface = {
    ready: Promise<void>
    initializeBoard(): GameBoard
    availableMoves(board: GameBoard, player: Player): RSMove[]
    movesFor(board: GameBoard, position: Position): RSMove[]
    evaluateBestMove(
        board: GameBoard,
        forPlayer: Player,
        usingAlgorithm: SearchAlgorithm,
        searchDepth: number
    ): [move: RSMove, score: number] | undefined
    canEat(board: GameBoard, player: Player): Position[]
}

export type RSWorkerProxy = CoverPromises<RSWorkerInterface>
