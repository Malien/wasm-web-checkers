import { Prolog, TermRef, TermType } from "./swipl"
import { bindPrologFunctions, getNameArity, NameAndArity } from "./util"

export class TermTypeError extends Error {
    constructor(public expected: TermType | TermType[], public got: TermType) {
        super(
            (() => {
                if (expected instanceof Array) {
                    return `TermTypeError: Expected term type to be one of ${expected
                        .map(type => TermType[type])
                        .join()}, got ${TermType[got]}`
                }
                return `TermTypeError: Expected term to be of type ${TermType[expected]}, got ${TermType[got]}`
            })()
        )
    }
}

class TermTypeAssertion {
    constructor(private PL: Prolog, private term: TermRef) {}

    private type = this.PL.termType(this.term)

    toBe(ofType: TermType) {
        if (this.type !== ofType) {
            throw new TermTypeError(ofType, this.type)
        }
    }

    toBeOneOf(...types: TermType[]) {
        if (!types.includes(this.type)) {
            throw new TermTypeError(types, this.type)
        }
    }

    toBeList() {
        this.toBeOneOf(TermType.LIST, TermType.LIST_PAIR, TermType.NIL)
    }
}

export const assertTermType = (PL: Prolog, term: TermRef) => new TermTypeAssertion(PL, term)

export function assertCompoundTermShape(
    PL: Prolog,
    term: TermRef,
    name: string,
    arity: number
): NameAndArity {
    assertTermType(PL, term).toBe(TermType.TERM)

    const [actualName, actualArity] = getNameArity(PL, term)

    if (name !== actualName && arity != actualArity) {
        throw new Error(`Expected board term to be "${name}/${arity}"`)
    }

    return [name, arity]
}

export const bind = bindPrologFunctions({ assertTermType, assertCompoundTermShape })

export default { bind }
