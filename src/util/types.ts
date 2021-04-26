export type AnyFunction = (...args: any[]) => any
export type ValuePromised<T> = T extends AnyFunction
    ? (...args: Parameters<T>) => Promise<ReturnType<T>>
    : Promise<T>
export type CoverPromises<T> = { [K in keyof T]: ValuePromised<T[K]> }

export type Tuple<T, N extends number> = N extends N
    ? number extends N
        ? T[]
        : _TupleOf<T, N, []>
    : never
type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
    ? R
    : _TupleOf<T, N, [T, ...R]>

export type OneArgFunction = (arg: any) => any

export type Last<T extends any[]> = T extends [...any[], infer R] ? R : never
