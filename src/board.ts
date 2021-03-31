import { html } from "lit-html"
import { BoardRow, Cell, GameBoard, Move, Position } from "./common"

const figureColor = {
    b: "black",
    bq: "black",
    w: "white",
    wq: "white",
} as const

const Figure = (color: "black" | "white") => html` <div class="figure ${color}"></div> `

interface CellProps {
    cell: Cell
    onClick?: () => void
    selection?: "origin" | "move"
}

const Cell = ({ cell, onClick, selection }: CellProps) => {
    const selectionClass = selection ? `selection-${selection}` : ""
    switch (cell) {
        case "0":
            return html`<div class="cell white"></div>`
        case "b":
        case "bq":
        case "w":
        case "wq":
            return html`
                <div class="cell black ${selectionClass}" @click=${onClick}>
                    ${Figure(figureColor[cell])}
                </div>
            `
        case "1":
            return html`<div class="cell black ${selectionClass}" @click=${onClick}></div>`
    }
}

interface BoardProps {
    board: GameBoard
    origin?: Position
    moves?: Position[]
    onClick?: (position: Position, cell: Cell) => void
    onMove?: (position: Position, cell: Cell) => void
}

const cmpPositions = ([a, b]: Position, [x, y]: Position) => a == x && b == y

export const Board = ({ board, onClick, origin, moves = [], onMove }: BoardProps) => html`
    <div class="board-container">
        <div class="board">
            ${board.flat().map((cell, index) => {
                const position: Position = [index % 8, (index / 8) | 0]
                const isMove = moves.some(move => cmpPositions(move, position))
                let selection: "origin" | "move" | undefined
                let clickHandler: ((position: Position, cell: Cell) => void) | undefined
                if (origin && origin[0] == position[0] && origin[1] == position[1]) {
                    selection = "origin"
                }
                if (isMove) {
                    selection = "move"
                    clickHandler = onMove
                } else {
                    clickHandler = onClick
                }

                return Cell({
                    cell,
                    selection,
                    onClick: () => clickHandler?.(position, cell),
                })
            })}
        </div>
    </div>
`
