import { EngineType, GameLogicEngine, SearchAlgorithm } from "./common"
import displayNames from "./displayNames"
import initEngine from "./initEngine"
import measureWithResult from "./util/measureWithResult"

const textElement = <Tag extends keyof HTMLElementTagNameMap>(
    tag: Tag,
    innerText: string
): HTMLElementTagNameMap[Tag] => Object.assign(document.createElement(tag), { innerText })

const th = textElement.bind(this, "th")
const td = textElement.bind(this, "td")

function resultsTable(): HTMLTableElement {
    const table = document.createElement("table")
    const header = document.createElement("tr")
    header.append(
        th("Engine"),
        th("Algorithm"),
        th("Iteration"),
        th("Search Depth"),
        th("Time took")
    )
    table.append(header)
    return table
}

function resultRow({
    engineType,
    algorithm,
    iteration,
    searchDepth,
    time,
}: TestResult): HTMLTableRowElement {
    const row = document.createElement("tr")
    row.append(
        td(engineType),
        td(algorithm),
        td(String(iteration)),
        td(String(searchDepth)),
        td(String(time))
    )
    return row
}

interface TestResult {
    engineType: EngineType
    algorithm: SearchAlgorithm
    iteration: number
    searchDepth: number
    time: number
}

async function* test(
    engine: GameLogicEngine,
    engineType: EngineType,
    algorithm: SearchAlgorithm,
    { from = 2, to = 6, iterations = 10 }: RunRequirement
): AsyncGenerator<TestResult> {
    const board = await engine.initializeBoard()
    for (let searchDepth = from; searchDepth <= to; ++searchDepth) {
        for (let iteration = 0; iteration < iterations; ++iteration) {
            const [, time] = await measureWithResult(
                async () => await engine.evaluateBestMove(board, "white", algorithm, searchDepth)
            )
            yield { time, iteration, searchDepth, algorithm, engineType }
        }
    }
}

async function printTests(results: AsyncGenerator<TestResult>) {
    const table = resultsTable()
    document.body.append(table)
    for await (const result of results) {
        const row = resultRow(result)
        table.append(row)
    }
}

interface RunRequirement {
    from: number
    to: number
    iterations: number
}

interface TestRequirement {
    type: EngineType
    minimax: RunRequirement
    alphabeta: RunRequirement
}

const testRequirements: TestRequirement[] = [
    {
        type: "js",
        minimax: {
            from: 2,
            to: 7,
            iterations: 8,
        },
        alphabeta: {
            from: 2,
            to: 12,
            iterations: 8,
        },
    },
    {
        type: "swipl",
        minimax: {
            from: 2,
            to: 4,
            iterations: 5,
        },
        alphabeta: {
            from: 2,
            to: 6,
            iterations: 5,
        },
    },
    {
        type: "rs",
        minimax: {
            from: 2,
            to: 7,
            iterations: 5,
        },
        alphabeta: {
            from: 2,
            to: 12,
            iterations: 5,
        },
    },
]

async function testRequirement({ type, minimax, alphabeta }: TestRequirement) {
    const engine = await initEngine(type)
    await engine.ready
    console.log(`Measuring ${displayNames[type]} performance...`)
    await printTests(test(engine, type, "minimax", minimax))
    await printTests(test(engine, type, "alphabeta", alphabeta))
    engine.dispose()
}

class NoSuchEngine extends Error {
    constructor(public engine: string) {
        super(`No such engine ${engine}`)
    }
}

async function testSuite(engine?: string) {
    if (engine) {
        const requirement = testRequirements.find(({ type }) => type === engine)
        if (requirement) await testRequirement(requirement)
        else throw new NoSuchEngine(engine)
    } else {
        for (const requirement of testRequirements) {
            await testRequirement(requirement)
        }
    }
}

async function runTests() {
    try {
        const engine = new URLSearchParams(location.search).get("engine") || undefined
        await testSuite(engine)
        document.body.append(document.createTextNode("✅ done!"))
    } catch (e) {
        document.body.append(document.createTextNode(`❌ ${e.message || "Unknown error"}`))
        console.error(e)
    }
}

setTimeout(runTests, 3000)
