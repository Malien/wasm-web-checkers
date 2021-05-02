import { css, customElement, html, property } from "lit-element"
import { EngineType, SearchAlgorithm } from "../common"
import "@material/mwc-select";
import { Select } from "@material/mwc-select"
import "@material/mwc-textfield"
import { TextField } from "@material/mwc-textfield"
import "@material/mwc-snackbar"
import Controls from "./Controls"
import { ifDefined } from "../util/directives";

export class BackendChangeEvent extends Event {
    constructor(public newValue: EngineType) {
        super("checkers-backend-change", { bubbles: true, composed: true })
    }
}

export class AlgorithmChangeEvent extends Event {
    constructor(public newValue: SearchAlgorithm) {
        super("checkers-algorithm-change", { bubbles: true, composed: true })
    }
}

export class SearchDepthChangeEvent extends Event {
    constructor(public newValue: number) {
        super("checkers-search-depth-change", { bubbles: true, composed: true })
    }
}

@customElement("checkers-settings")
export default class Settings extends Controls {
    static styles = css`
        .lower {
            max-width: 1000px;
            margin: auto;
        }

        .algorithm-settings {
            margin: 20px;
            margin-bottom: 0px;
            display: grid;
            grid-template-columns: 1fr 2fr 1fr;
            gap: 20px;
        }

        @media screen and (max-width: 600px) {
            .algorithm-settings {
                grid-template-columns: auto;
            }
        }
    `

    @property({ type: String })
    backend: EngineType = "js"

    @property({ type: String })
    algorithm: SearchAlgorithm = "alphabeta"

    @property({ type: Number, attribute: "search-depth" })
    searchDepth = 3

    handleBackend(ev: Event) {
        ev.stopPropagation()
        const backendSelect = ev.target as Select
        dispatchEvent(new BackendChangeEvent(backendSelect.value as EngineType))
    }

    handleAlgorithm(ev: Event) {
        ev.stopPropagation()
        const algoSelect = ev.target as Select
        dispatchEvent(new AlgorithmChangeEvent(algoSelect.value as SearchAlgorithm))
    }

    handleInput(ev: Event) {
        ev.stopPropagation()
        const textField = ev.target as TextField
        const value = parseInt(textField.value)
        if (!Number.isNaN(value) && value > 0) {
            this.dispatchEvent(new SearchDepthChangeEvent(value))
        }
    }

    render() {
        const {
            algorithm,
            backend,
            searchDepth,
            disabled,
            handleAlgorithm,
            handleBackend,
            tookBlack,
            tookWhite,
            whiteWaiting,
            blackWaiting,
            handleInput,
        } = this
        return html`
            <div class="lower">
                <div class="algorithm-settings">
                    <mwc-select
                        filled
                        class="backend-select"
                        label="Backend"
                        ?disabled=${disabled}
                        @selected=${handleBackend}
                    >
                        <mwc-list-item value="js" ?selected=${backend === "js"}> JS </mwc-list-item>
                        <mwc-list-item value="swipl" ?selected=${backend === "swipl"}>
                            SWI-Prolog
                        </mwc-list-item>
                    </mwc-select>

                    <mwc-select
                        filled
                        class="algo-select"
                        label="Search Algorithm"
                        ?disabled=${disabled}
                        @selected=${handleAlgorithm}
                    >
                        <mwc-list-item value="alphabeta" ?selected=${algorithm === "alphabeta"}>
                            Alpha-Beta Pruning
                        </mwc-list-item>
                        <mwc-list-item value="minimax" ?selected=${algorithm === "minimax"}>
                            Minimax
                        </mwc-list-item>
                    </mwc-select>

                    <mwc-textfield
                        label="Search Depth"
                        type="number"
                        value=${searchDepth}
                        min="1"
                        ?disabled=${disabled}
                        @input=${handleInput}
                        validationMessage="Search depth must be a number greater than 0"
                    ></mwc-textfield>
                </div>

                <checkers-controls
                    ?disabled=${disabled}
                    took-black=${ifDefined(tookBlack)}
                    took-white=${ifDefined(tookWhite)}
                    ?white-waiting=${whiteWaiting}
                    ?black-waiting=${blackWaiting}
                ></checkers-controls>
            </div>
        `
    }
}
