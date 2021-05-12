import { SearchAlgorithm } from "../common"
import { CoverPromises } from "../util"

export type JSMove = {
    from: Position,
    to: Position,
    nextBoard: GameBoard
}

export const enum Cell {
    White = 0b000,
    Black = 0b001,
    WhitePiece = 0b100,
    BlackPiece = 0b101,
    WhiteQueen = 0b110,
    BlackQueen = 0b111,
}

export const enum Piece {
    White = 0b00,
    Black = 0b01,
    WhiteQueen = 0b10,
    BlackQueen = 0b11,
}

export const enum Player {
    White = 0,
    Black = 1,
}

export type Position = { x: number; y: number }

export type GameBoard = Uint8Array

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