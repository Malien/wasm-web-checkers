use crate::types::{piece::Piece, Board, Move, Player, Position};

pub trait MoveHandler {
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
}

pub fn if_player(is_player: Player, handler: impl MoveHandler) -> impl MoveHandler {
    handler.filter(move |board, from, _| board.is_enemy(from, is_player))
}

pub fn if_piece(is_piece: Piece, handler: impl MoveHandler) -> impl MoveHandler {
    handler.filter(move |_, _, piece| piece != is_piece)
}

impl<T> MoveHandler for T
where
    T: Fn(&Board, Position, Piece) -> Option<Move>,
{
    fn compute_move(&self, board: &Board, from: Position, piece: Piece) -> Option<Move> {
        self(board, from, piece)
    }
}

#[derive(Debug, Clone, Copy)]
pub struct HandlerFilter<H, T> {
    over: H,
    filter: T,
}

impl<H, T> MoveHandler for HandlerFilter<H, T>
where
    H: MoveHandler,
    T: Fn(&Board, Position, Piece) -> bool,
{
    fn compute_move(&self, board: &Board, from: Position, piece: Piece) -> Option<Move> {
        if (self.filter)(board, from, piece) {
            None
        } else {
            self.over.compute_move(board, from, piece)
        }
    }
}

pub fn eatHandler<XFn, YFn>(xoffset: XFn, yoffset: YFn) -> impl MoveHandler
where
    XFn: Fn(u8, u8) -> u8,
    YFn: Fn(u8, u8) -> u8,
{
    return move |board: &Board, from: Position, piece: Piece| {
        let Position { x, y } = from;
        let jump_over = Position {
            x: xoffset(x, 1),
            y: yoffset(y, 1),
        };
        let to = Position {
            x: xoffset(x, 2),
            y: yoffset(y, 2),
        };
        let condition =
            board.is_enemy(jump_over, piece.player_affiliation()) && !board.is_occupied(to);

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
    };
}

pub fn moveHandler<XFn, YFn>(xoffset: XFn, yoffset: YFn) -> impl MoveHandler
where
    XFn: Fn(u8, u8) -> u8,
    YFn: Fn(u8, u8) -> u8,
{
    return move |board: &Board, from: Position, piece: Piece| {
        let Position { x, y } = from;
        let to = Position {
            x: xoffset(x, 1),
            y: yoffset(y, 1),
        };
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
    };
}

pub struct HandlerArgs {
    board: Board,
    from: Position,
    piece: Piece,
}

pub struct SingleHandlerIter<'a, T> {
    args: &'a HandlerArgs,
    handler: T,
}

impl<'a, T> Iterator for SingleHandlerIter<'a, T>
where
    T: MoveHandler,
{
    type Item = Move;

    fn next(&mut self) -> Option<Self::Item> {
        self.handler
            .compute_move(&self.args.board, self.args.from, self.args.piece)
    }
}

pub fn eatMoves(board: Board, from: Position, piece: Piece) -> impl Iterator<Item = Move> {
    let args = HandlerArgs { board, from, piece };

    let add = |x: u8, y: u8| x + y;
    let sub = |x: u8, y: u8| x - y;
    let topLeftEat = eatHandler(sub, sub).filter(|_, Position { x, y }, _| x > 1 && y > 1);
    let topRightEat = eatHandler(add, sub).filter(|_, Position { x, y }, _| x < 6 && y > 1);
    let bottomLeftEat = eatHandler(sub, add).filter(|_, Position { x, y }, _| x > 1 && y < 6);
    let bottomRightEat = eatHandler(add, add).filter(|_, Position { x, y }, _| x < 6 && y < 6);

    SingleHandlerIter {
        args: &args,
        handler: if_player(Player::White, topLeftEat)
    }.chain(SingleHandlerIter {
        args: &args,
        handler: if_player(Player::White, topRightEat)
    }).chain(SingleHandlerIter {
        args: &args,
        handler: if_player(Player::Black, bottomLeftEat)
    })
    // SingleHandlerIter { args, handler: }
}
