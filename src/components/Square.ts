import { LitElement, css, html, customElement, property } from "lit-element"
import { Player, Selection } from "src/common"

@customElement("checkers-square")
export default class Square extends LitElement {
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
