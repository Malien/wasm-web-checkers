import { customElement, html, LitElement, query, state } from "lit-element"
import type {
    EngineType,
    GameBoard,
    GameLogicEngine,
    Move,
    Player,
    Position,
    SearchAlgorithm,
} from "./common"
import { MoveCheckersEvent, SelectCheckersEvent } from "./components/Board"
import { cmpPositions, Disposable, measureWithResult } from "./util"
import { MakePlayEvent } from "./components/Controls"
import { ifDefined } from "./util/directives"
import initEngine from "./initEngine"

import "@material/mwc-snackbar"
import { Snackbar } from "@material/mwc-snackbar"
import "./components/Board"
import "./components/Settings"
import {
    AlgorithmChangeEvent,
    BackendChangeEvent,
    SearchDepthChangeEvent,
} from "./components/Settings"

const emptyBoard: GameBoard = [
    ["0", "1", "0", "1", "0", "1", "0", "1"],
    ["1", "0", "1", "0", "1", "0", "1", "0"],
    ["0", "1", "0", "1", "0", "1", "0", "1"],
    ["1", "0", "1", "0", "1", "0", "1", "0"],
    ["0", "1", "0", "1", "0", "1", "0", "1"],
    ["1", "0", "1", "0", "1", "0", "1", "0"],
    ["0", "1", "0", "1", "0", "1", "0", "1"],
    ["1", "0", "1", "0", "1", "0", "1", "0"],
]

async function calculateCanEat(game: GameLogicEngine, board: GameBoard): Promise<Position[]> {
    const [canEatWhite, canEatBlack] = await Promise.all([
        game.canEat(board, "white"),
        game.canEat(board, "black"),
    ])
    return [...canEatWhite, ...canEatBlack].map(([x, y]) => [x, y])
}

@customElement("checkers-app")
export default class App extends LitElement {
    constructor() {
        super()
        initEngine(this.backend).then(async engine => {
            await engine.ready
            console.log("engine ready")
            this.board = await engine.initializeBoard()
            console.log("board", this.board)
            this.game = engine
        })
    }

    @state()
    board: GameBoard = emptyBoard

    @state()
    algorithm: SearchAlgorithm = "alphabeta"

    @state()
    backend: EngineType = "js"

    @state()
    searchDepth = 3

    @state()
    game?: GameLogicEngine & Disposable

    @state()
    waiting = {
        white: false,
        black: false,
    }

    @state()
    took: Partial<Record<Player, number>> = {}

    @state()
    canEat: Position[] = []

    @state()
    moves: Move[] = []

    @state()
    origin?: Position

    @query("#installation-snackbar")
    snackbar!: Snackbar

    async reinitEngine(type: EngineType) {
        this.game?.dispose()
        this.game = undefined
        this.moves = []
        this.origin = undefined
        const engine = await initEngine(type)
        await engine.ready
        this.board = await engine.encodeBoard(this.board)
        this.game = engine
    }

    async whileWaiting<T>(forPlayer: Player, block: () => T | Promise<T>): Promise<T> {
        this.waiting = { ...this.waiting, [forPlayer]: true }
        const res = await block()
        this.waiting = { ...this.waiting, [forPlayer]: false }
        return res
    }

    async measurePlayerAction<T>(forPlayer: Player, block: () => T | Promise<T>): Promise<T> {
        const [res, time] = await measureWithResult(block)
        this.took = { ...this.took, [forPlayer]: time }
        return res
    }

    async makeBestMove(forPlayer: Player) {
        const { game, board } = this
        if (!game) return
        this.whileWaiting(forPlayer, async () => {
            const play = await this.measurePlayerAction(forPlayer, () =>
                game.evaluateBestMove(board, forPlayer, this.algorithm, this.searchDepth)
            )
            if (!play) return alert(`No plays for ${forPlayer}`)
            const [move, score] = play
            console.log("score", score)
            this.board = await game.nextBoard(move)
            this.canEat = await calculateCanEat(game, this.board)
        })
    }

    showSWReadyMessage() {
        this.snackbar.show()
    }

    handleAlgoChange(ev: AlgorithmChangeEvent) {
        this.algorithm = ev.newValue
    }

    handleBackendChange(ev: BackendChangeEvent) {
        this.backend = ev.newValue
        this.reinitEngine(ev.newValue)
    }

    handleSearchDepthChange(ev: SearchDepthChangeEvent) {
        this.searchDepth = ev.newValue
    }

    async handlePieceSelect(ev: SelectCheckersEvent) {
        if (!this.game) return
        this.origin = ev.position
        this.moves = await this.game.movesFor(this.board, ev.position)
    }

    async handleMove(ev: MoveCheckersEvent) {
        if (!this.game) return
        const move = this.moves.find(({ to }) => cmpPositions(to, ev.to))
        this.moves = []
        this.origin = undefined
        if (move) {
            this.board = await this.game.nextBoard(move)
            this.canEat = await calculateCanEat(this.game, this.board)
        }
    }

    handlePlayRequest(ev: MakePlayEvent) {
        this.makeBestMove(ev.player)
    }

    render() {
        const {
            board,
            algorithm,
            backend,
            searchDepth,
            moves,
            canEat,
            origin,
            game,
            waiting,
            took,
        } = this

        console.log(!!board)

        return html`
            <checkers-board
                id="board"
                .board=${board}
                .moves=${moves.map(move => move.to)}
                .canEat=${canEat}
                .origin=${origin}
                @checkers-select=${this.handlePieceSelect}
                @checkers-move=${this.handleMove}
            ></checkers-board>
            <checkers-settings
                algorithm=${algorithm}
                backend=${backend}
                search-depth=${searchDepth}
                took-white=${ifDefined(took.white)}
                took-black=${ifDefined(took.black)}
                ?white-waiting=${waiting.white}
                ?black-waiting=${waiting.black}
                ?disabled=${!game}
                @checkers-make-play=${this.handlePlayRequest}
                @checkers-backend-change=${this.handleBackendChange}
                @checkers-algorithm-change=${this.handleAlgoChange}
                @checkers-search-depth-change=${this.handleSearchDepthChange}
            ></checkers-settings>
            <mwc-snackbar
                id="installation-snackbar"
                labelText="App is ready for offline use"
            ></mwc-snackbar>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "checkers-app": App
    }
}
