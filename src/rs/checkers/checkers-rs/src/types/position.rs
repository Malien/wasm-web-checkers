use serde::{
    de::Visitor,
    de::{self, SeqAccess},
    ser::SerializeTuple,
    Deserialize, Deserializer, Serialize, Serializer,
};
use std::fmt;

use crate::Coord;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Position {
    pub x: Coord,
    pub y: Coord,
}

impl Position {
    // pub fn new(x: u8, y: u8) -> Option<Self> {
    //     if x < 8 && y < 8 {
    //         Some(Self { x, y })
    //     } else {
    //         None
    //     }
    // }

    // Safety: Position can only represent position on a 8 by 8 board
    // so safe construction of position is only possible if both
    // coordinated are less than 8
    // pub unsafe fn new_unchecked(x: u8, y: u8) -> Self {
    //     Self { x, y }
    // }

    pub fn new(x: Coord, y: Coord) -> Self {
        Self { x, y }
    }
}

impl Serialize for Position {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_tuple(2)?;
        s.serialize_element(&self.x)?;
        s.serialize_element(&self.y)?;
        s.end()
    }
}

impl<'de> Deserialize<'de> for Position {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct PosVisitor;

        impl<'de> Visitor<'de> for PosVisitor {
            type Value = Position;

            fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                formatter.write_str("a tuple of integers between 0 and 8")
            }

            fn visit_seq<A>(self, mut seq: A) -> Result<Self::Value, A::Error>
            where
                A: SeqAccess<'de>,
            {
                let x = seq
                    .next_element()?
                    .ok_or_else(|| de::Error::invalid_length(0, &self))?;
                let y = seq
                    .next_element()?
                    .ok_or_else(|| de::Error::invalid_length(1, &self))?;
                Ok(Position { x, y })
            }
        }

        deserializer.deserialize_tuple(2, PosVisitor)
    }
}
