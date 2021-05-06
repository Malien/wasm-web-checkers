pub mod cell;
pub mod row;
pub mod board;
pub mod sizes;
pub mod position;
pub mod piece;
pub mod player;
pub mod move_type;

pub use cell::*;
pub use row::*;
pub use board::*;
pub use sizes::*;
pub use position::*;
pub use piece::*;
pub use player::*;
pub use move_type::*;

#[macro_export]
macro_rules! into_ts_type {
    ($src_type:ty, $target_type:ty) => {
        #[cfg(feature = "js")]
        impl From<$src_type> for wasm_bindgen::JsValue {
            fn from(value: $src_type) -> Self {
                serde_wasm_bindgen::to_value(&value).unwrap()
            }
        }

        #[cfg(feature = "js")]
        impl From<$src_type> for $target_type {
            fn from(value: $src_type) -> Self {
                wasm_bindgen::JsCast::unchecked_into(wasm_bindgen::JsValue::from(value))
            }
        }

        #[cfg(feature = "js")]
        impl From<$target_type> for $src_type {
            fn from(value: $target_type) -> Self {
                serde_wasm_bindgen::from_value(value.into()).unwrap()
            }
        }
    };
}

#[macro_export]
macro_rules! ts_type {
    ($src_type:ty, $target_type:ident, $ts_type:expr, $definition:expr) => {
        #[cfg(feature = "js")]
        #[wasm_bindgen::prelude::wasm_bindgen(typescript_custom_section)]
        const __ITEXT_STYLE: &'static str = $definition;

        #[cfg(feature = "js")]
        #[wasm_bindgen::prelude::wasm_bindgen]
        extern "C" {
            #[wasm_bindgen::prelude::wasm_bindgen(typescript_type=$ts_type)]
            pub type $target_type;
        }

        crate::into_ts_type!($src_type, $target_type);
    };
}
