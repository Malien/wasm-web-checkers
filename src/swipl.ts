import { NewType, wrap } from "./newtype"

const filterNumericKeys = <T>(obj: T): Omit<T, number> =>
    Object.fromEntries(
        Object.entries(obj).filter(([key]) => Number.parseInt(key) !== Number.NaN)
    ) as any

export enum TermType {
    VARIABLE = 1,
    ATOM = 2,
    INTEGER = 3,
    FLOAT = 4,
    STRING = 5,
    TERM = 6,
    NIL = 7,
    BLOB = 8,
    LIST_PAIR = 9,
    FUNCTOR = 10,
    LIST = 11,
    CHARS = 12,
    POINTER = 13,
    CODE_LIST = 14,
    CHAR_LIST = 15,
    BOOL = 16,
    FUNCTOR_CHARS = 17,
    PREDICATE_INDICATOR = 18,
    SHORT = 19,
    INT = 20,
    LONG = 21,
    DOUBLE = 22,
    NCHARS = 23,
    UTF8_CHARS = 24,
    UTF8_STRING = 25,
    INT64 = 26,
    NUTF8_CHARS = 27,
    NUTF8_CODES = 28,
    NUTF8_STRING = 29,
    NWCHARS = 30,
    NWCODES = 31,
    NWSTRING = 32,
    MBCHARS = 33,
    MBCODES = 34,
    MBSTRING = 35,
    INTPTR = 36,
    CHAR = 37,
    CODE = 38,
    BYTE = 39,
    PARTIAL_LIST = 40,
    CYCLIC_TERM = 41,
    NOT_A_LIST = 42,
    DICT = 43,
}

export enum CharBufferFlags {
    CVT_ATOM = 0x00000001,
    CVT_STRING = 0x00000002,
    CVT_LIST = 0x00000004,
    CVT_INTEGER = 0x00000008,
    CVT_RATIONAL = 0x00000010,
    CVT_FLOAT = 0x00000020,
    CVT_VARIABLE = 0x00000040,
    CVT_NUMBER = CVT_RATIONAL | CVT_FLOAT,
    CVT_ATOMIC = CVT_NUMBER | CVT_ATOM | CVT_STRING,
    CVT_WRITE = 0x00000080,
    CVT_WRITE_CANONICAL = 0x00000080,
    CVT_WRITEQ = 0x000000c0,
    CVT_ALL = CVT_ATOMIC | CVT_LIST,
    CVT_MASK = 0x00000fff,

    CVT_EXCEPTION = 0x00001000 /* throw exception on error */,
    CVT_VARNOFAIL = 0x00002000 /* return 2 if argument is unbound */,

    BUF_DISCARDABLE = 0x00000000 /* Store in single thread-local buffer */,
    BUF_STACK = 0x00010000 /* Store in stack of buffers */,
    BUF_MALLOC = 0x00020000 /* Store using PL_malloc() */,
    BUF_ALLOW_STACK = 0x00040000 /* Allow pointer into (global) stack */,

    BUF_RING = BUF_STACK /* legacy ring buffer */,

    REP_ISO_LATIN_1 = 0x00000000 /* output representation */,
    REP_UTF8 = 0x00100000,
    REP_MB = 0x00200000,
}

const plHeaderConstants = {
    Q_NORMAL: 0x0002,
    ...filterNumericKeys(CharBufferFlags),
    ...filterNumericKeys(TermType),
} as const

export type PLHeaderConstants = typeof plHeaderConstants

export type Ptr = number
export type TermRef = NewType<Ptr, { readonly TERM: unique symbol }>
export type ModulePtr = NewType<Ptr, { readonly MODULE: unique symbol }>
export type PredicatePtr = NewType<Ptr, { readonly PREDICATE: unique symbol }>
export type AtomPtr = NewType<Ptr, { readonly ATOM: unique symbol }>
export type FunctorPtr = NewType<Ptr, { readonly FUNCTOR: unique symbol }>
export type QueryID = NewType<number, { readonly QID: unique symbol }>
export type OperationResult = 0 | 1

