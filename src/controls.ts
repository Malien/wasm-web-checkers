import { html } from "lit-html"

interface ControlsProps {
    whiteWaiting?: boolean
    blackWaiting?: boolean
    tookWhite?: number
    tookBlack?: number
    onWhiteClick?: () => void
    onBlackClick?: () => void
    disabled?: boolean
}

export const Controls = ({
    whiteWaiting,
    onWhiteClick,
    onBlackClick,
    blackWaiting,
    tookWhite,
    tookBlack,
    disabled
}: ControlsProps) => html`
    <div class="controls">
        ${Button({
            label: whiteWaiting ? "White is making a move..." : "Make optimal white play",
            disabled: disabled || whiteWaiting,
            onClick: onWhiteClick,
        })}
        ${Button({
            label: blackWaiting ? "Black is making a move..." : "Make optimal black play",
            disabled: disabled || blackWaiting,
            onClick: onBlackClick,
        })}
        ${tookWhite && html`<span class="took-measure left">Took ${tookWhite}ms</span>`}
        ${tookBlack && html`<span class="took-measure right">Took ${tookBlack}ms</span>`}
    </div>
`

interface ButtonProps {
    label?: string
    onClick?: () => void
    disabled?: boolean
}

const Button = ({ label, onClick, disabled }: ButtonProps) => html`
    <button
        class="foo-button mdc-button mdc-button--raised"
        ?disabled=${disabled}
        @click=${onClick}
    >
        <div class="mdc-button__ripple"></div>
        <span class="mdc-button__label">${label}</span>
    </button>
`
