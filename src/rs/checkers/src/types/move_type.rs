use crate::ts_type;

use super::{board::Board, position::Position};
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Move {
    pub from: Position,
    pub to: Position,
    #[serde(rename="nextBoard")]
    pub next_board: Board
}

ts_type!(
    Move,
    TSMove,
    "RSMove",
    "type RSMove = { from: Position, to: Position, nextBoard: GameBoard } "
);
