import { Prolog, TermPtr, TermType } from "./swipl"

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
    constructor(private PL: Prolog, private term: TermPtr) { }

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
}

export const assertTermType = (PL: Prolog, term: TermPtr) => new TermTypeAssertion(PL, term)
