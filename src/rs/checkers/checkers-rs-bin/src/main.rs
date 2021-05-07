use checkers_rs::{Board, Position};

fn main() {
    let board = Board::default();
    let position = Position { x: 2, y: 5 };

    match checkers_rs::moves_for(board, position) {
        None => {
            println!("Cell {:?} is not a piece", board.cell_at(position));
        }
        Some(moves) => {
            let mvs: Vec<_> = moves.iter().map(|mv| mv.to).collect();
            println!("Moves: {:?}", mvs);
        }
    }
}