export interface Bindings {
    initialise(argc: number, argv: Ptr): OperationResult
    newTermRef(): TermRef
    charsToTerm(value: string, term: TermRef): OperationResult
    call(term: TermRef, module: ModulePtr): OperationResult
    predicate(name: string, arity: number, module: string): PredicatePtr
    pred(nameAndArity: string, module: ModulePtr): PredicatePtr
    newTermRefs(amount: number): TermRef
    putAtomChars(term: TermRef, value: string): OperationResult
    callPredicate(
        module: ModulePtr,
        flags: number,
        predicate: PredicatePtr,
        terms: TermRef
    ): OperationResult
    openQuery(module: ModulePtr, flags: number, predicate: PredicatePtr, term: TermRef): QueryID
    nextSolution(query: QueryID): OperationResult
    cutQuery(query: QueryID): OperationResult
    closeQuery(query: QueryID): OperationResult
    currentQuery(): QueryID
    termType(term: TermRef): TermType
    newAtom(value: string): AtomPtr
    atomChars(atom: AtomPtr): string
    newFunctor(atom: AtomPtr, arity: number): FunctorPtr
    functorName(functor: FunctorPtr): AtomPtr
    functorArity(functor: FunctorPtr): number
    getAtom(term: TermRef, pointerToAtomToBeWrittenTo: Ptr): OperationResult
    getAtomChars(term: TermRef, pointerToCharPointerToBeWrittenTo: Ptr): OperationResult
    // getStringChars(
    //     term: TermPtr,
    //     pointerToCharPointerToBeWrittenTo: number,
    //     pointerToSizeToBeWrittenTo: number
    // ): OperationResult
    getChars(
        term: TermRef,
        pointerToCharPointerToBeWrittenTo: Ptr,
        flags: CharBufferFlags
    ): OperationResult
    getNameArity(
        term: TermRef,
        pointerToAtomPtrToBeWrittenTo: Ptr,
        pointerToArityToBeWrittenTo: Ptr
    ): OperationResult
    getCompoundNameArity(
        term: TermRef,
        pointerToAtomPtrToBeWrittenTo: Ptr,
        pointerToArityToBeWrittenTo: Ptr
    ): OperationResult
    getArg(index: number, term: TermRef, output: TermRef): OperationResult
    copyTermRef(term: TermRef): TermRef
    putInteger(term: TermRef, integer: number): OperationResult
    getInteger(term: TermRef, pointerToIntToBeWrittenTo: Ptr): OperationResult
    putTerm(into: TermRef, from: TermRef): OperationResult
    getFloat(term: TermRef, pointerToDoubleToBeWrittenTo: Ptr): OperationResult
    getList(term: TermRef, head: TermRef, tail: TermRef): OperationResult
}

const createBindings = (): Bindings => ({
    initialise: cwrap("PL_initialise", "number", ["number", "number"]),
    newTermRef: cwrap("PL_new_term_ref", "number", []),
    charsToTerm: cwrap("PL_chars_to_term", "number", ["string", "number"]),
    call: cwrap("PL_call", "number", ["number", "number"]),
    predicate: cwrap("PL_predicate", "number", ["string", "number", "string"]),
    pred: cwrap("PL_pred", "number", ["string", "number"]),
    newTermRefs: cwrap("PL_new_term_refs", "number", ["number"]),
    putAtomChars: cwrap("PL_put_atom_chars", "number", ["number", "string"]),
    callPredicate: cwrap("PL_call_predicate", "boolean", ["number", "number", "number", "number"]),
    openQuery: cwrap("PL_open_query", "number", ["number", "number", "number", "number"]),
    nextSolution: cwrap("PL_next_solution", "number", ["number"]),
    cutQuery: cwrap("PL_cut_query", "number", ["number"]),
    closeQuery: cwrap("PL_close_query", "number", ["number"]),
    currentQuery: cwrap("PL_current_query", "number", []),
    termType: cwrap("PL_term_type", "number", ["number"]),
    newAtom: cwrap("PL_new_atom", "number", ["string"]),
    atomChars: cwrap("PL_atom_chars", "string", ["number"]),
    newFunctor: cwrap("PL_new_functor", "number", ["number", "number"]),
    functorName: cwrap("PL_functor_name", "number", ["number"]),
    functorArity: cwrap("PL_functor_arity", "number", ["number"]),
    getAtom: cwrap("PL_get_atom", "number", ["number", "number"]),
    getAtomChars: cwrap("PL_get_atom_chars", "number", ["number", "number"]),
    // getStringChars: cwrap("", "number", ["number", "number", "number"]),
    getChars: cwrap("PL_get_chars", "number", ["number", "number", "number"]),
    getNameArity: cwrap("PL_get_name_arity", "number", ["number", "number", "number"]),
    getCompoundNameArity: cwrap("PL_get_compound_name_arity", "number", [
        "number",
        "number",
        "number",
    ]),
    getArg: cwrap("PL_get_arg", "number", ["number", "number", "number"]),
    copyTermRef: cwrap("PL_copy_term_ref", "number", ["number"]),
    putInteger: cwrap("PL_put_integer", "number", ["number", "number"]),
    getInteger: cwrap("PL_get_integer", "number", ["number", "number"]),
    putTerm: cwrap("PL_put_term", "number", ["number", "number"]),
    getFloat: cwrap("PL_get_float", "number", ["number", "number"]),
    getList: cwrap("PL_get_list", "number", ["number", "number", "number"]),
})

