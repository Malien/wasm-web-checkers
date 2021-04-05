import { render } from "lit-html"
import { wrap } from "comlink"
import { Player, PLMove, Position, SearchAlgorithm, SwiplWorker } from "./common"
import { Board } from "./board"
// import "@material/mwc-button"/;
import { MDCRipple } from "@material/ripple"
import { MDCSelect } from "@material/select"
import { MDCTextField } from "@material/textfield"
import "./styles.sass"
import { Controls } from "./controls"

new MDCRipple(document.querySelector(".mdc-button")!)

const algorithmSelect = new MDCSelect(document.querySelector(".mdc-select")!)

const searchDepthField = new MDCTextField(document.querySelector(".mdc-text-field")!)

algorithmSelect.listen("MDCSelect:change", () => {
    console.log(
        `Selected option at index ${algorithmSelect.selectedIndex} with value "${algorithmSelect.value}"`
    )
})

const mountPoint = document.getElementById("mount") as HTMLDivElement
const controlsMountPoint = document.getElementById("mount-controls") as HTMLDivElement

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/sw.js")
}

const worker = wrap<SwiplWorker>(
    new Worker("./worker.js", { name: "swipl-runtime", type: "classic" })
)
worker.ready.then(async () => {
    console.log("Ready, but on main thread")

    const showMoves = async (position: Position) => {
        currentMoves = await worker.movesFor(board, position)

        render(
            Board({
                board: gameBoard,
                onClick: showMoves,
                origin: position,
                moves: currentMoves.map(({ to }) => to),
                onMove: makeMove,
                canEat
            }),
            mountPoint
        )
    }

    const calculateCanEat = async (): Promise<Position[]> => {
        const [canEatWhite, canEatBlack] = await Promise.all([worker.canEat(board, "white"), worker.canEat(board, "black")])
        return [...canEatWhite, ...canEatBlack].map(([x, y]) => [x - 1, y - 1])
    }

    const makeMove = async ([x, y]: Position) => {
        const move = currentMoves.find(({ to }) => to[0] == x && to[1] == y)
        currentMoves = []
        if (move) {
            gameBoard = await worker.swapBoards(board, move.nextBoard)
            canEat = await calculateCanEat()

            render(
                Board({
                    board: gameBoard,
                    onClick: showMoves,
                    onMove: makeMove,
                    canEat
                }),
                mountPoint
            )
        }
    }

    const makeBestMove = async (forPlayer: Player) => {
        waiting[forPlayer] = true
        renderControls()
        const start = performance.now()

        const play = await worker.evaluateBestMove(board, forPlayer, algorithm, searchDepth)

        took[forPlayer] = performance.now() - start
        if (!play) return alert(`No plays for ${forPlayer}`)
        const [{ nextBoard }, score] = play
        console.log("score", score)
        gameBoard = await worker.swapBoards(board, nextBoard)
        canEat = await calculateCanEat()

        waiting[forPlayer] = false
        renderControls()

        render(
            Board({
                board: gameBoard,
                onClick: showMoves,
                onMove: makeMove,
                canEat
            }),
            mountPoint
        )
    }

    const renderControls = () => {
        render(
            Controls({
                whiteWaiting: waiting.white,
                blackWaiting: waiting.black,
                tookWhite: took.white,
                tookBlack: took.black,
                onWhiteClick,
                onBlackClick,
            }),
            controlsMountPoint
        )
    }

    const board = await worker.initializeBoard()
    let gameBoard = await worker.retrieveBoard(board)
    let currentMoves: PLMove[] = []
    let algorithm = algorithmSelect.value as SearchAlgorithm
    let searchDepth = parseInt(searchDepthField.value)
    let canEat = await calculateCanEat()
    const took: { [K in Player]?: number } = {}
    const waiting: { [K in Player]: boolean } = {
        white: false,
        black: false
    }

    if (Number.isNaN(searchDepth))
        throw new Error("Invalid value in the search depth field. Expected positive integer")

    const onWhiteClick = () => makeBestMove("white")
    const onBlackClick = () => makeBestMove("black")

    algorithmSelect.listen("MDCSelect:change", () => {
        algorithm = algorithmSelect.value as SearchAlgorithm
    })

    searchDepthField.listen("input", () => {
        const value = parseInt(searchDepthField.value)
        if (Number.isNaN(value)) return
        searchDepth = value
    })

    renderControls()

    render(
        Board({
            board: gameBoard,
            onClick: showMoves,
            onMove: makeMove,
            moves: currentMoves.map(({ to }) => to),
        }),
        mountPoint
    )
    console.log(gameBoard)
})
