use super::Cell;
use crate::ts_type;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Row(pub [Cell; 8]);

ts_type!(
    Row,
    TSRow,
    "Row",
    "type Row = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]"
);
