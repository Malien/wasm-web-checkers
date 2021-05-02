import { LitElement, html, property, css, customElement } from "lit-element"
import "@material/mwc-button"

@customElement("checkers-controls")
export default class Controls extends LitElement {
    static styles = css`
        .controls {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 20px;
        }

        .took-measure {
            margin: auto;
            display: block;
            font-family: Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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

    render() {
        const { whiteWaiting, disabled, blackWaiting, tookWhite, tookBlack } = this
        const whiteLabel = whiteWaiting ? "White is making a move..." : "Make an optimal white play"
        const blackLabel = blackWaiting ? "Black is making a move..." : "Make an optimal black play"
        return html`
            <div class="controls">
                <mwc-button class="button white" raised label=${whiteLabel} ?disabled=${disabled || whiteWaiting}></mwc-button>
                <mwc-button class="button black" raised label=${blackLabel} ?disabled=${disabled || blackWaiting}></mwc-button>
                ${tookWhite && html`<span class="took-measure white">Took ${tookWhite}ms</span>`}
                ${tookBlack && html`<span class="took-measure black">Took ${tookBlack}ms</span>`}
            </div>
        `
    }
}
