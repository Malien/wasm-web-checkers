use crate::Coord;
use crate::types::{Board, Move, Piece, Player, Position};

use super::move_rule::MoveRule;
use super::rule_seq::RuleSeq;

#[derive(Debug, Clone, Copy)]
pub struct IfPlayer<H> {
    pub player: Player,
    pub handler: H,
}

impl<H> MoveRule for IfPlayer<H>
where
    H: MoveRule,
{
    fn compute_move(&self, board: &Board, from: Position, piece: Piece) -> Option<Move> {
        if board.cell_at(from).is_enemy_to(self.player) {
            None
        } else {
            self.handler.compute_move(board, from, piece)
        }
    }
}

impl<S> RuleSeq for IfPlayer<S>
where
    S: RuleSeq,
{
    fn next(&mut self, board: &Board, from: Position, piece: Piece) -> Option<Move> {
        if board.cell_at(from).is_enemy_to(self.player) {
            None
        } else {
            self.handler.next(board, from, piece)
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct IfPiece<H> {
    pub piece: Piece,
    pub handler: H,
}

impl<H> MoveRule for IfPiece<H>
where
    H: MoveRule,
{
    fn compute_move(&self, board: &Board, from: Position, piece: Piece) -> Option<Move> {
        if piece != self.piece {
            None
        } else {
            self.handler.compute_move(board, from, piece)
        }
    }
}

impl<S> RuleSeq for IfPiece<S>
where
    S: RuleSeq,
{
    fn next(&mut self, board: &Board, from: Position, piece: Piece) -> Option<Move> {
        if piece != self.piece {
            None
        } else {
            self.handler.next(board, from, piece)
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct HandlerFilter<H, T> {
    pub over: H,
    pub filter: T,
}

impl<H, T> MoveRule for HandlerFilter<H, T>
where
    H: MoveRule,
    T: Fn(Coord, Coord) -> bool,
{
    fn compute_move(&self, board: &Board, from: Position, piece: Piece) -> Option<Move> {
        if (self.filter)(from.x, from.y) {
            self.over.compute_move(board, from, piece)
        } else {
            None
        }
    }
}

impl<S, T> RuleSeq for HandlerFilter<S, T>
where
    S: RuleSeq,
    T: Fn(&Board, Position, Piece) -> bool,
{
    fn next(&mut self, board: &Board, from: Position, piece: Piece) -> Option<Move> {
        if (self.filter)(board, from, piece) {
            self.over.next(board, from, piece)
        } else {
            None
        }
    }
}
