use super::{board::Board, position::Position};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Move {
    pub from: Position,
    pub to: Position,
    #[serde(rename = "nextBoard")]
    pub next_board: Board,
}
