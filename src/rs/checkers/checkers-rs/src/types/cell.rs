use std::fmt::{Display, Formatter, Write};
use num_enum::UnsafeFromPrimitive;

use crate::Coord;

use super::{Piece, Player};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, UnsafeFromPrimitive)]
#[repr(u8)]
pub enum Cell {
    #[serde(rename = "0")]
    White = 0b000,
    #[serde(rename = "1")]
    Black = 0b001,
    #[serde(rename = "w")]
    WhitePiece = 0b100,
    #[serde(rename = "b")]
    BlackPiece = 0b101,
    #[serde(rename = "wq")]
    WhiteQueen = 0b110,
    #[serde(rename = "bq")]
    BlackQueen = 0b111,
}

impl Default for Cell {
    fn default() -> Self {
        Cell::Black
    }
}

impl Cell {
    pub fn is_piece(self) -> bool {
        self.piece_bit() == 1
    }

    pub fn player_affiliation(self) -> Option<Player> {
        if !self.is_piece() {
            None
        } else {
            Some(self.color())
        }
    }

    pub fn color(self) -> Player {
        // SAFETY: The first bit of Cell enum value represents color affiliation
        // The two only possible variants for Player enum is White = 0 and Black = 1
        // which is exactly what values (cell & 1) yields
        unsafe { Player::from_unchecked(self as u8 & 1) }
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
            Some(unsafe { Piece::from_unchecked(self as u8 & 0b011) })
        }
    }

    pub fn is_enemy_to(self, player: Player) -> bool {
        match self.player_affiliation() {
            None => false,
            Some(other) => other.is_enemy_to(player),
        }
    }

    pub(crate) fn piece_bit(self) -> u8 {
        (self as u8 >> 2) & 1
    }

    pub(crate) fn queen_bit(self) -> u8 {
        (self as u8 >> 1) & 1
    }

    pub(crate) fn color_bit(self) -> u8 {
        self as u8 & 1
    }
}

pub fn promote(y: Coord, cell: Cell) -> Cell {
    let y: u8 = y.into();
    match (y, cell) {
        (7, Cell::BlackPiece) => Cell::BlackQueen,
        (0, Cell::WhitePiece) => Cell::WhiteQueen,
        _ => cell,
    }
}

impl Display for Cell {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.write_char(match self {
            Cell::White => '▢',
            Cell::Black => '◼',
            Cell::WhitePiece => '♙',
            Cell::BlackPiece => '♟',
            Cell::WhiteQueen => '♔',
            Cell::BlackQueen => '♚'
        })
    }
}