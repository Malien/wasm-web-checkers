use crate::{
    c,
    types::{piece::Piece, Board, Move, Player, Position},
    Coord,
};
use std::collections::VecDeque;

use super::{
    move_rule::MoveRule,
    rule_seq::{RuleSeq, RuleSeqIter},
};

#[derive(Debug, Clone, Copy)]
pub enum Direction {
    Pos = 1,
    Neg = -1,
}

const fn offset_coord(original: Coord, direction: Direction, offset: u8) -> Coord {
    let mut v: i8 = original.as_i8();
    v += (direction as i8) * (offset as i8);
    unsafe { Coord::new_unchecked(v as u8) }
}

#[derive(Debug, Clone, Copy)]
struct Direction2D {
    x: Direction,
    y: Direction,
}

const fn offset_position(original: Position, direction: Direction2D, offset: u8) -> Position {
    Position {
        x: offset_coord(original.x, direction.x, offset),
        y: offset_coord(original.y, direction.y, offset),
    }
}

pub fn eat_handler(x: Direction, y: Direction) -> impl MoveRule + Copy + Clone {
    let direction = Direction2D { x, y };
    return move |board: &Board, from: Position, piece: Piece| {
        let jump_over = offset_position(from, direction, 1);
        let to = offset_position(from, direction, 2);
        let condition = board
            .cell_at(jump_over)
            .is_enemy_to(piece.player_affiliation())
            && !board.is_occupied(to);

        if !condition {
            return None;
        }

        let mut next_board = board.clone();
        next_board.move_cell(from, to);
        next_board.remove(jump_over);
        Some(Move {
            from,
            to,
            next_board,
        })
    };
}

pub fn move_handler(x: Direction, y: Direction) -> impl MoveRule + Copy + Clone {
    let direction = Direction2D { x, y };
    return move |board: &Board, from: Position, _: Piece| {
        let to = offset_position(from, direction, 1);
        if board.is_occupied(to) {
            return None;
        }
        let mut next_board = board.clone();
        next_board.move_cell(from, to);
        Some(Move {
            from,
            to,
            next_board,
        })
    };
}

pub fn eat_moves(board: &Board, from: Position, piece: Piece) -> RuleSeqIter<'_, impl RuleSeq> {
    use Direction::*;
    let top_left = eat_handler(Neg, Neg).filter_position(|x, y| x > c!(1) && y > c!(1));
    let top_right = eat_handler(Pos, Neg).filter_position(|x, y| x < c!(6) && y > c!(1));
    let bottom_left = eat_handler(Neg, Pos).filter_position(|x, y| x > c!(1) && y < c!(6));
    let bottom_right = eat_handler(Pos, Pos).filter_position(|x, y| x < c!(6) && y < c!(6));

    let top = top_left.chain(top_right);
    let bottom = bottom_left.chain(bottom_right);

    let rules = top
        .if_player(Player::White)
        .chain(bottom.if_player(Player::Black))
        .chain(bottom.if_piece(Piece::WhiteQueen))
        .chain(top.if_piece(Piece::BlackQueen));

    RuleSeqIter {
        board,
        from,
        piece,
        seq: rules,
    }
}

pub fn moves(board: &Board, from: Position, piece: Piece) -> RuleSeqIter<'_, impl RuleSeq> {
    use Direction::*;
    let top_left = move_handler(Neg, Neg).filter_position(|x, y| x > c!(0) && y > c!(0));
    let top_right = move_handler(Pos, Neg).filter_position(|x, y| x < c!(7) && y > c!(0));
    let bottom_left = move_handler(Neg, Pos).filter_position(|x, y| x > c!(0) && y < c!(7));
    let bottom_right = move_handler(Pos, Pos).filter_position(|x, y| x < c!(7) && y < c!(7));

    let top = top_left.chain(top_right);
    let bottom = bottom_left.chain(bottom_right);

    let rules = top
        .if_player(Player::White)
        .chain(bottom.if_player(Player::Black))
        .chain(bottom.if_piece(Piece::WhiteQueen))
        .chain(top.if_piece(Piece::BlackQueen));

    RuleSeqIter {
        board,
        from,
        piece,
        seq: rules,
    }
}

pub struct ChainEatsIter {
    piece: Piece,
    queue: VecDeque<Move>,
}

impl Iterator for ChainEatsIter {
    type Item = Move;
    fn next(&mut self) -> Option<Self::Item> {
        loop {
            let mv = self.queue.pop_front()?;
            let prior_len = self.queue.len();
            self.queue
                .extend(eat_moves(&mv.next_board, mv.to, self.piece));
            if self.queue.len() == prior_len {
                return Some(mv);
            }
        }
    }
}

pub fn chain_eat_moves(board: &Board, from: Position, piece: Piece) -> ChainEatsIter {
    ChainEatsIter {
        piece,
        queue: eat_moves(board, from, piece).collect(),
    }
}
