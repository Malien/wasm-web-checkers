use std::time::Instant;

use checkers_rs::{alphabeta, c, minimax, Board, Player, Position, Sizes};

fn main() {
    let mut board = Board::default();
    println!("Sizes: {:?}", Sizes::new());
    // let position = unsafe { Position::new_unchecked(2, 5) };

    // match checkers_rs::moves_for(&board, position) {
    //     None => {
    //         println!("Cell {:?} is not a piece", board.cell_at(position));
    //     }
    //     Some(moves) => {
    //         let mvs: Vec<_> = moves.iter().map(|mv| mv.to).collect();
    //         println!("Moves: {:?}", mvs);
    //     }
    // }
    println!("{}", board);
    // SAFETY: This is fine, since I'm not dumb to pass in wrong values for Position construction
    println!("{:?}", board.cell_at(Position::new(c!(1), c!(0))));
    println!("{:?}", board.cell_at(Position::new(c!(0), c!(5))));
    println!("{:?}", board.cell_at(Position::new(c!(0), c!(0))));
    println!("{:?}", board.cell_at(Position::new(c!(0), c!(3))));
    board.move_cell(Position::new(c!(0), c!(5)), Position::new(c!(1), c!(4)));
    println!("{}", board);

    println!("{:?}", checkers_rs::alphabeta(&board, Player::White, 3));
    // benchmark();
}

fn benchmark() {
    let board = Board::default();
    for search_depth in 2..=7 {
        for iteration in 0..5 {
            let start_time = Instant::now();
            let _ = minimax(&board, Player::White, search_depth);
            println!(
                "rs-native\tminimax\t\t{}\t{}\t{}",
                iteration,
                search_depth,
                start_time.elapsed().as_millis()
            )
        }
    }

    for search_depth in 2..=12 {
        for iteration in 0..5 {
            let start_time = Instant::now();
            let _ = alphabeta(&board, Player::White, search_depth);
            println!(
                "rs-native\talphabeta\t{}\t{}\t{}",
                iteration,
                search_depth,
                start_time.elapsed().as_millis()
            )
        }
    }
}
