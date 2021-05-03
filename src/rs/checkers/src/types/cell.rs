use super::{Piece, Player};
use crate::ts_type;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum Cell {
    #[serde(rename = "0")]
    White = 0b000,
    #[serde(rename = "1")]
    Black = 0b100,
    #[serde(rename = "w")]
    WhitePiece = 0b001,
    #[serde(rename = "b")]
    BlackPiece = 0b101,
    #[serde(rename = "wq")]
    WhiteQueen = 0b011,
    #[serde(rename = "bq")]
    BlackQueen = 0b111,
}

impl Default for Cell {
    fn default() -> Self {
        Cell::Black
    }
}

impl Cell {
    pub fn is_piece(&self) -> bool {
        ((*self as u8) << 2) & 1 == 1
    }

    pub fn player_affiliation(&self) -> Option<Player> {
        if !self.is_piece() {
            None
        } else {
            // SAFETY: The first bit of Cell enum value represents color affiliation
            // The two only possible variants for Player enum is White = 0 and Black = 1
            // which is exactly what values (cell & 1) yields
            Some(unsafe { Player::from_unchecked(*self as u8 & 1) })
        }
    }

    pub fn into_piece(self) -> Option<Piece> {
        if !self.is_piece() {
            None
        } else {
            // SAFETY: The first and second bit of Cell enum value represents color
            // (White = 0, Black = 1) and rank (Plain = 0, Queen = 1) of Figure.
            // Such conversion to Piece is fine, since we've checked for it being figure,
            // and the only possible values produced from (cell & 0b11) are:
            // 0b00, 0b10, 0b01 and 0b11, which correspond exactly to Pieces values
            Some(unsafe { Piece::from_unchecked(self as u8 & 0b11) })
        }
    }
}

ts_type!(
    Cell,
    TSCell,
    "Cell",
    r#"type Cell = "0" | "1" | "w" | "b" | "wq" | "bq""#
);
