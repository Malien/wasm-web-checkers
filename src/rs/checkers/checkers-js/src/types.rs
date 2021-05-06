use checkers_rs::types::{Board, Cell, Move, Position, Row, Sizes};

#[wasm_bindgen::prelude::wasm_bindgen(typescript_custom_section)]
const TS_TYPES_STR: &'static str = r#"
type Cell = "0" | "1" | "w" | "b" | "wq" | "bq"
type Row = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]
interface Sizes{
  cell: number
  row: number
  board:number
}
type GameBoard = [Row, Row, Row, Row, Row, Row, Row, Row]
type Position = [x: number, y: number]
type RSMove = { from: Position, to: Position, nextBoard: GameBoard }
"#;

macro_rules! ts_type {
    ($src_type:ty, $target_type:ident, $ts_type:expr) => {
        #[wasm_bindgen::prelude::wasm_bindgen]
        extern "C" {
            #[wasm_bindgen::prelude::wasm_bindgen(typescript_type=$ts_type)]
            pub type $target_type;
        }

        impl From<$src_type> for $target_type {
            fn from(value: $src_type) -> Self {
                let js_value = serde_wasm_bindgen::to_value(&value).unwrap();
                wasm_bindgen::JsCast::unchecked_into(js_value)
            }
        }

        impl From<$target_type> for $src_type {
            fn from(value: $target_type) -> Self {
                serde_wasm_bindgen::from_value(value.into()).unwrap()
            }
        }
    };
}

ts_type!(Cell, TSCell, "Cell");

ts_type!(Row, TSRow, "Row");

ts_type!(Sizes, TSSizes, "Sizes");

ts_type!(Board, TSBoard, "GameBoard");

ts_type!(Position, TSPosition, "Position");

ts_type!(Move, TSMove, "RSMove");