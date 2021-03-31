export type Cell = "1" | "0" | "b" | "w" | "bq" | "wq"
export type BoardRow = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]
export type GameBoard = [
    BoardRow,
    BoardRow,
    BoardRow,
    BoardRow,
    BoardRow,
    BoardRow,
    BoardRow,
    BoardRow
]

export type Position = [x: number, y: number]

export type Move = {
    from: Position, to: Position
}