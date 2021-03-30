:-use_module(library(lists)).

thing(foo).
thing(bar).

% board(-Board).
% Creates a board container, with uninitialized positions
board(game_board(A,B,C,D,E,F,G,H)):-
	functor(A,l,8), 
	functor(B,l,8),
	functor(C,l,8),
	functor(D,l,8), 
	functor(E,l,8), 
	functor(F,l,8), 
	functor(G,l,8), 
	functor(H,l,8).

% board_initialize_empty(-Board).
% Creates a empty board, i.e. initialized with 1 for black space and 0 for white space
board_initialize_empty(game_board(A,B,C,D,E,F,G,H)):-
	board(game_board(A,B,C,D,E,F,G,H)),
	board_initialize_empty_odd(A),
	board_initialize_empty_even(B),
	board_initialize_empty_odd(C),
	board_initialize_empty_even(D),
	board_initialize_empty_odd(E),
	board_initialize_empty_even(F),
	board_initialize_empty_odd(G),
	board_initialize_empty_even(H).

% board_initialize_game(-Board).
% Creates a board with the initial state of a game, i.e. the white and the black pieces are placed.
board_initialize_game(game_board(A,B,C,D,E,F,G,H)):-
	board(game_board(A,B,C,D,E,F,G,H)),
	board_initialize_game_odd(A,b),
	board_initialize_game_even(B,b),
	board_initialize_game_odd(C,b),
	board_initialize_empty_even(D),
	board_initialize_empty_odd(E),
	board_initialize_game_even(F,w),
	board_initialize_game_odd(G,w),
	board_initialize_game_even(H,w).

% board_initialize_empty_odd(+Line).
% Auxiliary function that initializes a line of the board with alternating black and white spaces.
board_initialize_empty_odd(A):-
	arg(1,A,0), arg(2,A,1),
	arg(3,A,0), arg(4,A,1),
	arg(5,A,0), arg(6,A,1),
	arg(7,A,0), arg(8,A,1).

% board_initialize_empty_even(+Line).
% Auxiliary function that initializes a line of the board with alternating black and white spaces.
board_initialize_empty_even(A):-
	arg(1,A,1), arg(2,A,0),
	arg(3,A,1), arg(4,A,0),
	arg(5,A,1), arg(6,A,0),
	arg(7,A,1), arg(8,A,0).

% board_initialize_game_odd(+Line,+Player_Symbol).
% Auxiliary function that initializes a line of the board. The player pieces and black spaces are alternaded. 
board_initialize_game_odd(Line,Player):-
	arg(1,Line,0), arg(2,Line,Player),
	arg(3,Line,0), arg(4,Line,Player),
	arg(5,Line,0), arg(6,Line,Player),
	arg(7,Line,0), arg(8,Line,Player).

% board_initialize_game_even(+Line,+Player_Symbol).
% Auxiliary function that initializes a line of the board. The player pieces and black spaces are alternaded.
board_initialize_game_even(Line,Player):-
	arg(1,Line,Player), arg(2,Line,0),
	arg(3,Line,Player), arg(4,Line,0),
	arg(5,Line,Player), arg(6,Line,0),
	arg(7,Line,Player), arg(8,Line,0).
