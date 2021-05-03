/// <reference lib="ES2020" />

import { expose } from "comlink"
import type { Cell, BoardRow, GameBoard, Position, Player } from "../common"
import type { PLMove, SwiplWorker } from "./types"
import { loadSwiplInWorker, TermRef, TermType } from "./lib/swipl"
import { collectList, constructArgsArray, newTermRefs, bind as bindUtil } from "./lib/util"
import { bind as bindTypecheck } from "./lib/typecheck"

const configured = loadSwiplInWorker("./swipl-wasm").then(async PL => {
    console.log("INIT!")

    const predicates = {
        boardInitializeGame: PL.predicate("board_initialize_game", 1, "user"),
        nextMove: PL.predicate("next_move", 5, "user"),
        allMoves: PL.predicate("all_moves", 4, "user"),
        testBoard1: PL.predicate("test_board_1", 1, "user"),
        testBoard2: PL.predicate("test_board_2", 1, "user"),
        testBoard3: PL.predicate("test_board_3", 1, "user"),
        testBoard4: PL.predicate("test_board_4", 1, "user"),
        testBoard5: PL.predicate("test_board_5", 1, "user"),
        testBoard6: PL.predicate("test_board_6", 1, "user"),
        minimax: PL.predicate("minimax", 5, "user"),
        alphabeta: PL.predicate("alphabeta", 5, "user"),
        listAvailableMoves: PL.predicate("list_available_moves", 3, "user"),
        canEat: PL.predicate("can_eat", 3, "user"),
        nextPlayer: PL.predicate("next_player", 2, "user"),
    }

    const util = bindUtil(PL)
    const typecheck = bindTypecheck(PL)

    await util.loadProgramFile(await fetch("./main.pl"))

    const retrieveMoveOrEatList = (term: TermRef): PLMove[] => {
        const type = PL.termType(term)
        if (type === TermType.TERM) return [retrieveMove(term)]

        typecheck.assertTermType(term).toBeList()
        return collectList(PL, term, retrieveMove)
    }

    const retrieveMove = (moveTerm: TermRef): PLMove => {
        typecheck.assertCompoundTermShape(moveTerm, "m", 5)
        const [fromX, fromY, toX, toY] = constructArgsArray(
            PL,
            moveTerm,
            arg => {
                typecheck.assertTermType(arg).toBe(TermType.INTEGER)
                return util.getInteger(arg)
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
        typecheck.assertTermType(cellTerm).toBeOneOf(TermType.ATOM, TermType.INTEGER)

        return util.getTermChars(cellTerm, PL.CVT_ATOM | PL.CVT_INTEGER) as Cell
    }

    const retrieveRow = (rowTerm: TermRef): BoardRow => {
        typecheck.assertCompoundTermShape(rowTerm, "l", 8)

        return constructArgsArray(PL, rowTerm, retrieveCell, 8)
    }

    const retrieveBoard = (boardTerm: TermRef): GameBoard => {
        typecheck.assertCompoundTermShape(boardTerm, "game_board", 8)

        return constructArgsArray(PL, boardTerm, retrieveRow, 8)
    }

    const retrievePosition = (positionTerm: TermRef): Position => {
        typecheck.assertCompoundTermShape(positionTerm, "p", 3)

        return constructArgsArray(PL, positionTerm, util.getInteger, 2)
    }

    return {
        PL,
        predicates,
        ...util,
        ...typecheck,
        retrieveBoard,
        retrieveMove,
        retrieveMoveOrEatList,
        retrievePosition,
    }
})

type FuncKey<T, P extends keyof T> = P extends any ? (T[P] extends AnyFunction ? P : never) : never

type Awaited<T> = T extends PromiseLike<infer U> ? U : T
type Conf = Awaited<typeof configured>
type AnyFunction = (...args: any[]) => any
type FuncConfKeys = FuncKey<Conf, keyof Conf>
type Reexported<P extends FuncConfKeys> = (
    ...args: Parameters<Conf[P]>
) => Promise<ReturnType<Conf[P]>>

const reexport = <P extends FuncConfKeys>(prop: P): Reexported<P> =>
    (async (...args: Parameters<Conf[P]>) => {
        const conf = await configured
        // @ts-ignore
        return conf[prop](...args)
    }) as any

const boardRowTermStr = (row: BoardRow) => `l(${row.join(",")})`
const boardTermStr = (board: GameBoard) => `game_board(${board.map(boardRowTermStr).join(",")})`

const worker: SwiplWorker = {
    ready: configured.then(() => {}),

    async testBoard(idx) {
        const { PL, predicates, callPredicate } = await configured
        const term = PL.newTermRef()
        const pred = predicates[`testBoard${idx}` as const]
        callPredicate(pred, term)
        return term
    },

    async initializeBoard() {
        console.log("hello")
        const { PL, predicates, callPredicate } = await configured
        const term = PL.newTermRef()
        callPredicate(predicates.boardInitializeGame, term)
        return term
    },

    retrieveMove: reexport("retrieveMove"),
    retrieveMoveOrEatList: reexport("retrieveMoveOrEatList"),
    retrieveBoard: reexport("retrieveBoard"),
    retrievePosition: reexport("retrievePosition"),

    async availableMoves(boardTerm, player) {
        const {
            PL,
            callPredicate,
            predicates,
            assertTermType,
            retrieveMoveOrEatList,
        } = await configured
        const board = PL.copyTermRef(boardTerm)
        const [playerTerm, moves] = newTermRefs(PL, 2)
        PL.putAtomChars(playerTerm, player)
        if (!callPredicate(predicates.listAvailableMoves, board)) return []
        assertTermType(moves).toBeList()
        return collectList(PL, moves, retrieveMoveOrEatList).flat()
    },

    async movesFor(boardTerm, [x, y]) {
        const { PL, callPredicate, predicates, retrieveMove } = await configured
        const board = PL.copyTermRef(boardTerm)
        const [xcoord, ycoord, moves] = newTermRefs(PL, 4)
        PL.putInteger(xcoord, x + 1)
        PL.putInteger(ycoord, y + 1)
        callPredicate(predicates.allMoves, board)
        return collectList(PL, moves, retrieveMove)
    },

    async swapBoards(into, from) {
        const { PL, retrieveBoard } = await configured
        PL.putTerm(into, from)
        return retrieveBoard(into)
    },

    async evaluateBestMove(boardTerm, player, algorithm, searchDepth) {
        const { predicates, PL, callPredicate, retrieveMove, getInteger } = await configured
        const pred = predicates[algorithm]
        const [board, playerTerm, maxDepth, nextMove, score] = newTermRefs(PL, 5)
        PL.putTerm(board, boardTerm)
        PL.putAtomChars(playerTerm, player)
        PL.putInteger(maxDepth, searchDepth)
        if (!callPredicate(pred, board)) return undefined
        return [retrieveMove(nextMove), getInteger(score)]
    },

    async canEat(boardTerm, player) {
        const { PL, predicates, callPredicate, retrievePosition } = await configured
        const [board, playerTerm, positions] = newTermRefs(PL, 3)
        PL.putTerm(board, boardTerm)
        PL.putAtomChars(playerTerm, player)
        if (!callPredicate(predicates.canEat, board)) throw new Error("Couldn't evaluate can_eat/3")
        return collectList(PL, positions, retrievePosition).map(([x, y]) => [x - 1, y - 1])
    },

    async nextPlayer(player) {
        const { PL, predicates, callPredicate, getAtomChars } = await configured
        const [currentPlayer, nextPlayer] = newTermRefs(PL, 2)
        PL.putAtomChars(currentPlayer, player)
        if (!callPredicate(predicates.nextPlayer, currentPlayer))
            throw new Error(`Next player for ${player} is not defined`)
        return getAtomChars(nextPlayer) as Player
    },

    async encodeBoard(board) {
        const { PL } = await configured
        const str = boardTermStr(board)
        const boardTerm = PL.newTermRef()
        if (!PL.charsToTerm(str, boardTerm)) 
            throw new Error(`Can't convert js game board to PL term`)
        return boardTerm
    },
}

expose(worker)
