import { GameBoard, Move, Player, Position, SearchAlgorithm } from "src/common"
import { CoverPromises } from "src/util"

export type JSMove = Move & {
    nextBoard: GameBoard
}

export type JSWorkerInterface = {
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