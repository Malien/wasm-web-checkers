use std::time::Instant;

use checkers_rs::{Board, Player, alphabeta, minimax};

fn main() {
    // let board = Board::default();
    // let position = Position { x: 2, y: 5 };

    // match checkers_rs::moves_for(board, position) {
    //     None => {
    //         println!("Cell {:?} is not a piece", board.cell_at(position));
    //     }
    //     Some(moves) => {
    //         let mvs: Vec<_> = moves.iter().map(|mv| mv.to).collect();
    //         println!("Moves: {:?}", mvs);
    //     }
    // }
    // println!("{}", board);

    // println!("{:?}", checkers_rs::alphabeta(board, Player::White, 3));
    benchmark();
}

fn benchmark() {
    let board = Board::default();
    for search_depth in 2..=7 {
        for iteration in 0..5 {
            let start_time = Instant::now();
            let _ = minimax(board, Player::White, search_depth);
            println!("rs-native\tminimax\t\t{}\t{}\t{}", iteration, search_depth, start_time.elapsed().as_millis())
        }
    }
    
    for search_depth in 2..=12 {
        for iteration in 0..5 {
            let start_time = Instant::now();
            let _ = alphabeta(board, Player::White, search_depth);
            println!("rs-native\talphabeta\t{}\t{}\t{}", iteration, search_depth, start_time.elapsed().as_millis())
        }
    }
}
