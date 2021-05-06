use num_enum::UnsafeFromPrimitive;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, UnsafeFromPrimitive)]
#[repr(u8)]
pub enum Player {
    White = 0,
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
