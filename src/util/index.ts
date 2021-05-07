import { Position } from "src/common"
import { Tuple } from "./types"

export * from "./compose"
export * from "./newtype"
export * from "./types"
export { default as measureWithResult } from "./measureWithResult"

export const allocateArray = <N extends number, T = undefined>(length: N, fill?: T) =>
    Array(length).fill(fill) as Tuple<T, N>

export const cmpPositions = ([a, b]: Position, [x, y]: Position) => a == x && b == y

export const capitalize = (str: string) => {
    if (!str) return str
    return str[0]!.toLocaleUpperCase() + str.slice(1)
}
