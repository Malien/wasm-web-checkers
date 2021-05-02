import { AttributePart, directive } from "lit-html"

export const ifDefined = directive((value: any) => (part: AttributePart) => {
    if (value !== undefined) part.setValue(value)
})