import { html } from "lit-html"
import { BoardRow, Cell, GameBoard, Move, Player, Position } from "./common"

const Figure = (color: Player) => html` <div class="figure ${color}"></div> `

const Queen = (color: Player) => html`
    <div class="figure ${color}">
        <div class="crown ${color}"></div>
    </div>
`

interface SquareProps {
    color: "white" | "black"
    onClick?: () => void
    children?: unknown
    selection?: "origin" | "move"
}

const Square = ({ color, onClick, children, selection }: SquareProps) => {
    const selectionClass = selection ? `selection-${selection}` : ""
    return html`<div class="cell ${color} ${selectionClass}" @click=${onClick}>${children}</div>`
}

interface CellProps {
    cell: Cell
    onClick?: () => void
    selection?: "origin" | "move"
}

const Cell = ({ cell, onClick, selection }: CellProps) => {
    switch (cell) {
        case "0":
            return Square({ color: "white" })
        case "bq":
            return Square({ color: "black", onClick, selection, children: Queen("black") })
        case "wq":
            return Square({ color: "black", onClick, selection, children: Queen("white") })
        case "b":
            return Square({ color: "black", onClick, selection, children: Figure("black") })
        case "w":
            return Square({ color: "black", onClick, selection, children: Figure("white") })
        case "1":
            return Square({ color: "black", selection, onClick })
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
