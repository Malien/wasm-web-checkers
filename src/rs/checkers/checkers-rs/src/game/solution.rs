use crate::{Board, Move, Player};

use super::evaluate::Evaluate;

pub enum Solution {
    NoMoves,
    Score(i32),
    Move(Move, i32),
}

impl Solution {
    fn score(&self) -> Option<i32> {
        match self {
            Solution::NoMoves => None,
            Solution::Score(score) => Some(*score),
            Solution::Move(_, score) => Some(*score),
        }
    }

    fn new(score: Option<i32>, mv: Option<Move>) -> Self {
        match (score, mv) {
            (Some(score), Some(mv)) => Solution::Move(mv, score),
            (Some(score), None) => Solution::Score(score),
            _ => Solution::NoMoves
        }
    }
}

pub fn minimax(board: Board, player: Player, depth: u8) -> Solution {
    if depth == 0 {
        return Solution::Score(board.evaluate());
    }

    let moves = crate::available_moves(board, player);
    if player.is_minimizing() {
        let mut score = None;
        let mut res = None;
        for mv in moves {
            let next = minimax(mv.next_board, player.next(), depth - 1);
            let current_score = next.score().unwrap_or_else(|| mv.next_board.evaluate());
            if let Some(ref mut score) = score {
                if current_score < *score {
                    *score = current_score;
                    res = Some(mv);
                }
            } else {
                score = Some(current_score);
                res = Some(mv);
            }
        }
        Solution::new(score, res)
    } else {
        let mut score = None;
        let mut res = None;
        for mv in moves {
            let next = minimax(mv.next_board, player.next(), depth - 1);
            let current_score = next.score().unwrap_or_else(|| mv.next_board.evaluate());
            if let Some(ref mut score) = score {
                if current_score > *score {
                    *score = current_score;
                    res = Some(mv);
                }
            } else {
                score = Some(current_score);
                res = Some(mv);
            }
        }
        Solution::new(score, res)
    }
}
