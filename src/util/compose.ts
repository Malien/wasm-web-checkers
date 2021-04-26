import { Last, OneArgFunction, Tuple } from "./types"

type NonEmptyFsTuple = [...OneArgFunction[], OneArgFunction]

type ComposedFn<Fs extends NonEmptyFsTuple> = (
    ...args: Parameters<Fs[0]>
) => ReturnType<Last<Fs>>

export function compose<Fs extends NonEmptyFsTuple>(...fs: Fs): ComposedFn<Fs>
export function compose(...fs: OneArgFunction[]) {
    return (arg: any) => {
        let current = arg
        for (const f of fs) {
            current = f(current)
        }
        return current
    }
}
