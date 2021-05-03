use js_sys;
use wasm_bindgen::prelude::*;

mod types;
mod handler;

use types::*;

// #[cfg(feature = "wee_alloc")]
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn sizes() -> TSSizes {
    use std::mem::size_of;
    Sizes {
        cell: size_of::<Cell>(),
        row: size_of::<Row>(),
        board: size_of::<Board>(),
    }
    .into()
}

fn within_bounds(Position { x, y }: &Position) -> bool {
    x >= &0 && x < &8 && y >= &0 && y < &8
}

fn bound_check(pos: &Position) -> Result<(), js_sys::Error> {
    if !within_bounds(pos) {
        let message = format!("Position [{}, {}] is out of bounds", pos.x, pos.y);
        Err(js_sys::Error::new(message.as_str()))
    } else {
        Ok(())
    }
}

fn promote(y: u8, cell: Cell) -> Cell {
    match (y, cell) {
        (7, Cell::BlackPiece) => Cell::BlackQueen,
        (0, Cell::WhitePiece) => Cell::WhiteQueen,
        _ => cell
    }
}

#[wasm_bindgen(js_name="initializeBoard")]
pub fn initialize_board() -> TSBoard {
    Board([
        Row([
            Cell::White,
            Cell::BlackPiece,
            Cell::White,
            Cell::BlackPiece,
            Cell::White,
            Cell::BlackPiece,
            Cell::White,
            Cell::BlackPiece,
        ]),
        Row([
            Cell::BlackPiece,
            Cell::White,
            Cell::BlackPiece,
            Cell::White,
            Cell::BlackPiece,
            Cell::White,
            Cell::BlackPiece,
            Cell::White,
        ]),
        Row([
            Cell::White,
            Cell::BlackPiece,
            Cell::White,
            Cell::BlackPiece,
            Cell::White,
            Cell::BlackPiece,
            Cell::White,
            Cell::BlackPiece,
        ]),
        Row([
            Cell::Black,
            Cell::White,
            Cell::Black,
            Cell::White,
            Cell::Black,
            Cell::White,
            Cell::Black,
            Cell::White,
        ]),
        Row([
            Cell::White,
            Cell::Black,
            Cell::White,
            Cell::Black,
            Cell::White,
            Cell::Black,
            Cell::White,
            Cell::Black,
        ]),
        Row([
            Cell::WhitePiece,
            Cell::White,
            Cell::WhitePiece,
            Cell::White,
            Cell::WhitePiece,
            Cell::White,
            Cell::WhitePiece,
            Cell::White,
        ]),
        Row([
            Cell::White,
            Cell::WhitePiece,
            Cell::White,
            Cell::WhitePiece,
            Cell::White,
            Cell::WhitePiece,
            Cell::White,
            Cell::WhitePiece,
        ]),
        Row([
            Cell::WhitePiece,
            Cell::White,
            Cell::WhitePiece,
            Cell::White,
            Cell::WhitePiece,
            Cell::White,
            Cell::WhitePiece,
            Cell::White,
        ]),
    ]).into()
}
