use super::evaluate::Evaluate;
use crate::{Board, Move, Player};

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
            _ => Solution::NoMoves,
        }
    }
}

const LESS: fn(i32, i32) -> bool = |a, b| a < b;
const GREATER: fn(i32, i32) -> bool = |a, b| a > b;

pub fn minimax(board: Board, player: Player, depth: u8) -> Solution {
    if depth == 0 {
        return Solution::Score(board.evaluate());
    }

    match player {
        Player::White => best_move(board, player, depth, GREATER),
        Player::Black => best_move(board, player, depth, LESS),
    }
}

fn best_move(
    board: Board,
    player: Player,
    depth: u8,
    cmp_fn: impl Fn(i32, i32) -> bool,
) -> Solution {
    let moves = crate::available_moves(board, player);
    let mut score = None;
    let mut res = None;
    for mv in moves {
        let next = minimax(mv.next_board, player.next(), depth - 1);
        let current_score = next.score().unwrap_or_else(|| mv.next_board.evaluate());
        if let Some(ref mut score) = score {
            if cmp_fn(current_score, *score) {
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
