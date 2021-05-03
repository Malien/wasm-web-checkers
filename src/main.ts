import "./App";

// const backendSelect = document.getElementById("backend-select") as Select
// const algorithmSelect = document.getElementById("algo-select") as Select
// const searchDepthField = document.getElementById("search-depth-field") as TextField
// const snackbar = document.getElementById("installation-snackbar") as Snackbar

// const board = document.getElementById("board") as Board
// const controls = document.getElementById("controls") as Controls

// if ("serviceWorker" in navigator) {
//     navigator.serviceWorker.register("/sw.js")
//     navigator.serviceWorker.ready.then(() => {
//         if (localStorage["installed"] !== "true") {
//             setTimeout(() => {
//                 localStorage["installed"] = "true"
//                 snackbar.open()
//             }, 2000)
//         }
//     })
// }

// const game = new JSGameLogic()
// const game = new SWIPLGameLogic()

// searchDepthField.disabled = true
// let isLoading = true

// initEngine(backendSelect.value as EngineType).then(async engine => {
//     const setLoading = () => {
//         backendSelect.disabled = true
//         algorithmSelect.disabled = true
//         searchDepthField.disabled = true
//         isLoading = true
//         renderControls()
//         // render(Board({ board, canEat }), mountPoint)
//     }

//     const setLoaded = () => {
//         backendSelect.disabled = false
//         algorithmSelect.disabled = false
//         searchDepthField.disabled = false
//         isLoading = false
//         renderControls()
//         // render(Board({ board, canEat, onClick: showMoves, onMove: makeMove }), mountPoint)
//     }

//     await engine.ready
//     const game = engine

//     // setLoaded()

//     function reinitEngine(newEngine: GameLogicEngine) {}

//     backendSelect.listen("MDCSelect:change", () => {})

//     const showMoves = async (position: Position) => {
//         currentMoves = await game.movesFor(board, position)

//         // render(
//         //     Board({
//         //         board,
//         //         onClick: showMoves,
//         //         origin: position,
//         //         moves: currentMoves.map(({ to }) => to),
//         //         onMove: makeMove,
//         //         canEat,
//         //     }),
//         //     mountPoint
//         // )
//     }

//     const calculateCanEat = async (): Promise<Position[]> => {
//         const [canEatWhite, canEatBlack] = await Promise.all([
//             game.canEat(board, "white"),
//             game.canEat(board, "black"),
//         ])
//         return [...canEatWhite, ...canEatBlack].map(([x, y]) => [x, y])
//     }

//     const makeMove = async ([x, y]: Position) => {
//         const move = currentMoves.find(({ to }) => to[0] == x && to[1] == y)
//         currentMoves = []
//         if (move) {
//             board = await game.nextBoard(move)
//             canEat = await calculateCanEat()

//             // render(
//             //     Board({
//             //         board,
//             //         onClick: showMoves,
//             //         onMove: makeMove,
//             //         canEat,
//             //     }),
//             //     mountPoint
//             // )
//         }
//     }

//     const makeBestMove = async (forPlayer: Player) => {
//         waiting[forPlayer] = true
//         renderControls()
//         const start = performance.now()

//         const play = await game.evaluateBestMove(board, forPlayer, algorithm, searchDepth)

//         took[forPlayer] = performance.now() - start
//         if (!play) return alert(`No plays for ${forPlayer}`)
//         const [move, score] = play
//         console.log("score", score)
//         board = await game.nextBoard(move)
//         canEat = await calculateCanEat()

//         waiting[forPlayer] = false
//         renderControls()

//         // render(
//         //     Board({
//         //         board,
//         //         onClick: showMoves,
//         //         onMove: makeMove,
//         //         canEat,
//         //     }),
//         //     mountPoint
//         // )
//     }

//     const renderControls = () => {
//         // render(
//         //     Controls({
//         //         whiteWaiting: waiting.white,
//         //         blackWaiting: waiting.black,
//         //         tookWhite: took.white,
//         //         tookBlack: took.black,
//         //         onWhiteClick,
//         //         onBlackClick,
//         //         disabled: isLoading,
//         //     }),
//         //     controlsMountPoint
//         // )
//     }

//     // let board = await game.testBoard(1)
//     let board = await game.initializeBoard()
//     let currentMoves: Move[] = []
//     let algorithm = algorithmSelect.value as SearchAlgorithm
//     let searchDepth = parseInt(searchDepthField.value)
//     let canEat = await calculateCanEat()
//     const took: { [K in Player]?: number } = {}
//     const waiting: { [K in Player]: boolean } = {
//         white: false,
//         black: false,
//     }

//     if (Number.isNaN(searchDepth))
//         throw new Error("Invalid value in the search depth field. Expected positive integer")

//     const onWhiteClick = () => makeBestMove("white")
//     const onBlackClick = () => makeBestMove("black")

//     algorithmSelect.listen("MDCSelect:change", () => {
//         algorithm = algorithmSelect.value as SearchAlgorithm
//     })

//     searchDepthField.listen("input", () => {
//         const value = parseInt(searchDepthField.value)
//         if (Number.isNaN(value)) return
//         searchDepth = value
//     })

//     renderControls()

//     // render(
//     //     Board({
//     //         board,
//     //         onClick: showMoves,
//     //         onMove: makeMove,
//     //         moves: currentMoves.map(({ to }) => to),
//     //     }),
//     //     mountPoint
//     // )

//     // render(html`<checkers-board board=${JSON.stringify(board)} origin=${JSON.stringify([1,2])}></checkers-board>`, mountPoint)
//     console.log(board)
// })
