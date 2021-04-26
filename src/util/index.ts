import { Tuple } from "./types"

export * from "./compose"
export * from "./newtype"
export * from "./types"

export const allocateArray = <N extends number, T = undefined>(length: N, fill?: T) =>
    Array(length).fill(fill) as Tuple<T, N>
