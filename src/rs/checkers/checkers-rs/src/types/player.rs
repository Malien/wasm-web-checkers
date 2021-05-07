use num_enum::UnsafeFromPrimitive;
use serde::{Deserialize, Serialize};

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, UnsafeFromPrimitive, Serialize, Deserialize,
)]
#[repr(u8)]
pub enum Player {
    #[serde(rename = "white")]
    White = 0,
    #[serde(rename = "black")]
    Black = 1,
}

impl Player {
    pub fn next(self) -> Self {
        match self {
            Player::White => Player::Black,
            Player::Black => Player::White,
        }
    }

    pub fn is_enemy_to(self, other: Player) -> bool {
        self != other
    }
}
