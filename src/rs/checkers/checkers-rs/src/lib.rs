pub mod game;
pub mod types;

use crate::game::moves::moves;
use game::moves::{chain_eat_moves, eat_moves};
pub use types::*;
pub use game::solution::*;

pub fn moves_for(board: Board, position: Position) -> Option<Vec<Move>> {
    let piece = board.cell_at(position).into_piece()?;
    if player_can_make_eat_move(board, piece.player_affiliation()) {
        Some(chain_eat_moves(board, position, piece).collect())
    } else {
        Some(moves(board, position, piece).collect())
    }
}

fn player_can_make_eat_move(board: Board, player: Player) -> bool {
    for (position, piece) in player_positions(board, player) {
        if exists_eat_move(board, position, piece) {
            return true;
        }
    }
    return false;
}

fn player_positions(board: Board, player: Player) -> impl Iterator<Item = (Position, Piece)> {
    board.into_iter().enumerate().flat_map(move |(y, row)| {
        player_row_positions(row, player)
            .map(move |(x, piece)| (Position::new(x as u8, y as u8), piece))
    })
}

fn player_row_positions(row: Row, player: Player) -> impl Iterator<Item = (usize, Piece)> {
    row.into_iter()
        .map(Cell::into_piece)
        .enumerate()
        .filter_map(|(x, piece)| piece.map(|piece| (x, piece)))
        .filter(move |(_, piece)| piece.player_affiliation() == player)
}

fn exists_eat_move(board: Board, from: Position, piece: Piece) -> bool {
    eat_moves(board, from, piece).next().is_some()
}

pub fn can_eat(board: Board, player: Player) -> impl Iterator<Item = Position> {
    player_positions(board, player)
        .filter(move |(position, piece)| exists_eat_move(board, *position, *piece))
        .map(|(position, _)| position)
}

struct AvailableMovesIter<E, M> {
    had_eats: bool,
    eats: Option<E>,
    moves: M,
}

impl<E, M> Iterator for AvailableMovesIter<E, M>
where
    E: Iterator<Item = Move>,
    M: Iterator<Item = Move>,
{
    type Item = Move;
    fn next(&mut self) -> Option<Self::Item> {
        match self.eats {
            Some(ref mut eats) => match eats.next() {
                None => {
                    self.eats = None;
                    self.next()
                }
                item => {
                    self.had_eats = true;
                    item
                }
            },
            None if self.had_eats => None,
            None => self.moves.next(),
        }
    }
}

pub fn available_moves(board: Board, player: Player) -> impl Iterator<Item = Move> {
    AvailableMovesIter {
        had_eats: false,
        eats: Some(
            player_positions(board, player)
                .flat_map(move |(position, piece)| chain_eat_moves(board, position, piece)),
        ),
        moves: player_positions(board, player)
            .flat_map(move |(position, piece)| moves(board, position, piece)),
    }
}

pub fn has_moves(board: Board, player: Player) -> bool {
    for (position, piece) in player_positions(board, player) {
        if moves(board, position, piece).next().is_some() {
            return true;
        }
        if eat_moves(board, position, piece).next().is_some() {
            return true;
        }
    }
    false
}