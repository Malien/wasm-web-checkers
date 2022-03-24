use crate::Coord;

use super::{promote, Cell, Position, Row};
use serde::{Deserialize, Serialize};
use std::{fmt::{Display, Formatter, Write}, usize, ops::{Index, IndexMut}};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Board([Row; 8]);

impl Board {
    pub fn cell_at(&self, Position { x, y }: Position) -> Cell {
        self[y].cell_at(x)
    }

    pub fn replace(&mut self, Position { x, y }: Position, cell: Cell) {
        // SAFETY: This is fine, since position represents only valid board coordinates
        self[y].replace(x, cell)
    }

    pub fn remove(&mut self, Position { x, y }: Position) {
        // SAFETY: This is fine, since position represents only valid board coordinates
        self[y].remove(x)
    }

    pub fn move_cell(&mut self, from: Position, to: Position) {
        self.replace(to, promote(to.y, self.cell_at(from)));
        self.remove(from);
    }

    pub fn is_occupied(&self, pos: Position) -> bool {
        self.cell_at(pos).is_piece()
    }
}

impl Index<Coord> for Board {
    type Output = Row;

    fn index(&self, idx: Coord) -> &Self::Output {
        let idx: usize = idx.into();
        &self.0[idx]
    }
}

impl IndexMut<Coord> for Board {
    fn index_mut(&mut self, idx: Coord) -> &mut Self::Output {
        let idx: usize = idx.into();
        &mut self.0[idx]
    }
}

impl Default for Board {
    fn default() -> Self {
        Board([
            Row::from([
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
            ]),
            Row::from([
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
            ]),
            Row::from([
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
            ]),
            Row::from([
                Cell::Black,
                Cell::White,
                Cell::Black,
                Cell::White,
                Cell::Black,
                Cell::White,
                Cell::Black,
                Cell::White,
            ]),
            Row::from([
                Cell::White,
                Cell::Black,
                Cell::White,
                Cell::Black,
                Cell::White,
                Cell::Black,
                Cell::White,
                Cell::Black,
            ]),
            Row::from([
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
            ]),
            Row::from([
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
            ]),
            Row::from([
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
            ]),
        ])
    }
}

impl Display for Board {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        for row in self {
            row.fmt(f)?;
            f.write_char('\n')?;
        }
        Ok(())
    }
}

impl IntoIterator for Board {
    type Item = Row;
    type IntoIter = std::array::IntoIter<Row, 8>;
    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

impl<'a> IntoIterator for &'a Board {
    type Item = &'a Row;
    type IntoIter = std::slice::Iter<'a, Row>;
    fn into_iter(self) -> Self::IntoIter {
        self.0.iter()
    }
}
