import { NewType, wrap } from "./newtype"

const filterNumericKeys = <T>(obj: T): Omit<T, number> =>
    Object.fromEntries(
        Object.entries(obj).filter(([key]) => Number.parseInt(key) !== Number.NaN)
    ) as any

enum TermType {
    VARIABLE = 1,
    ATOM = 2,
    INTEGER = 3,
    RATIONAL = 4,
    FLOAT = 5,
    STRING = 6,
    TERM = 7,
    NIL = 8,
    BLOB = 9,
    LIST_PAIR = 10,
    FUNCTOR = 11,
    LIST = 12,
    CHARS = 13,
    POINTER = 14,
    CODE_LIST = 15,
    CHAR_LIST = 16,
    BOOL = 17,
    FUNCTOR_CHARS = 18,
    PREDICATE_INDICATOR = 19,
    SHORT = 20,
    INT = 21,
    LONG = 22,
    DOUBLE = 23,
    NCHARS = 24,
    UTF8_CHARS = 25,
    UTF8_STRING = 26,
    INT64 = 27,
    NUTF8_CHARS = 28,
    NUTF8_CODES = 29,
    NUTF8_STRING = 30,
    NWCHARS = 31,
    NWCODES = 32,
    NWSTRING = 33,
    MBCHARS = 34,
    MBCODES = 35,
    MBSTRING = 36,
    INTPTR = 37,
    CHAR = 38,
    CODE = 39,
    BYTE = 40,
    PARTIAL_LIST = 41,
    CYCLIC_TERM = 42,
    NOT_A_LIST = 43,
    DICT = 44,
}

const plHeaderConstants = {
    Q_NORMAL: 0x0002,
    ...filterNumericKeys(TermType),
} as const

type PLHeaderConstants = typeof plHeaderConstants

type Ptr = number
type TermPtr = NewType<Ptr, { readonly TERM: unique symbol }>
type ModulePtr = NewType<Ptr, { readonly MODULE: unique symbol }>
type PredicatePtr = NewType<Ptr, { readonly PREDICATE: unique symbol }>
type AtomPtr = NewType<Ptr, { readonly ATOM: unique symbol }>
type FunctorPtr = NewType<Ptr, { readonly FUNCTOR: unique symbol }>
type QueryID = NewType<number, { readonly QID: unique symbol }>
type OperationResult = 0 | 1

interface Bindings {
    initialise(argc: number, argv: Ptr): OperationResult
    newTermRef(): TermPtr
    charsToTerm(value: string, term: TermPtr): OperationResult
    call(term: TermPtr, module: ModulePtr): OperationResult
    predicate(name: string, arity: number, module: string): PredicatePtr
    pred(nameAndArity: string, module: ModulePtr): PredicatePtr
    newTermRefs(amount: number): TermPtr
    putAtomChars(term: TermPtr, value: string): OperationResult
    callPredicate(
        module: ModulePtr,
        flags: number,
        predicate: PredicatePtr,
        terms: TermPtr
    ): OperationResult
    openQuery(module: ModulePtr, flags: number, predicate: PredicatePtr, term: TermPtr): QueryID
    nextSolution(query: QueryID): OperationResult
    cutQuery(query: QueryID): OperationResult
    closeQuery(query: QueryID): OperationResult
    currentQuery(): QueryID
    termType(term: TermPtr): TermType
    newAtom(value: string): AtomPtr
    atomChars(atom: AtomPtr): string
    newFunctor(atom: AtomPtr, arity: number): FunctorPtr
    functorName(functor: FunctorPtr): AtomPtr
    functorArity(functor: FunctorPtr): number
    getAtom(term: TermPtr, pointerToAtomToBeWrittenTo: number): OperationResult
    getAtomChars(term: TermPtr, pointerToCharPointerToBeWrittenTo: number): OperationResult
}

// const createBindings = (): Bindings => ({
//     initialise: cwrap("PL_initialise", "number", ["number", "number"]),
//     newTermRef: cwrap("PL_new_term_ref", "number", []),
//     charsToTerm: cwrap("PL_chars_to_term", "number", ["string", "number"]),
//     call: cwrap("PL_call", "number", ["number", "number"]),
//     predicate: cwrap("PL_predicate", "number", ["string", "number", "string"]),
//     pred: cwrap("PL_pred", "number", ["string", "number"]),
//     newTermRefs: cwrap("PL_new_term_refs", "number", ["number"]),
//     putAtomChars: cwrap("PL_put_atom_chars", "number", ["number", "string"]),
//     callPredicate: cwrap("PL_call_predicate", "boolean", ["number", "number", "number", "number"]),
//     openQuery: cwrap("PL_open_query", "number", ["number", "number", "number", "number"]),
//     nextSolution: cwrap("PL_next_solution", "number", ["number"]),
//     cutQuery: cwrap("PL_cut_query", "number", ["number"]),
//     closeQuery: cwrap("PL_close_query", "number", ["number"]),
//     currentQuery: cwrap("PL_current_query", "number", []),
//     termType: cwrap("PL_term_type", "number", ["number"]),
//     newAtom: cwrap("PL_new_atom", "number", ["string"]),
//     atomChars: cwrap("PL_atom_chars", "string", ["number"]),
//     newFunctor: cwrap("PL_new_functor", "number", ["number", "number"]),
//     functorName: cwrap("PL_functor_name", "number", ["number"]),
//     functorArity: cwrap("PL_functor_arity", "number", ["number"]),
//     getAtom: cwrap("PL_get_atom", "number", ["number", "number"]),
//     getAtomChars: cwrap("PL_get_atom_chars", "number", ["number", "number"]),
// })

