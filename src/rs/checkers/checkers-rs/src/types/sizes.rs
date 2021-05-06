use super::{Board, Cell, Row};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Sizes {
    pub cell: usize,
    pub row: usize,
    pub board: usize,
}

impl Sizes {
    pub fn new() -> Sizes {
        use std::mem::size_of;
        Sizes {
            cell: size_of::<Cell>(),
            row: size_of::<Row>(),
            board: size_of::<Board>(),
        }
    }
}
