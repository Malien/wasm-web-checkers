import { initPL, Prolog, TermType, TermPtr } from "./swipl"
import { loadProgramFile, callPredicate, getTermChars, getNameArity } from "./util"
import { assertTermType } from "./typecheck"

type Cell = "1" | "0" | "b" | "w" | "bq" | "wq"
type BoardRow = [Cell, Cell, Cell, Cell, Cell, Cell, Cell]
type GameBoard = [BoardRow, BoardRow, BoardRow, BoardRow, BoardRow, BoardRow, BoardRow, BoardRow]

;(async () => {
    const PL = await initPL()

    const predicates = {
        boardInitializeGame: PL.predicate("board_initialize_game", 1, "user")
    }

    const retrieveCell = (PL: Prolog, cellTerm: TermPtr): Cell => {
        assertTermType(PL, cellTerm).toBeOneOf(TermType.ATOM, TermType.INTEGER)

        return getTermChars(PL, cellTerm, PL.CVT_ATOM | PL.CVT_INTEGER) as Cell
    }

    const retrieveRow = (PL: Prolog, rowTerm: TermPtr): BoardRow => {
        assertTermType(PL, rowTerm).toBe(TermType.TERM)

        const [name, arity] = getNameArity(PL, rowTerm)
        if (name !== "l" && arity != 8) {
            throw new Error("Expected board term to be `l/8`")
        }

        const row: Cell[] = []
        const cellTerm = PL.newTermRef()
        for (let i = 1; i < 9; ++i) {
            if (!PL.getArg(i, rowTerm, cellTerm)) {
                throw new Error(`Cannot retrieve cell at index ${i}`)
            }
            const cell = retrieveCell(PL, cellTerm)
            row.push(cell)
        }

        return row as BoardRow
    }

    const retrieveBoard = (PL: Prolog, boardTerm: TermPtr): GameBoard => {
        assertTermType(PL, boardTerm).toBe(TermType.TERM)

        const [name, arity] = getNameArity(PL, boardTerm)
        if (name !== "game_board" && arity != 8) {
            throw new Error("Expected board term to be `game_board/8`")
        }

        const gameBoard: BoardRow[] = []
        const rowTerm = PL.newTermRef()
        for (let i = 1; i < 9; ++i) {
            if (!PL.getArg(i, boardTerm, rowTerm)) {
                throw new Error(`Cannot retrieve row at index ${i}`)
            }
            const row = retrieveRow(PL, rowTerm)
            gameBoard.push(row)
        }

        return gameBoard as GameBoard
    }

    const initialBoard = (PL: Prolog): TermPtr => {
        const term = PL.newTermRef()
        callPredicate(PL, predicates.boardInitializeGame, term)
        return term
    }

    await loadProgramFile(PL, await fetch("./main.pl"))

    const boardTerm = initialBoard(PL)
    const gameBoard = retrieveBoard(PL, boardTerm)
    console.log(gameBoard)
})()
