use crate::{Board, Cell, Player, Row};

pub trait Evaluate {
    fn evaluate(&self) -> i32;
}

impl Evaluate for Cell {
    fn evaluate(&self) -> i32 {
        (self.color_bit() as i32 * -2 + 1) * (self.piece_bit() + self.queen_bit() * 5) as i32
    }
}

impl Evaluate for Row {
    fn evaluate(&self) -> i32 {
        self.into_iter().map(Evaluate::evaluate).sum()
    }
}

impl Evaluate for Board {
    fn evaluate(&self) -> i32 {
        if !crate::has_moves(*self, Player::White) {
            -200
        } else if !crate::has_moves(*self, Player::Black) {
            200
        } else {
            self.into_iter().map(Evaluate::evaluate).sum()
        }
    }
}
