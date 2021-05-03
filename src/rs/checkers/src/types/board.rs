use std::usize;
use super::{Cell, Player, Position, Row};
use crate::{promote, ts_type};
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
    pub fn element_at(&self, Position { x, y }: Position) -> Cell {
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
        self.replace(to, promote(to.y, self.element_at(from)));
        self.remove(from);
    }

    pub fn is_occupied(&self, pos: Position) -> bool {
        !self.element_at(pos).is_piece()
    }

    pub fn is_enemy(&self, pos: Position, to_player: Player) -> bool {
        match self.element_at(pos).player_affiliation() {
            None => false,
            Some(other_player) => other_player.is_enemy(to_player)
        }
    }
}
