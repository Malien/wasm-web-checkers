import { LitElement, css, html, customElement, property } from "lit-element"
import { Player } from "src/common"
import "./Figure"

@customElement("checkers-queen")
export default class Queen extends LitElement {
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
