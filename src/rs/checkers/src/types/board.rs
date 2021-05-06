use std::usize;
use super::{Cell, Position, Row, promote};
use crate::{ts_type};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Board(pub [Row; 8]);

ts_type!(
    Board,
    TSBoard,
    "GameBoard",
    r#"type GameBoard = [Row, Row, Row, Row, Row, Row, Row, Row]"#
);

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
