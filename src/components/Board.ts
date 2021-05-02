import { css, html, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import { GameBoard, Position } from "../common"
import BoardCell from "./BoardCell"

export class SelectCheckersEvent extends Event {
    constructor(public position: Position) {
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
    `

    @property({ type: Array })
    board!: GameBoard

    @property({ type: Array })
    origin?: Position

    @property({ type: Array })
    moves: Position[] = []

    @property({ type: Array })
    canEat: Position[] = []

    private handleClick(ev: Event) {
        const cell = (ev.target as HTMLElement).closest<BoardCell>("checkers-cell")
        if (!cell) return
        if (!cell.dataset["position"]) return
        const position = cell.dataset["position"].split(",").map(v => parseInt(v)) as Position
        const isMove = this.moves.some(move => cmpPositions(move, position))
        if (isMove) {
            this.dispatchEvent(new MoveCheckersEvent(this.origin, position))
        } else {
            this.dispatchEvent(new SelectCheckersEvent(position))
        }
    }

    render() {
        const { board, origin, moves, canEat } = this
        console.log({ board, origin, moves, canEat })
        return html`
            <div class="board-container">
                <div class="board" @click=${this.handleClick}>
                    ${board.flat().map((cell, index) => {
                        const position: Position = [index % 8, (index / 8) | 0]
                        // const isMove = moves.some(move => cmpPositions(move, position))
                        const isEat = canEat.some(move => cmpPositions(move, position))
                        let selection: Selection | undefined
                        // let clickHandler: ((position: Position, cell: Cell) => void) | undefined
                        if (isEat) {
                            selection = "eat"
                        }
                        if (origin && origin[0] == position[0] && origin[1] == position[1]) {
                            selection = "origin"
                        }
                        // if (isMove) {
                        //     selection = "move"
                        //     clickHandler = onMove
                        // } else {
                        //     clickHandler = onClick
                        //  }

                        return html`<checkers-cell
                            data-position=${position}
                            cell=${cell}
                            selection=${selection}
                        ></checkers-cell>`

                        // return Cell({
                        //     cell,
                        //     selection,
                        //     onClick: () => clickHandler?.(position, cell),
                        // })
                    })}
                </div>
            </div>
        `
    }
}

const cmpPositions = ([a, b]: Position, [x, y]: Position) => a == x && b == y
