use std::iter::FromIterator;

use crate::{game::moves::moves, types::*};
use wasm_bindgen::prelude::*;

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

#[wasm_bindgen(js_name = "initializeBoard")]
pub fn initialize_board() -> TSBoard {
    Board::default().into()
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(extends=js_sys::Array, typescript_type="RSMove[]")]
    pub type TSMoveArray;
}

impl FromIterator<Move> for TSMoveArray {
    fn from_iter<T: IntoIterator<Item = Move>>(iter: T) -> Self {
        JsValue::from(js_sys::Array::from_iter(iter.into_iter().map(TSMove::from))).into()
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

#[wasm_bindgen(js_name = "movesFor")]
pub fn moves_for(board: TSBoard, position: TSPosition) -> TSMoveArray {
    let board: Board = board.into();
    let position: Position = position.into();

    crate::moves_for(board, position)
        .map(Iterator::collect)
        .unwrap_or_default()
}

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

fn alert_moves() {
    let board = Board::default();
    let position = Position { x: 2, y: 5 };
    let cell = board.cell_at(position);

    let piece = match board.cell_at(position).into_piece() {
        Some(piece) => piece,
        None => {
            alert(format!("Cell {:?} is not a piece", cell).as_str());
            return;
        }
    };
    let mvs: Vec<_> = moves(board, position, piece).map(|mv| mv.to).collect();
    alert(format!("Moves: {:?}", mvs).as_str());
}

fn cell_info(cell: Cell) -> String {
    let c = cell as u8;
    format!(
        "Cell {:?}({}) - {}{}{}\nColor={:?}, is_piece={:?}, Player={:?}, Piece={:?}\n{}\n\n",
        cell,
        c,
        c >> 2 & 1,
        c >> 1 & 1,
        c & 1,
        cell.color(),
        cell.is_piece(),
        cell.player_affiliation(),
        cell.into_piece(),
        c & 0b011
    )
}

fn alert_piece(cell: Cell) {
    alert(cell_info(cell).as_str());
}

fn alert_pieces() {
    let s: String = [
        Cell::Black,
        Cell::White,
        Cell::WhitePiece,
        Cell::BlackPiece,
        Cell::WhiteQueen,
        Cell::BlackQueen,
    ]
    .iter()
    .map(|cell| cell_info(*cell))
    .collect();
    alert(s.as_str());
}

// #[wasm_bindgen(start)]
// pub fn main() {
//     // alert_piece(Cell::WhitePiece);
//     // alert_pieces();
//     alert_moves();
// }