// class PL {
//     constructor(public bindings: Bindings) {}
// }

// const init = () => new Promise<PL>((resolve, reject) => {})

// const __resolveBindings__ = (bindings: Bindings) => {}

let PL: Prolog | undefined

// let PL: Prolog | undefined
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
const output = document.getElementById("output") as HTMLPreElement
const input = document.getElementById("input") as HTMLFormElement
const editor = document.getElementById("editor") as HTMLFormElement

// Helper function to call a query.
const query = (PL: Prolog, input: string) => {
    // Show the query in the console output.
    const node = document.createTextNode(input + "\n")
    output.appendChild(node)
    setStdin(input)
    // This will execute one iteration of toplevel.
    call(PL, "break") // see call.js
}

input.addEventListener("submit", e => {
    e.preventDefault()
    // @ts-ignore
    query(PL!, e.target.elements.query.value)
    // @ts-ignore
    e.target.elements.query.value = ""
})

editor.addEventListener("submit", e => {
    e.preventDefault()
    // @ts-ignore
    const fileContents = e.target.elements.file.value
    FS.writeFile("/file.pl", fileContents)
    query(PL!, "consult('/file.pl').")
    doShenanigans(PL!)
})

// Helper to print stdout from SWI.
const printOut = (line: string) => {
    output.appendChild(document.createTextNode(line + "\n"))
}

// Helper to print stderr from SWI.
const printErr = (line: string) => {
    const node = document.createElement("span")
    node.className = "output-error"
    node.textContent = line + "\n"
    output.appendChild(node)
}

type Prolog = Bindings & PLHeaderConstants

// Creates bindings to the SWI foreign API.
const createBindings = (): Prolog => ({
    ...plHeaderConstants,
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
})

// Helper function to parse a JavaScript
// string into a Prolog term and call is as a query.
const call = (PL: Prolog, query: string) => {
    const ref = PL.newTermRef()
    if (!PL.charsToTerm(query, ref)) {
        throw new Error("Query has a syntax error: " + query)
    }
    return !!PL.call(ref, wrap(0))
}

// This will set up the arguments necessary for the PL_initialise
// function and will call it.
// See http://www.swi-prolog.org/pldoc/doc_for?object=c(%27PL_initialise%27)
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
        throw new Error("SWI-Prolog initialisation failed.")
    }
    // Set the path of the preloaded (from swipl-web.dat) standard library.
    // This makes it possible to call use_module(library(lists)) and so on.
    call(PL, "assert(user:file_search_path(library, 'wasm-preload/library')).")
}

const getI32Value = (ptr: number) => Module.HEAP32[ptr / 4]!

const loadMainProgram = async (PL: Prolog) => {
    const response = await fetch("/main.pl")
    const fileContents = await response.arrayBuffer()
    if (!response.ok) {
        throw new Error(
            `Can't retrieve main program: Status: ${response.status} ${response.statusText}\n${fileContents}`
        )
    }
    FS.writeFile("/main.pl", new Uint8Array(fileContents))
    call(PL, "consult('/main.pl').")
}

const getAtomTermName = (PL: Prolog, term: TermPtr): string => {
    const atomName = allocate(1, "i32", ALLOC_NORMAL)
    if (!PL.getAtomChars(term, atomName)) {
        throw new Error("Couldn't get atom name")
    }
    return UTF8ToString(getI32Value(atomName))
}

const doShenanigans = (PL: Prolog) => {
    // const pred = PL.predicate("is3", 1, "user")
    // const term = PL.newTermRefs(1)
    // PL.putAtomChars(term, "bar")
    // const rval = PL.callPredicate(wrap(0), PL.Q_NORMAL, pred, term)
    // console.log({ pred, term, rval })

    const thingPred = PL.predicate("thing", 1, "user")
    const term = PL.newTermRef()
    const query = PL.openQuery(wrap(0), PL.Q_NORMAL, thingPred, term)
    while (PL.nextSolution(query)) {
        const termType = PL.termType(term)
        console.log(termType, TermType[termType])
        if (termType === TermType.ATOM) {
            console.log(getAtomTermName(PL, term))
        }
    }
    PL.closeQuery(query)
}

declare global {
    var Module: EmscriptenModule
}

// Stub Module object. Used by swipl-web.js to
// populate the actual Module object.
window.Module = ({
    noInitialRun: true,
    locateFile: url => `/swipl-wasm/${url}`,
    print: printOut,
    printErr: printErr,
    // @ts-ignore
    preRun: [() => FS.init(readStdin)], // sets up stdin
    onRuntimeInitialized: async () => {
        document.getElementById("top")!.classList.remove("loading")
        // Bind foreign functions to JavaScript.
        PL = createBindings()
        // Initialise SWI-Prolog.
        initialise(PL, Module)
        await loadMainProgram(PL)
        doShenanigans(PL)
        // doShenanigans(bindings, Module)
    },
} as Partial<EmscriptenModule>) as any
