import { NewType, unwrap, wrap } from "./newtype"
import {
    AtomPtr,
    CharBufferFlags,
    OperationResult,
    PredicatePtr,
    Prolog,
    Ptr,
    TermPtr,
} from "./swipl"

export const getI32Value = (ptr: number) => Module.HEAP32[ptr / 4]!

export const call = (PL: Prolog, query: string): OperationResult => {
    const ref = PL.newTermRef()
    if (!PL.charsToTerm(query, ref)) {
        throw new Error("Query has a syntax error: " + query)
    }
    return PL.call(ref, wrap(0))
}

export const callPredicate = (PL: Prolog, pred: PredicatePtr, terms: TermPtr): OperationResult =>
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
export const getAtomTermName = (PL: Prolog, term: TermPtr): string => {
    const atomName = allocate(1, "i32", ALLOC_NORMAL)
    if (!PL.getAtomChars(term, atomName)) {
        throw new Error("Couldn't get atom name")
    }
    return UTF8ToString(getI32Value(atomName))
}

export const getTermChars = (
    PL: Prolog,
    term: TermPtr,
    flags: CharBufferFlags = PL.CVT_ALL
): string => {
    const stringPtr = stackAlloc(4)
    if (
        !PL.getChars(term, stringPtr, flags | PL.BUF_DISCARDABLE | PL.REP_UTF8 | PL.CVT_EXCEPTION)
    ) {
        throw new Error("Could not read term string characters")
    }
    return UTF8ToString(getI32Value(stringPtr))
}

export const advancePtr = <P extends NewType<Ptr, any>>(ptr: P, by: number): P =>
    wrap(unwrap(ptr) + 4 * by)

export const getNameArity = (PL: Prolog, term: TermPtr): [name: string, arity: number] =>
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
