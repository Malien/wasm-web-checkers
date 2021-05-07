mod types;
use checkers_rs::{Board, Move, Position, Sizes};
use types::{Solution, TSBoard, TSMove, TSPlayer, TSPosition, TSSizes, TSSolution};

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use std::iter::FromIterator;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(extends=js_sys::Array, typescript_type="RSMove[]")]
    pub type TSMoveArray;

    #[wasm_bindgen(extends=js_sys::Array, typescript_type="Position[]")]
    pub type TSPositionArray;
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

impl FromIterator<Position> for TSPositionArray {
    fn from_iter<T: IntoIterator<Item = Position>>(iter: T) -> Self {
        let array: js_sys::Array = iter.into_iter().map(TSPosition::from).collect();
        JsValue::from(array).into()
    }
}

impl TSPositionArray {
    fn new() -> Self {
        JsValue::from(js_sys::Array::new()).into()
    }
}

impl Default for TSPositionArray {
    fn default() -> Self {
        TSPositionArray::new()
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
    checkers_rs::moves_for(board.into(), position.into())
        .map(TSMoveArray::from_iter)
        .unwrap_or_default()
}

#[wasm_bindgen(js_name = "canEat")]
pub fn can_eat(board: TSBoard, player: TSPlayer) -> TSPositionArray {
    checkers_rs::can_eat(board.into(), player.into()).collect()
}

#[wasm_bindgen(js_name = "availableMoves")]
pub fn available_moves(board: TSBoard, player: TSPlayer) -> TSMoveArray {
    checkers_rs::available_moves(board.into(), player.into()).collect()
}

#[wasm_bindgen]
pub fn minimax(board: TSBoard, player: TSPlayer, depth: u8) -> Option<TSSolution> {
    Solution::from_checkers(checkers_rs::minimax(board.into(), player.into(), depth))
        .map(TSSolution::from)
}

#[wasm_bindgen]
pub fn alphabeta(board: TSBoard, player: TSPlayer, depth: u8) -> Option<TSSolution> {
    Solution::from_checkers(checkers_rs::alphabeta(board.into(), player.into(), depth))
        .map(TSSolution::from)
}
