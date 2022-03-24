use serde::{
    de::{self, Error, Visitor},
    Deserialize, Serialize,
};

#[derive(Debug, Clone, Copy, Eq, PartialEq, Ord, PartialOrd, Hash, Serialize)]
#[serde(transparent)]
pub struct Coord(u8);

impl From<Coord> for usize {
    fn from(Coord(v): Coord) -> Self {
        v as usize
    }
}

impl From<Coord> for u8 {
    fn from(Coord(v): Coord) -> Self {
        v
    }
}

impl<'de> Deserialize<'de> for Coord {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        struct CoordVisitor;

        impl<'de> Visitor<'de> for CoordVisitor {
            type Value = Coord;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                write!(formatter, "a number in range from 0 to 7 inclusive")
            }

            fn visit_u64<E>(self, v: u64) -> Result<Self::Value, E>
            where
                E: Error,
            {
                if (0..8).contains(&v) {
                    // SAFETY: Value range is checked
                    Ok(unsafe { Coord::new_unchecked(v as u8) })
                } else {
                    Err(de::Error::invalid_value(
                        de::Unexpected::Unsigned(v),
                        &"a number in range from 0 to 7 inclusive",
                    ))
                }
            }
        }
        deserializer.deserialize_u8(CoordVisitor)
    }
}

impl Coord {
    // SAFETY: values are expected to be in range 0 to 7 inclusive
    pub unsafe fn new_unchecked(v: u8) -> Self {
        Self(v)
    }

    pub fn forward(self) -> Option<Self> {
        if self.0 < 7 {
            Some(Self(self.0 + 1))
        } else {
            None
        }
    }

    pub fn in_order() -> impl Iterator<Item = Coord> {
        (0..8).into_iter().map(|v| Self(v))
    }
}

#[macro_export]
macro_rules! c {
    (0) => {
        // SAFETY: 0 in in range 0..8
        unsafe { $crate::Coord::new_unchecked(0) }
    };
    (1) => {
        // SAFETY: 1 in in range 0..8
        unsafe { $crate::Coord::new_unchecked(1) }
    };
    (2) => {
        // SAFETY: 2 in in range 0..8
        unsafe { $crate::Coord::new_unchecked(2) }
    };
    (3) => {
        // SAFETY: 3 in in range 0..8
        unsafe { $crate::Coord::new_unchecked(3) }
    };
    (4) => {
        // SAFETY: 4 in in range 0..8
        unsafe { $crate::Coord::new_unchecked(4) }
    };
    (5) => {
        // SAFETY: 5 in in range 0..8
        unsafe { $crate::Coord::new_unchecked(5) }
    };
    (6) => {
        // SAFETY: 6 in in range 0..8
        unsafe { $crate::Coord::new_unchecked(6) }
    };
    (7) => {
        // SAFETY: 7 in in range 0..8
        unsafe { $crate::Coord::new_unchecked(7) }
    };
}
