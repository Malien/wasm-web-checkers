use super::{
    filters::{HandlerFilter, IfPiece, IfPlayer},
    rule_seq::{seq, ChainHandler, RuleSeq, SingleRuleSeq},
};
use crate::types::{Board, Move, Piece, Player, Position};

pub trait MoveRule {
    fn compute_move(&self, board: &Board, from: Position, piece: Piece) -> Option<Move>;

    fn filter<P>(self, predicate: P) -> HandlerFilter<Self, P>
    where
        Self: Sized,
        P: Fn(&Board, Position, Piece) -> bool,
    {
        HandlerFilter {
            over: self,
            filter: predicate,
        }
    }

    fn if_player(self, is_player: Player) -> IfPlayer<Self>
    where
        Self: Sized,
    {
        IfPlayer {
            player: is_player,
            handler: self,
        }
    }

    fn if_piece(self, is_piece: Piece) -> IfPiece<Self>
    where
        Self: Sized,
    {
        IfPiece {
            piece: is_piece,
            handler: self,
        }
    }

    fn chain<H>(self, next: H) -> ChainHandler<SingleRuleSeq<Self>, SingleRuleSeq<H>>
    where
        Self: Sized,
        H: MoveRule,
    {
        seq(self).chain(seq(next))
    }
}

impl<T> MoveRule for T
where
    T: Fn(&Board, Position, Piece) -> Option<Move>,
{
    fn compute_move(&self, board: &Board, from: Position, piece: Piece) -> Option<Move> {
        self(board, from, piece)
    }
}

impl<T> MoveRule for Option<T>
where
    T: MoveRule,
{
    fn compute_move(&self, board: &Board, from: Position, piece: Piece) -> Option<Move> {
        self.as_ref()
            .and_then(|a| a.compute_move(board, from, piece))
    }
}
