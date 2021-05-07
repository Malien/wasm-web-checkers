import * as comlink from "comlink"
import { GameBoard, GameLogicEngine, Move, Player, Position, SearchAlgorithm } from "src/common"
import { Disposable } from "src/util"
import { TermRef } from "./lib/swipl"
import { PLMove, SwiplWorker } from "./types"

export class SWIPLGameLogic implements GameLogicEngine, Disposable {
    private moveAugmentations = new WeakMap<Move, TermRef>()
    private boardAugmentations = new WeakMap<GameBoard, TermRef>()
    private proxy: comlink.Remote<SwiplWorker>
    private worker: Worker

    constructor(workerPath: string = "swipl-worker.js", workerName: string = "swipl-game-logic-worker") {
        this.worker = new Worker(workerPath, { name: workerName })
        this.proxy = comlink.wrap(this.worker)
    }

    private toJSBoard = async (boardTerm: TermRef) => {
        const board = await this.proxy.retrieveBoard(boardTerm)
        this.boardAugmentations.set(board, boardTerm)
        return board
    }

    private toSWIPLBoard = (board: GameBoard) => {
        const term = this.boardAugmentations.get(board)
        if (term === undefined)
            throw new Error(
                "Cannot match provided board to the SWIPL term." +
                    "Did you provide board from another game logic backend?"
            )
        return term
    }

    private toJSMove = ({ from, to, nextBoard }: PLMove): Move => {
        const move = { from, to }
        this.moveAugmentations.set(move, nextBoard)
        return move
    }

    private nextBoardFromMove = (move: Move): TermRef => {
        const term = this.moveAugmentations.get(move)
        if (term === undefined)
            throw new Error(
                "Cannot match provided move to the SWIPL term." +
                    "Did you provide move from another game logic backend?"
            )
        return term
    }

    get ready(): Promise<void> {
        return this.proxy.ready
    }

    testBoard = (idx: 1 | 2 | 3 | 4 | 5 | 6) => this.proxy.testBoard(idx).then(this.toJSBoard)

    initializeBoard = () => this.proxy.initializeBoard().then(this.toJSBoard)

    movesFor = async (board: GameBoard, position: Position) => {
        const boardTerm = this.toSWIPLBoard(board)
        const moves = await this.proxy.movesFor(boardTerm, position)
        return moves.map(this.toJSMove)
    }

    evaluateBestMove = async (
        board: GameBoard,
        player: Player,
        algorithm: SearchAlgorithm,
        searchDepth: number
    ): Promise<[move: Move, score: number] | undefined> => {
        const boardTerm = this.toSWIPLBoard(board)
        const res = await this.proxy.evaluateBestMove(boardTerm, player, algorithm, searchDepth)
        if (!res) return undefined
        const [move, score] = res
        return [this.toJSMove(move), score]
    }

    canEat = (board: GameBoard, player: Player) =>
        this.proxy.canEat(this.toSWIPLBoard(board), player)

    nextBoard = (move: Move) => this.toJSBoard(this.nextBoardFromMove(move))

    async encodeBoard(board: GameBoard): Promise<GameBoard> {
        const boardTerm = await this.proxy.encodeBoard(board)
        return await this.toJSBoard(boardTerm)
    }

    dispose() {
        this.proxy[comlink.releaseProxy]()
        this.worker.terminate()
    }
}
