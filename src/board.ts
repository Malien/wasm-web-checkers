import { css, html, LitElement } from "lit"
import { customElement, eventOptions, property } from "lit/decorators.js"
import { Cell, GameBoard, Player, Position } from "./common"

@customElement("checkers-figure")
class Figure extends LitElement {
    static styles = css`
        .figure {
            width: 80%;
            height: 80%;
            margin: 10%;
            border-radius: 50%;
            border: 5px solid;
            border-color: white;
            box-sizing: border-box;
        }

        .figure.black {
            background-color: black;
        }

        .figure.white {
            background-color: white;
        }
    `

    @property()
    color!: Player

    render() {
        return html`<div class="figure ${this.color}">
            <slot></slot>
        </div>`
    }
}

@customElement("checkers-queen")
class Queen extends LitElement {
    static styles = css`
        .crown {
            width: 60%;
            height: 60%;
            margin: 20%;
            border-radius: 50%;
            border: 5px solid;
            box-sizing: border-box;
        }

        .crown.black {
            background-color: black;
            border-color: white;
        }
            
        .crown.white
            background-color: white;
            border-color: black;
        }
    `

    @property()
    color!: Player

    render() {
        return html`
            <checkers-figure color=${this.color}>
                <div class="crown ${this.color}"></div>
            </checkers-figure>
        `
    }
}

@customElement("checkers-square")
class Square extends LitElement {
    static styles = css`
        .square {
            width: 100%;
            height: 100%;
            border: 5px solid #00000000;
            box-sizing: border-box;
        } 

        .square.black {
            background-color: black;
        }
        
        .square.white {
            background-color: white;
        }

        .square.selection-origin {
            border-color: yellow;
        }

        .square.selection-move {
            border-color: lime;
        }

        .square.selection-eat {
            border-color: red;
        }
    `

    @property()
    color!: Player

    @property()
    selection?: Selection

    render() {
        const { color, selection } = this
        const selectionClass = selection ? `selection-${selection}` : ""
        return html`<div class="square ${color} ${selectionClass}">
            <slot></slot>
        </div>`
    }
}

type Selection = "origin" | "move" | "eat"

@customElement("checkers-cell")
class BoardCell extends LitElement {
    @property()
    cell!: Cell

    @property()
    selection?: Selection

    render() {
        const { cell, selection } = this
        switch (cell) {
            case "0":
                return html`<checkers-square color="white"></checkers-square>`
            case "1":
                return html`<checkers-square
                    color="black"
                    selection=${selection}
                ></checkers-square>`
            case "b":
                return html`<checkers-square color="black" selection=${selection}>
                    <checkers-figure color="black"></checkers-figure>
                </checkers-square>`
            case "w":
                return html`<checkers-square color="black" selection=${selection}>
                    <checkers-figure color="white"></checkers-figure>
                </checkers-square>`
            case "bq":
                return html`<checkers-square color="black" selection=${selection}>
                    <checkers-queen color="black"></checkers-figure>
                </checkers-square>`
            case "wq":
                return html`<checkers-square color="black" selection=${selection}>
                    <checkers-queen color="white"></checkers-figure>
                </checkers-square>`
        }
    }
}

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
class Board extends LitElement {
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

                        return html`<checkers-cell data-position=${position} cell=${cell} selection=${selection}></checkers-cell>`

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

// interface BoardProps {
//     board: GameBoard
//     origin?: Position
//     moves?: Position[]
//     canEat?: Position[]
//     onClick?: (position: Position, cell: Cell) => void
//     onMove?: (position: Position, cell: Cell) => void
// }

const cmpPositions = ([a, b]: Position, [x, y]: Position) => a == x && b == y

// export const Board = ({
//     board,
//     onClick,
//     origin,
//     moves = [],
//     onMove,
//     canEat = [],
// }: BoardProps) => html`
//     <div class="board-container">
//         <div class="board">
//             ${board.flat().map((cell, index) => {
//                 const position: Position = [index % 8, (index / 8) | 0]
//                 const isMove = moves.some(move => cmpPositions(move, position))
//                 const isEat = canEat.some(move => cmpPositions(move, position))
//                 let selection: Selection | undefined
//                 let clickHandler: ((position: Position, cell: Cell) => void) | undefined
//                 if (isEat) {
//                     selection = "eat"
//                 }
//                 if (origin && origin[0] == position[0] && origin[1] == position[1]) {
//                     selection = "origin"
//                 }
//                 if (isMove) {
//                     selection = "move"
//                     clickHandler = onMove
//                 } else {
//                     clickHandler = onClick
//                 }

//                 return Cell({
//                     cell,
//                     selection,
//                     onClick: () => clickHandler?.(position, cell),
//                 })
//             })}
//         </div>
//     </div>
// `