export type Prolog = PLHeaderConstants & Bindings

const initialise = (PL: Prolog, module: EmscriptenModule) => {
    const argvArray = [
        allocate(intArrayFromString("swipl"), "i8", ALLOC_NORMAL),
        allocate(intArrayFromString("-x"), "i8", ALLOC_NORMAL),
        allocate(intArrayFromString("wasm-preload/swipl.prc"), "i8", ALLOC_NORMAL),
        allocate(intArrayFromString("--nosignals"), "i8", ALLOC_NORMAL),
    ]
    const argvPtr = module._malloc(argvArray.length * 4)
    for (let i = 0; i < argvArray.length; i++) {
        setValue(argvPtr + i * 4, argvArray[i], "*")
    }
    if (!PL.initialise(4, argvPtr)) {
        throw new Error("SWI-Prolog initialisation failed")
    }
    // Set the path of the preloaded (from swipl-web.dat) standard library.
    // This makes it possible to call use_module(library(lists)) and so on.
    // call(PL, "assert(user:file_search_path(library, 'wasm-preload/library')).")
    const ref = PL.newTermRef()
    if (!PL.charsToTerm("assert(user:file_search_path(library, 'wasm-preload/library')).", ref)) {
        throw new Error("SWI-Prolog initialisation failed")
    }
    return PL.call(ref, wrap(0))
}

let globalPL: Prolog | undefined

const innerInitPL = () => {
    if (globalPL) return globalPL

    const pl = {
        ...createBindings(),
        ...plHeaderConstants,
    }
    initialise(pl, Module)
    return pl
}

export const initPL = () =>
    new Promise<Prolog>(resolve => {
        if (globalPL) return resolve(globalPL)

        const handler = (ev: MessageEvent) => {
            if (ev.data === "pl-loaded") {
                resolve(globalPL!)
                globalThis.removeEventListener("message", handler)
            }
        }

        globalThis.addEventListener("message", handler)
    })

declare global {
    var Module: EmscriptenModule
}

let stdin = ""
let stdinPosition = 0
// We use this to provide data into
// the SWI stdin.
const setStdin = (str: string) => {
    stdin = str
    stdinPosition = 0
}
const readStdin = () => {
    if (stdinPosition >= stdin.length) {
        return null
    } else {
        const code = stdin.charCodeAt(stdinPosition)
        stdinPosition++
        return code
    }
}

const postMessage = (message: any) => {
    if (globalThis.Window) {
        globalThis.postMessage(message, origin)
    } else {
        ;(globalThis as any).postMessage(message)
    }
}

const configureModule = (location: string): EmscriptenModule =>
    (({
        noInitialRun: true,
        locateFile: url => `/${location}/${url}`,
        print: console.log,
        printErr: console.error,
        // @ts-ignore
        preRun: [() => FS.init(readStdin)], // sets up stdin
        onRuntimeInitialized: () => {
            globalPL = innerInitPL()
            postMessage("pl-loaded")
        },
    } as Partial<EmscriptenModule>) as any)

/**
 * This will fetch all of the binaries and glue code from provided directory
 * and evaluate it's contents using `eval` function! This is expected to be
 * called only once! use initPL() to get promise to the initialized runtime.
 * Module object will be attached to the global object.
 * @param location path to the directory with the swipl-wasm dist. 
 *                 Do not put slashes at the end of string.
 * @returns promise to the loaded swipl bindings
 */
export const loadSwiplBinary = (location: string) => {
    globalThis.Module = configureModule(location)
    fetch(globalThis.Module.locateFile("swipl-web.js", undefined as any))
        .then(r => r.text())
        .then(eval)
    return initPL()
}

/**
 * If you are loading swipl-wasm using glue code in the script tag, use this one!
 * This is expected to be called only once! use initPL() to get promise to the
 * initialized runtime.
 * @param location path to the directory with the swipl-wasm dist. 
 *                 Do not put slashes at the end of string.
 * @returns promise to the loaded swipl bindings
 */
export const configureExternallyLoadedSwipl = (location: string) => {
    globalThis.Module = configureModule(location)
}

// // Stub Module object. Used by swipl-web.js to
// // populate the actual Module object.
// globalThis.Module = ({
//     noInitialRun: true,
//     locateFile: url => `/swipl-wasm/${url}`,
//     print: console.log,
//     printErr: console.error,
//     // @ts-ignore
//     preRun: [() => FS.init(readStdin)], // sets up stdin
//     onRuntimeInitialized: () => {
//         globalPL = innerInitPL()
//         postMessage("pl-loaded")
//     },
// } as Partial<EmscriptenModule>) as any
