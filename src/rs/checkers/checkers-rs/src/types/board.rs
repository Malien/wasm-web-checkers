use super::{promote, Cell, Position, Row};
use serde::{Deserialize, Serialize};
use std::{fmt::{Display, Formatter, Write}, usize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Board(pub [Row; 8]);

impl Board {
    pub fn cell_at(&self, Position { x, y }: Position) -> Cell {
        self.0[y as usize].0[x as usize]
    }

    pub fn cell_ref(&self, Position { x, y }: Position) -> &Cell {
        let Board(ref rows) = self;
        let Row(ref cells) = rows[y as usize];
        &cells[x as usize]
    }

    pub fn cell_mut(&mut self, Position { x, y }: Position) -> &mut Cell {
        let Board(ref mut rows) = self;
        let Row(ref mut cells) = rows[y as usize];
        &mut cells[x as usize]
    }

    pub fn replace(&mut self, pos: Position, cell: Cell) -> Cell {
        std::mem::replace(self.cell_mut(pos), cell)
    }

    pub fn remove(&mut self, pos: Position) -> Cell {
        std::mem::take(self.cell_mut(pos))
    }

    pub fn move_cell(&mut self, from: Position, to: Position) {
        self.replace(to, promote(to.y, self.cell_at(from)));
        self.remove(from);
    }

    pub fn is_occupied(&self, pos: Position) -> bool {
        self.cell_at(pos).is_piece()
    }
}

impl Default for Board {
    fn default() -> Self {
        Board([
            Row([
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
            ]),
            Row([
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
            ]),
            Row([
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
                Cell::White,
                Cell::BlackPiece,
            ]),
            Row([
                Cell::Black,
                Cell::White,
                Cell::Black,
                Cell::White,
                Cell::Black,
                Cell::White,
                Cell::Black,
                Cell::White,
            ]),
            Row([
                Cell::White,
                Cell::Black,
                Cell::White,
                Cell::Black,
                Cell::White,
                Cell::Black,
                Cell::White,
                Cell::Black,
            ]),
            Row([
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
            ]),
            Row([
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
                Cell::White,
                Cell::WhitePiece,
            ]),
            Row([
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
        std::array::IntoIter::new(self.0)
    }
}

impl<'a> IntoIterator for &'a Board {
    type Item = &'a Row;
    type IntoIter = std::slice::Iter<'a, Row>;
    fn into_iter(self) -> Self::IntoIter {
        self.0.iter()
    }
}
