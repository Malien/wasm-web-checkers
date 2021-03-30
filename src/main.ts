import { initPL, Prolog, TermType, TermPtr } from "./swipl"
import util from "./util"
import typecheck from "./typecheck"

type Cell = "1" | "0" | "b" | "w" | "bq" | "wq"
type BoardRow = [Cell, Cell, Cell, Cell, Cell, Cell, Cell]
type GameBoard = [BoardRow, BoardRow, BoardRow, BoardRow, BoardRow, BoardRow, BoardRow, BoardRow]
;(async () => {
    const PL = await initPL()

    const { getTermChars, constructArgsArray, callPredicate, loadProgramFile } = util.bind(PL)
    const { assertCompoundTermShape, assertTermType } = typecheck.bind(PL)

    const predicates = {
        boardInitializeGame: PL.predicate("board_initialize_game", 1, "user"),
    }

    const retrieveCell = (cellTerm: TermPtr): Cell => {
        assertTermType(cellTerm).toBeOneOf(TermType.ATOM, TermType.INTEGER)

        return getTermChars(cellTerm, PL.CVT_ATOM | PL.CVT_INTEGER) as Cell
    }

    const retrieveRow = (rowTerm: TermPtr): BoardRow => {
        assertCompoundTermShape(rowTerm, "l", 8)

        return constructArgsArray(rowTerm, retrieveCell, 8) as BoardRow
    }

    const retrieveBoard = (boardTerm: TermPtr): GameBoard => {
        assertCompoundTermShape(boardTerm, "game_board", 8)

        return constructArgsArray(boardTerm, retrieveRow) as GameBoard
    }

    const initialBoard = (): TermPtr => {
        const term = PL.newTermRef()
        callPredicate(predicates.boardInitializeGame, term)
        return term
    }

    await loadProgramFile(await fetch("./main.pl"))

    const boardTerm = initialBoard()
    const gameBoard = retrieveBoard(boardTerm)
    console.log(gameBoard)
})()
