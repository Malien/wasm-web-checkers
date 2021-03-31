import { initPL, TermType, TermRef } from "./swipl"
import util, { collectList, constructArgsArray, newTermRefs, openQuery } from "./util"
import typecheck from "./typecheck"
import { BoardRow, Cell, GameBoard, Move, Position } from "./common"
import "./styles.sass"
import { render } from "lit-html"
import { Board } from "./board"

const mountPoint = document.getElementById("mount")!

type PLMove = Move & {
    nextBoard: TermRef
}

// Stay put!
;(async () => {
    const PL = await initPL()

    const {
        getTermChars,
        callPredicate,
        loadProgramFile,
        openQuery,
        getInteger,
        getFloat,
    } = util.bind(PL)
    const { assertCompoundTermShape, assertTermType } = typecheck.bind(PL)

    const predicates = {
        boardInitializeGame: PL.predicate("board_initialize_game", 1, "user"),
        nextMove: PL.predicate("next_move", 5, "user"),
        allMoves: PL.predicate("all_moves", 5, "user"),
        testBoard1: PL.predicate("test_board_1", 1, "user"),
        testBoard2: PL.predicate("test_board_2", 1, "user"),
        testBoard3: PL.predicate("test_board_3", 1, "user"),
        testBoard4: PL.predicate("test_board_4", 1, "user"),
        testBoard5: PL.predicate("test_board_5", 1, "user"),
        testBoard6: PL.predicate("test_board_6", 1, "user"),
        listAvailableMoves: PL.predicate("list_available_moves", 3, "user"),
    }

    const retrieveMoveOrEatList = (term: TermRef): PLMove[] => {
        const type = PL.termType(term)
        if (type === TermType.TERM) return [retrieveMove(term)]

        assertTermType(term).toBeList()
        return collectList(PL, term, retrieveMove)
    }

    const retrieveMove = (moveTerm: TermRef): PLMove => {
        assertCompoundTermShape(moveTerm, "m", 5)
        const [fromX, fromY, toX, toY] = constructArgsArray(
            PL,
            moveTerm,
            arg => {
                assertTermType(arg).toBe(TermType.INTEGER)
                return getInteger(arg)
            },
            4
        )
        const nextBoard = PL.newTermRef()
        if (!PL.getArg(5, moveTerm, nextBoard)) {
            throw new Error("Couldn't get nexBoard from move")
        }
        // console.log("nextBoard type:", TermType[PL.termType(nextBoard)])

        return {
            from: [fromX - 1, fromY - 1],
            to: [toX - 1, toY - 1],
            nextBoard,
        }
    }

    const retrieveCell = (cellTerm: TermRef): Cell => {
        assertTermType(cellTerm).toBeOneOf(TermType.ATOM, TermType.INTEGER)

        return getTermChars(cellTerm, PL.CVT_ATOM | PL.CVT_INTEGER) as Cell
    }

    const retrieveRow = (rowTerm: TermRef): BoardRow => {
        assertCompoundTermShape(rowTerm, "l", 8)

        return constructArgsArray(PL, rowTerm, retrieveCell, 8)
    }

    const retrieveBoard = (boardTerm: TermRef): GameBoard => {
        assertCompoundTermShape(boardTerm, "game_board", 8)

        return constructArgsArray(PL, boardTerm, retrieveRow, 8)
    }

    const initialBoard = (): TermRef => {
        const term = PL.newTermRef()
        callPredicate(predicates.boardInitializeGame, term)
        return term
    }

    const testBoard = (idx: 1 | 2 | 3 | 4 | 5 | 6) => {
        const term = PL.newTermRef()
        const pred = predicates[`testBoard${idx}` as const]
        callPredicate(pred, term)
        return term
    }

    const availableMoves = (boardTerm: TermRef, player: "white" | "black"): PLMove[] => {
        const board = PL.copyTermRef(boardTerm)
        const [playerTerm, moves] = newTermRefs(PL, 2)
        PL.putAtomChars(playerTerm, player)
        if (!callPredicate(predicates.listAvailableMoves, board)) return []
        assertTermType(moves).toBeList()
        return collectList(PL, moves, retrieveMoveOrEatList).flat()
    }

    await loadProgramFile(await fetch("./main.pl"))

    // const boardTerm = initialBoard()
    const boardTerm = testBoard(6)
    let gameBoard = retrieveBoard(boardTerm)
    let currentMoves: PLMove[] = availableMoves(boardTerm, "white")
    // let currentMoves: PLMove[] = []

    const showMoves = ([x, y]: Position, cell: Cell) => {
        const board = PL.copyTermRef(boardTerm)
        const [piece, xcoord, ycoord, moves] = newTermRefs(PL, 4)
        PL.putAtomChars(piece, cell)
        PL.putInteger(xcoord, x + 1)
        PL.putInteger(ycoord, y + 1)
        callPredicate(predicates.allMoves, board)
        console.log(TermType[PL.termType(moves)])
        assertTermType(moves).toBeOneOf(TermType.NIL, TermType.LIST, TermType.LIST_PAIR)
        const moveTerm = PL.newTermRef()
        const movesArr: PLMove[] = []
        while (PL.getList(moves, moveTerm, moves)) {
            movesArr.push(retrieveMove(moveTerm))
        }

        // const query = openQuery(predicates.nextMove, board)
        // const moves: PLMove[] = []
        // while (PL.nextSolution(query)) {
        //     moves.push(retrieveMove(move))
        // }
        // PL.closeQuery(query)
        // console.log(moves)
        currentMoves = movesArr
        render(
            Board({
                board: gameBoard,
                onClick: showMoves,
                origin: [x, y],
                moves: movesArr.map(({ to }) => to),
                onMove: makeMove,
            }),
            mountPoint
        )
    }

    const makeMove = ([x, y]: Position) => {
        const move = currentMoves.find(({ to }) => to[0] == x && to[1] == y)
        currentMoves = []
        if (move) {
            PL.putTerm(boardTerm, move.nextBoard)
            gameBoard = retrieveBoard(boardTerm)

            render(
                Board({
                    board: gameBoard,
                    onClick: showMoves,
                    onMove: makeMove,
                }),
                mountPoint
            )
        }
    }

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
})()
