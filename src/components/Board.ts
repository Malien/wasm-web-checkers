import { css, html, LitElement, property, customElement } from "lit-element"
import { GameBoard, Piece, Position, Selection, isPiece } from "../common"
import { ifDefined } from "../util/directives"
import BoardCell from "./BoardCell"
import "./BoardCell"
import { cmpPositions } from "../util"

export class SelectCheckersEvent extends Event {
    constructor(public position: Position, public piece: Piece) {
        super("checkers-select", { bubbles: true, composed: true })
    }
}

export class MoveCheckersEvent extends Event {
    constructor(public from: Position | undefined, public to: Position) {
        super("checkers-move", { bubbles: true, composed: true })
    }
}

@customElement("checkers-board")
export default class Board extends LitElement {
    static styles = css`
        .board-container {
            position: relative;
            max-width: min(1200px, calc(100vh - 200px));
            margin: auto;
            width: 100%;
            box-sizing: border-box;
        }

        .board-container::after {
            content: "";
            display: block;
            padding-bottom: 100%;
        }

        .board {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            grid-template-rows: repeat(8, 1fr);
            justify-content: center;
            border: solid 20px brown;
            box-sizing: border-box;
        }

        @media screen and (max-width: 600px) {
            .board {
                border-width: 10px;
            }
        }
    `

    @property({ type: Array })
    board!: GameBoard

    @property({ type: Array })
    origin?: Position

    @property({ type: Array })
    moves: Position[] = []

    @property({ type: Array, attribute: "can-eat" })
    canEat: Position[] = []

    private handleClick(ev: Event) {
        const cell = (ev.target as HTMLElement).closest<BoardCell>("checkers-cell")
        if (!cell) return
        if (!cell.dataset["positionX"] || !cell.dataset["positionY"]) return
        const { positionX, positionY } = cell.dataset
        const position = [parseInt(positionX), parseInt(positionY)] as Position
        const isMove = cell.selection === "move"
        if (isMove) {
            this.dispatchEvent(new MoveCheckersEvent(this.origin, position))
        } else if (isPiece(cell.cell)) {
            this.dispatchEvent(new SelectCheckersEvent(position, cell.cell))
        }
    }

    render() {
        const { board, origin, moves, canEat } = this
        return html`
            <div class="board-container">
                <div class="board" @click=${this.handleClick}>
                    ${board.flat().map((cell, index) => {
                        const position: Position = [index % 8, (index / 8) | 0]
                        const isEat = canEat.some(move => cmpPositions(move, position))
                        const isMove = moves.some(move => cmpPositions(move, position))
                        let selection: Selection | undefined
                        if (isEat) {
                            selection = "eat"
                        }
                        if (isMove) {
                            selection = "move"
                        }
                        if (origin && origin[0] == position[0] && origin[1] == position[1]) {
                            selection = "origin"
                        }

                        if (selection) {
                            return html`<checkers-cell
                                data-position-x=${position[0]}
                                data-position-y=${position[1]}
                                cell=${cell}
                                selection=${ifDefined(selection)}
                            ></checkers-cell>`
                        }

                        return html`<checkers-cell
                            data-position-x=${position[0]}
                            data-position-y=${position[1]}
                            cell=${cell}
                        ></checkers-cell>`
                    })}
                </div>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "checkers-board": Board
    }
}
