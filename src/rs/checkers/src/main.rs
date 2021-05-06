pub mod game;
pub mod lib;
pub mod types;
use types::{Board, Position};

fn main() {
    let board = Board::default();
    let position = Position { x: 2, y: 5 };

    match lib::moves_for(board, position) {
        None => {
            println!("Cell {:?} is not a piece", board.cell_at(position));
        }
        Some(iter) => {
            let mvs: Vec<_> = iter.map(|mv| mv.to).collect();
            println!("Moves: {:?}", mvs);
        }
    }
}
