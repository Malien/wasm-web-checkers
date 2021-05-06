pub mod game;
pub mod types;

use crate::game::moves::moves;
pub use types::*;

pub fn moves_for(board: Board, position: Position) -> Option<impl Iterator<Item = Move>> {
    let piece = board.cell_at(position).into_piece()?;
    Some(moves(board, position, piece))
}
