pub mod game;
pub mod types;

#[cfg(feature = "js")]
pub mod jslib;

use crate::game::moves::moves;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use crate::types::{Board, Move, Position};

pub fn moves_for(board: Board, position: Position) -> Option<impl Iterator<Item = Move>> {
    let piece = board.cell_at(position).into_piece()?;
    Some(moves(board, position, piece))
}
