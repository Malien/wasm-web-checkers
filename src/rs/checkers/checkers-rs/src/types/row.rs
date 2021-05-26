use std::fmt::{self, Display, Formatter, Write};

use super::Cell;
use serde::{
    de::{self, SeqAccess, Visitor},
    ser::SerializeTuple,
    Deserialize, Deserializer, Serialize,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Row(u32);

impl Row {
    // SAFETY: idx should be less than 8
    pub unsafe fn cell_at(&self, idx: u8) -> Cell {
        let value = (self.0 >> (idx * 4)) & 0b111;
        // SAFETY: Since Row stores cells inside of the u32 at 4 bit long offsets
        // it is safe to assume that self.0 >> (idx * 4) shifts exactly those 4
        // bit offsets to the beginning of the bit sequence. And-ing with 0b111
        // guarantees that only the first three bits are used to determine cell
        Cell::from_unchecked(value as u8)
    }

    // SAFETY: idx should be less than 8
    pub unsafe fn replace(&mut self, idx: u8, cell: Cell) {
        let offset = idx * 4;
        let zeroed = self.0 & (!(0b1111 << offset));
        self.0 = zeroed | ((cell as u32) << offset);
    }

    // Safety: idx should be less than 8
    pub unsafe fn remove(&mut self, idx: u8) {
        self.replace(idx, Cell::default())
    }
}

fn compact_cells(a: Cell, b: Cell) -> u8 {
    a as u8 | ((b as u8) << 4)
}

impl From<[Cell; 8]> for Row {
    fn from([a1, b1, a2, b2, a3, b3, a4, b4]: [Cell; 8]) -> Self {
        Self(u32::from_ne_bytes([
            compact_cells(a1, b1),
            compact_cells(a2, b2),
            compact_cells(a3, b3),
            compact_cells(a4, b4),
        ]))
    }
}

pub struct RowIter {
    row: Row,
    idx: u8,
}

impl Iterator for RowIter {
    type Item = Cell;
    fn next(&mut self) -> Option<Self::Item> {
        if self.idx < 8 {
            let prev = self.idx;
            self.idx += 1;
            // SAFETY: We've checked that self.idx is less than 8.
            // So is then prev.
            Some(unsafe { self.row.cell_at(prev) })
        } else {
            None
        }
    }
}

impl ExactSizeIterator for RowIter {
    fn len(&self) -> usize {
        8
    }
}

impl IntoIterator for Row {
    type Item = Cell;
    type IntoIter = RowIter;
    fn into_iter(self) -> Self::IntoIter {
        RowIter { row: self, idx: 0 }
    }
}

impl IntoIterator for &Row {
    type Item = Cell;
    type IntoIter = RowIter;
    fn into_iter(self) -> Self::IntoIter {
        RowIter { row: *self, idx: 0 }
    }
}

impl Display for Row {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        for cell in self {
            cell.fmt(f)?;
            f.write_char(' ')?;
        }
        Ok(())
    }
}

impl Serialize for Row {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut s = serializer.serialize_tuple(8)?;
        for i in 0..8 {
            s.serialize_element(unsafe { &self.cell_at(i) })?;
        }
        s.end()
    }
}

impl<'de> Deserialize<'de> for Row {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct PosVisitor;

        impl<'de> Visitor<'de> for PosVisitor {
            type Value = Row;

            fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                formatter.write_str("a tuple of integers between 0 and 8")
            }

            fn visit_seq<A>(self, mut seq: A) -> Result<Self::Value, A::Error>
            where
                A: SeqAccess<'de>,
            {
                let mut res = [Cell::White; 8];
                for i in 0..8 {
                    res[i] = seq
                        .next_element()?
                        .ok_or_else(|| de::Error::invalid_length(0, &self))?;
                }
                Ok(res.into())
            }
        }

        deserializer.deserialize_tuple(2, PosVisitor)
    }
}
