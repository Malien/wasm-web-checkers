import { LitElement, css, html, customElement, property } from "lit-element"
import { Player } from "src/common"

@customElement("checkers-figure")
export default class Figure extends LitElement {
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

        @media screen and (max-width: 600px) {
            .figure.black {
                border-width: 3px
            }
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
