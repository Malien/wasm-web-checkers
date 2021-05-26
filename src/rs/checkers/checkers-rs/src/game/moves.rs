use std::collections::VecDeque;
use crate::types::{piece::Piece, Board, Move, Player, Position};

use super::{
    move_rule::MoveRule,
    rule_seq::{RuleSeq, RuleSeqIter},
};

#[derive(Debug, Clone, Copy)]
pub struct EatHandler<XFn, YFn> {
    xoffset: XFn,
    yoffset: YFn,
}

impl<XFn, YFn> EatHandler<XFn, YFn> {
    pub fn new(xoffset: XFn, yoffset: YFn) -> Self {
        Self { xoffset, yoffset }
    }
}

impl<XFn, YFn> MoveRule for EatHandler<XFn, YFn>
where
    XFn: Fn(u8, u8) -> u8,
    YFn: Fn(u8, u8) -> u8,
{
    fn compute_move(&self, board: &Board, from: Position, piece: Piece) -> Option<Move> {
        let Position { x, y } = from;
        let jump_over = Position {
            x: (self.xoffset)(x, 1),
            y: (self.yoffset)(y, 1),
        };
        let to = Position {
            x: (self.xoffset)(x, 2),
            y: (self.yoffset)(y, 2),
        };
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
    }
}

#[derive(Debug, Clone, Copy)]
pub struct MoveHandler<XFn, YFn> {
    xoffset: XFn,
    yoffset: YFn,
}

impl<XFn, YFn> MoveHandler<XFn, YFn> {
    pub fn new(xoffset: XFn, yoffset: YFn) -> Self {
        Self { xoffset, yoffset }
    }
}

impl<XFn, YFn> MoveRule for MoveHandler<XFn, YFn>
where
    XFn: Fn(u8, u8) -> u8,
    YFn: Fn(u8, u8) -> u8,
{
    fn compute_move(&self, board: &Board, from: Position, _: Piece) -> Option<Move> {
        let Position { x, y } = from;
        let to = Position {
            x: (self.xoffset)(x, 1),
            y: (self.yoffset)(y, 1),
        };
        // alert(format!("compute_move(board, {:?}, {:?}): to: {:?}", from, piece, to).as_str());
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
    }
}
const ADD: fn(u8, u8) -> u8 = |x: u8, y: u8| x + y;
const SUB: fn(u8, u8) -> u8 = |x: u8, y: u8| x - y;

pub fn eat_moves(board: &Board, from: Position, piece: Piece) -> RuleSeqIter<'_, impl RuleSeq> {
    let top_left = EatHandler::new(SUB, SUB).filter(|_, Position { x, y }, _| x > 1 && y > 1);
    let top_right = EatHandler::new(ADD, SUB).filter(|_, Position { x, y }, _| x < 6 && y > 1);
    let bottom_left = EatHandler::new(SUB, ADD).filter(|_, Position { x, y }, _| x > 1 && y < 6);
    let bottom_right = EatHandler::new(ADD, ADD).filter(|_, Position { x, y }, _| x < 6 && y < 6);

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

pub fn moves(board: &Board, from: Position, piece: Piece) -> RuleSeqIter<'_, impl RuleSeq>{
    let top_left = MoveHandler::new(SUB, SUB).filter(|_, Position { x, y }, _| x > 0 && y > 0);
    let top_right = MoveHandler::new(ADD, SUB).filter(|_, Position { x, y }, _| x < 7 && y > 0);
    let bottom_left = MoveHandler::new(SUB, ADD).filter(|_, Position { x, y }, _| x > 0 && y < 7);
    let bottom_right = MoveHandler::new(ADD, ADD).filter(|_, Position { x, y }, _| x < 7 && y < 7);

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
    queue: VecDeque<Move>
}

impl Iterator for ChainEatsIter {
    type Item = Move;
    fn next(&mut self) -> Option<Self::Item> {
        loop {
            let mv = self.queue.pop_front()?;
            let prior_len = self.queue.len();
            self.queue.extend(eat_moves(&mv.next_board, mv.to, self.piece));
            if self.queue.len() == prior_len {
                return Some(mv);
            }
        }
    }
}

pub fn chain_eat_moves(board: &Board, from: Position, piece: Piece) -> ChainEatsIter {
    ChainEatsIter {
        piece,
        queue: eat_moves(board, from, piece).collect()
    }
}
