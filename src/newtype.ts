export interface NewType<Repr, Value> {
    readonly $repr: Repr
    readonly $value: Value
}

type AnyNewType = NewType<any, any>
type ContentsOf<T extends AnyNewType> = T["$repr"]

// These are just no-ops but their use is to explicitly extract / wrap inner value
export const wrap = <T extends AnyNewType>(value: ContentsOf<T>): T => value as any
export const unwrap = <T extends AnyNewType>(value: T): ContentsOf<T> => value as any
