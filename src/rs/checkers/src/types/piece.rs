use num_enum::UnsafeFromPrimitive;

use super::Player;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, UnsafeFromPrimitive)]
#[repr(u8)]
pub enum Piece {
    White = 0b00,
    Black = 0b10,
    WhiteQueen = 0b01,
    BlackQueen = 0b11,
}

impl Piece {
    pub fn player_affiliation(&self) -> Player {
        // SAFETY: First bit of Piece enum value represents color affiliation
        // exactly the same way Player enum does (White = 0, Black = 1).
        // This is fine, since the only two possible values from (piece & 1)
        // are only 0 and 1
        unsafe { Player::from_unchecked(*self as u8 & 1) }
    }

    pub fn is_queen(&self) -> bool {
        ((*self as u8) << 1) & 1 == 1
    }
}
