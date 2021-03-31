import { NewType, unwrap, wrap } from "./newtype"
import {
    AtomPtr,
    CharBufferFlags,
    OperationResult,
    PredicatePtr,
    Prolog,
    Ptr,
    TermRef,
} from "./swipl"

export const getI32Value = (ptr: number) => Module.HEAP32[ptr / 4]!
export const getF64Value = (ptr: number) => Module.HEAPF64[ptr / 8]!

export const call = (PL: Prolog, query: string): OperationResult => {
    const ref = PL.newTermRef()
    if (!PL.charsToTerm(query, ref)) {
        throw new Error("Query has a syntax error: " + query)
    }
    return PL.call(ref, wrap(0))
}

export const callPredicate = (PL: Prolog, pred: PredicatePtr, terms: TermRef): OperationResult =>
    PL.callPredicate(wrap(0), PL.Q_NORMAL, pred, terms)

export const loadProgramFile = async (PL: Prolog, response: Response | ArrayBuffer) => {
    const fileContents = response instanceof Response ? await response.arrayBuffer() : response
    FS.writeFile("/main.pl", new Uint8Array(fileContents))
    call(PL, "consult('/main.pl').")
}

/**
 * Retrieves atom name from term.
 * NOTE: call only if term is a atom
 */
export const getAtomChars = (PL: Prolog, term: TermRef): string => withStack(() => {
    const atomName = stackAlloc(4)
    if (!PL.getAtomChars(term, atomName)) {
        throw new Error("Could not get atom name")
    }
    return UTF8ToString(getI32Value(atomName))
})

export const getInteger = (PL: Prolog, term: TermRef): number => withStack(() => {
    const intPtr = stackAlloc(4)
    if (!PL.getInteger(term, intPtr)) {
        throw new Error("Could not get term's integer value")
    }
    return getI32Value(intPtr)
})

export const getFloat = (PL: Prolog, term: TermRef): number => withStack(() => {
    const floatPtr = stackAlloc(8)
    if (!PL.getFloat(term, floatPtr)) {
        throw new Error("Could not get term's floating point value")
    }
    return getF64Value(floatPtr)
})

export const getTermChars = (
    PL: Prolog,
    term: TermRef,
    flags: CharBufferFlags = PL.CVT_ALL
): string => withStack(() => {
    const stringPtr = stackAlloc(4)
    if (
        !PL.getChars(term, stringPtr, flags | PL.BUF_DISCARDABLE | PL.REP_UTF8 | PL.CVT_EXCEPTION)
    ) {
        throw new Error("Could not read term string characters")
    }
    return UTF8ToString(getI32Value(stringPtr))
})

export const advancePtr = <P extends NewType<Ptr, any>>(ptr: P, by: number): P =>
    wrap(unwrap(ptr) + 4 * by)

export type NameAndArity = [name: string, arity: number]

export const getNameArity = (PL: Prolog, term: TermRef): NameAndArity =>
    withStack(() => {
        const atomPtr = stackAlloc(4)
        const arityPtr = stackAlloc(4)
        PL.getNameArity(term, atomPtr, arityPtr)

        const atom: AtomPtr = wrap(getI32Value(atomPtr))
        const atomName = PL.atomChars(atom)
        const arity = getI32Value(arityPtr)

        return [atomName, arity]
    })

export const withStack = <R>(block: () => R): R => {
    const stackPtr = stackSave()
    const returnValue = block()
    stackRestore(stackPtr)
    return returnValue
}

/**
 * @note Term should be of type TERM or FUNCTOR
 */
export function constructArgsArray<R>(PL: Prolog, term: TermRef, transform: (arg: TermRef) => R): R[]
export function constructArgsArray<R, N extends number>(PL: Prolog, term: TermRef, transform: (arg: TermRef) => R, arity: N): Tuple<R, N>
export function constructArgsArray<R>(
    PL: Prolog,
    term: TermRef,
    transform: (arg: TermRef) => R,
    arity?: number
): R[] {
    if (arity === undefined) {
        ;[, arity] = getNameArity(PL, term)
    }

    const arr: R[] = []
    const arg = PL.newTermRef()
    for (let i = 1; i <= arity; ++i) {
        if (!PL.getArg(i, term, arg)) {
            throw new Error(`Cannot retrieve argument to a compound term at index ${i}`)
        }
        arr.push(transform(arg))
    }

    return arr
}

type Tuple<T, N extends number> = N extends N
    ? number extends N
        ? T[]
        : _TupleOf<T, N, []>
    : never
type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
    ? R
    : _TupleOf<T, N, [T, ...R]>

export const newTermRefs = <N extends number>(PL: Prolog, amount: N): Tuple<TermRef, N> => {
    const terms = PL.newTermRefs(amount)
    return [...Array(amount).keys()].map(i => wrap(unwrap(terms) + i)) as Tuple<TermRef, N>
}

export const openQuery = (PL: Prolog, predicate: PredicatePtr, terms: TermRef) =>
    PL.openQuery(wrap(0), PL.Q_NORMAL, predicate, terms)

export const collectList = <R>(PL: Prolog, term: TermRef, transform: (element: TermRef) => R): R[] => {
    const head = PL.newTermRef()
    const tail = PL.copyTermRef(term)
    const arr: R[] = []
    while (PL.getList(tail, head, tail)) {
        arr.push(transform(head))
    }
    return arr
}

type Tail<T extends any[]> = T extends [head: any, ...tail: infer Tail_] ? Tail_ : never

type AnyPrologFunctionMap = Record<string, (PL: Prolog, ...args: any[]) => any>

type Bound<T extends AnyPrologFunctionMap> = {
    [K in keyof T]: (...args: Tail<Parameters<T[K]>>) => ReturnType<T[K]>
}

export const bindPrologFunctions = <T extends AnyPrologFunctionMap>(funcs: T) => (
    PL: Prolog
): Bound<T> =>
    Object.fromEntries(
        Object.entries<any>(funcs).map(([name, f]) => [name, f.bind(this, PL)])
    ) as any

export const bind = bindPrologFunctions({
    call,
    callPredicate,
    loadProgramFile,
    getAtomChars,
    getTermChars,
    getNameArity,
    constructArgsArray,
    newTermRefs,
    openQuery,
    getInteger,
    getFloat,
})

export default { bind }
