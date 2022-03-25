pub mod game;
pub mod types;

use crate::game::moves::moves;
use game::moves::{chain_eat_moves, eat_moves};
pub use game::solution::*;
pub use types::*;

pub fn moves_for(board: &Board, position: Position) -> Option<Vec<Move>> {
    let piece = board.cell_at(position).into_piece()?;
    if player_can_make_eat_move(board, piece.player_affiliation()) {
        Some(chain_eat_moves(board, position, piece).collect())
    } else {
        Some(moves(board, position, piece).collect())
    }
}

pub fn has_moves(board: &Board, player: Player) -> bool {
    player_positions(board, player).any(|(position, piece)| {
        exists_move_from_position(board, position, piece)
            || exists_eat_move_from_position(board, position, piece)
    })
}

pub fn can_eat(board: &Board, player: Player) -> impl Iterator<Item = Position> + '_ {
    player_positions(board, player)
        .filter(move |(position, piece)| exists_eat_move_from_position(board, *position, *piece))
        .map(|(position, _)| position)
}

pub fn available_moves(board: &Board, player: Player) -> impl Iterator<Item = Move> + '_ {
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

fn player_positions(board: &Board, player: Player) -> impl Iterator<Item = (Position, Piece)> + '_ {
    Coord::in_order().zip(board).flat_map(move |(y, row)| {
        player_row_positions(row, player).map(move |(x, piece)| {
            let position = Position::new(x, y);
            (position, piece)
        })
    })
}

fn player_row_positions(row: &Row, player: Player) -> impl Iterator<Item = (Coord, Piece)> + '_ {
    Coord::in_order()
        .zip(row.into_iter().map(Cell::into_piece))
        .filter_map(|(x, piece)| piece.map(|piece| (x, piece)))
        .filter(move |(_, piece)| piece.player_affiliation() == player)
}

fn player_can_make_eat_move(board: &Board, player: Player) -> bool {
    player_positions(board, player)
        .any(|(position, piece)| exists_eat_move_from_position(board, position, piece))
}

fn exists_eat_move_from_position(board: &Board, from: Position, piece: Piece) -> bool {
    eat_moves(board, from, piece).next().is_some()
}

fn exists_move_from_position(board: &Board, from: Position, piece: Piece) -> bool {
    moves(board, from, piece).next().is_some()
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
