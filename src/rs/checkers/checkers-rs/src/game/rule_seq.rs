use super::{
    filters::{HandlerFilter, IfPiece, IfPlayer},
    move_rule::MoveRule,
};
use crate::types::{Board, Move, Piece, Player, Position};

pub trait RuleSeq {
    fn next(&mut self, board: &Board, from: Position, piece: Piece) -> Option<Move>;

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

    fn chain<S>(self, next: S) -> ChainHandler<Self, S>
    where
        Self: Sized,
    {
        ChainHandler {
            current: Some(self),
            next,
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct SingleRuleSeq<T>(Option<T>);

impl<T> RuleSeq for SingleRuleSeq<T>
where
    T: MoveRule,
{
    fn next(&mut self, board: &Board, from: Position, piece: Piece) -> Option<Move> {
        self.0.take()?.compute_move(board, from, piece)
    }
}

pub fn seq<T>(handler: T) -> SingleRuleSeq<T>
where
    T: MoveRule,
{
    SingleRuleSeq(Some(handler))
}

#[derive(Debug, Clone, Copy)]
pub struct ChainHandler<H, N> {
    current: Option<H>,
    next: N,
}

impl<H, N> RuleSeq for ChainHandler<H, N>
where
    H: RuleSeq,
    N: RuleSeq,
{
    fn next(&mut self, board: &Board, from: Position, piece: Piece) -> Option<Move> {
        match &mut self.current {
            Some(current) => match current.next(board, from, piece) {
                None => {
                    self.current = None;
                    self.next.next(board, from, piece)
                }
                item => item,
            },
            None => self.next.next(board, from, piece),
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct RuleSeqIter<T> {
    pub board: Board,
    pub from: Position,
    pub piece: Piece,
    pub seq: T,
}

impl<T> Iterator for RuleSeqIter<T>
where
    T: RuleSeq,
{
    type Item = Move;

    fn next(&mut self) -> Option<Self::Item> {
        self.seq.next(&self.board, self.from, self.piece)
    }
}
