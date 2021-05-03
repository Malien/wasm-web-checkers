import { LitElement, html, property, css, customElement } from "lit-element"
import "@material/mwc-button"
import { Player } from "../common"
import { capitalize } from "../util"

export class MakePlayEvent extends Event {
    constructor(public player: Player) {
        super("checkers-make-play", { bubbles: true, composed: true })
    }
}

@customElement("checkers-controls")
export default class Controls extends LitElement {
    static styles = css`
        .controls {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 0 20px;
        }

        .took-measure {
            margin: auto;
            display: block;
            font-family: Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
                sans-serif;
            color: lightgray;
        }

        .took-measure.white {
            grid-column: 1;
        }

        .took-measure.black {
            grid-column: 2;
        }

        @media screen and (max-width: 600px) {
            .controls {
                grid-template-columns: auto;
                gap: 0;
            }

            .button.white {
                grid-row: 1;
            }

            .button.black {
                grid-row: 3;
                margin-top: 20px;
            }

            .took-measure {
                margin-top: 5px;
            }

            .took-measure.white {
                grid-column: unset;
                grid-row: 2;
            }

            .took-measure.black {
                grid-column: unset;
                grid-row: 4;
            }
        }
    `

    @property({ type: Boolean, attribute: "white-waiting" })
    whiteWaiting = false

    @property({ type: Boolean, attribute: "black-waiting" })
    blackWaiting = false

    @property({ type: Number, attribute: "took-white" })
    tookWhite?: number

    @property({ type: Number, attribute: "took-black" })
    tookBlack?: number

    @property({ type: Boolean })
    disabled = false

    button(forPlayer: Player, waiting: boolean) {
        const label = waiting
            ? `${capitalize(forPlayer)} is making a move...`
            : `Make an optimal ${forPlayer} play`
        return html`<mwc-button
            class="button ${forPlayer}"
            raised
            label=${label}
            ?disabled=${this.disabled || waiting}
            @click=${() => this.dispatchEvent(new MakePlayEvent(forPlayer))}
        ></mwc-button>`
    }

    render() {
        const { whiteWaiting, blackWaiting, tookWhite, tookBlack } = this
        return html`
            <div class="controls">
                ${this.button("white", whiteWaiting)}
                ${this.button("black", blackWaiting)}
                ${tookWhite && html`<span class="took-measure white">Took ${tookWhite}ms</span>`}
                ${tookBlack && html`<span class="took-measure black">Took ${tookBlack}ms</span>`}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "checkers-controls": Controls
    }
}
