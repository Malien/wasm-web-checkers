mod types;
use checkers_rs::{Board, Move, Position, Sizes};
use types::{TSBoard, TSMove, TSPosition, TSSizes};

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use std::iter::FromIterator;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(extends=js_sys::Array, typescript_type="RSMove[]")]
    pub type TSMoveArray;
}

impl FromIterator<Move> for TSMoveArray {
    fn from_iter<T: IntoIterator<Item = Move>>(iter: T) -> Self {
        let array: js_sys::Array = iter.into_iter().map(TSMove::from).collect();
        JsValue::from(array).into()
    }
}

impl TSMoveArray {
    fn new() -> Self {
        JsValue::from(js_sys::Array::new()).into()
    }
}

impl Default for TSMoveArray {
    fn default() -> Self {
        TSMoveArray::new()
    }
}

#[wasm_bindgen]
pub fn sizes() -> TSSizes {
    Sizes::new().into()
}

#[wasm_bindgen(js_name = "initializeBoard")]
pub fn initialize_board() -> TSBoard {
    Board::default().into()
}

#[wasm_bindgen(js_name = "movesFor")]
pub fn moves_for(board: TSBoard, position: TSPosition) -> TSMoveArray {
    let board: Board = board.into();
    let position: Position = position.into();

    checkers_rs::moves_for(board, position)
        .map(Iterator::collect)
        .unwrap_or_default()
}
