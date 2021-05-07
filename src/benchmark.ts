import { GameLogicEngine, SearchAlgorithm } from "./common"
import { JSGameLogic } from "./js"
import { RSGameLogic } from "./rs"
import { SWIPLGameLogic } from "./swipl"
import measureWithResult from "./util/measureWithResult"

async function test(engine: GameLogicEngine, algorithm: SearchAlgorithm, from: number = 2, to: number = 6, iterations: number = 10) {
    await engine.ready
    const board = await engine.initializeBoard()
    for (let i = from; i <= to; ++i) {
        for (let j = 0; j < iterations; ++j) {
            const [, time] = await measureWithResult(
                async () => await engine.evaluateBestMove(board, "white", algorithm, i)
            )
            console.log(`${algorithm}(${i}): ${time}ms`)
        }
    }
}

async function testSuite() {
    const jsEngine = new JSGameLogic()
    console.log("Measuring JS performance...")
    await test(jsEngine, "minimax", 2, 6, 5)
    await test(jsEngine, "alphabeta", 2, 8, 5)
    // console.log("Measuring SWI-Prolog performance...")
    // await test(new SWIPLGameLogic())
    console.log("Measuring Rust Performance...")
    const rsEngine = new RSGameLogic()
    await test(rsEngine, "minimax", 2, 6, 3)
    await test(rsEngine, "alphabeta", 2, 8, 3)
}

testSuite()

// ;(async () => {
//     const engine = new JSGameLogic()
//     const board = await engine.initializeBoard()
//     await engine.evaluateBestMove(board, "white", "alphabeta", 3)
// })()