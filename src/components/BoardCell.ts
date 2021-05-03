import { html, LitElement, customElement, property } from "lit-element"
import { ifDefined } from "../util/directives"
import { Cell, Selection } from "../common"
import "./Figure"
import "./Queen"
import "./Square"

@customElement("checkers-cell")
export default class BoardCell extends LitElement {
    @property()
    cell!: Cell

    @property()
    selection?: Selection

    render() {
        const { cell } = this
        const selection = ifDefined(this.selection)
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

declare global {
    interface HTMLElementTagNameMap {
        "checkers-cell": BoardCell
    }
}
