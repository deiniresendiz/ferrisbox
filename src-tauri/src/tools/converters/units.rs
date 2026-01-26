use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Copy)]
pub enum UnitType {
    Data,
    Time,
    Frequency,
}

#[derive(Serialize, Deserialize, Clone, Copy)]
pub enum DataUnit {
    Byte,
    KiB,
    MiB,
    GiB,
    TiB,
    KB,
    MB,
    GB,
    TB,
}

#[derive(Serialize, Deserialize, Clone, Copy)]
pub enum TimeUnit {
    Millisecond,
    Second,
    Minute,
    Hour,
    Day,
}

#[derive(Serialize, Deserialize, Clone, Copy)]
pub enum FrequencyUnit {
    Hertz,
    Kilohertz,
    Megahertz,
    Gigahertz,
}

#[derive(Serialize, Deserialize)]
pub struct ConversionResult {
    value: f64,
    unit: String,
    original_unit: String,
    equivalences: Vec<Equivalence>,
}

#[derive(Serialize, Deserialize)]
pub struct Equivalence {
    value: String,
    unit: String,
}

#[tauri::command]
pub fn convert_data_units_command(
    value: f64,
    from_unit: DataUnit,
    to_unit: DataUnit,
) -> Result<ConversionResult, String> {
    let value_in_bytes = data_unit_to_bytes(value, from_unit);
    let result = value_in_bytes / data_unit_to_bytes(1.0, to_unit);
    
    let unit_name = data_unit_name(to_unit);
    
    Ok(ConversionResult {
        value: result,
        unit: unit_name.to_string(),
        original_unit: data_unit_name(from_unit).to_string(),
        equivalences: vec![
            Equivalence {
                value: format!("{:.6}", data_unit_to_bytes(value, DataUnit::Byte)),
                unit: data_unit_name(DataUnit::Byte).to_string(),
            },
            Equivalence {
                value: format!("{:.6}", data_unit_to_bytes(value, DataUnit::KiB)),
                unit: data_unit_name(DataUnit::KiB).to_string(),
            },
            Equivalence {
                value: format!("{:.6}", data_unit_to_bytes(value, DataUnit::MiB)),
                unit: data_unit_name(DataUnit::MiB).to_string(),
            },
            Equivalence {
                value: format!("{:.6}", data_unit_to_bytes(value, DataUnit::GiB)),
                unit: data_unit_name(DataUnit::GiB).to_string(),
            },
        ],
    })
}

#[tauri::command]
pub fn convert_time_units_command(
    value: f64,
    from_unit: TimeUnit,
    to_unit: TimeUnit,
) -> Result<ConversionResult, String> {
    let value_in_ms = time_unit_to_ms(value, from_unit);
    let result = value_in_ms / time_unit_to_ms(1.0, to_unit);
    
    let unit_name = time_unit_name(to_unit);
    
    Ok(ConversionResult {
        value: result,
        unit: unit_name.to_string(),
        original_unit: time_unit_name(from_unit).to_string(),
        equivalences: vec![
            Equivalence {
                value: format!("{:.2}", value_in_ms),
                unit: "ms".to_string(),
            },
            Equivalence {
                value: format!("{:.2}", value_in_ms / 1000.0),
                unit: "s".to_string(),
            },
            Equivalence {
                value: format!("{:.2}", value_in_ms / 60000.0),
                unit: "min".to_string(),
            },
            Equivalence {
                value: format!("{:.2}", value_in_ms / 3600000.0),
                unit: "h".to_string(),
            },
            Equivalence {
                value: format!("{:.2}", value_in_ms / 86400000.0),
                unit: "day".to_string(),
            },
        ],
    })
}

#[tauri::command]
pub fn convert_frequency_units_command(
    value: f64,
    from_unit: FrequencyUnit,
    to_unit: FrequencyUnit,
) -> Result<ConversionResult, String> {
    let value_in_hz = frequency_unit_to_hz(value, from_unit);
    let result = value_in_hz / frequency_unit_to_hz(1.0, to_unit);
    
    let unit_name = frequency_unit_name(to_unit);
    
    Ok(ConversionResult {
        value: result,
        unit: unit_name.to_string(),
        original_unit: frequency_unit_name(from_unit).to_string(),
        equivalences: vec![
            Equivalence {
                value: format!("{:.2}", value_in_hz),
                unit: "Hz".to_string(),
            },
            Equivalence {
                value: format!("{:.2}", value_in_hz / 1000.0),
                unit: "kHz".to_string(),
            },
            Equivalence {
                value: format!("{:.2}", value_in_hz / 1_000_000.0),
                unit: "MHz".to_string(),
            },
            Equivalence {
                value: format!("{:.2}", value_in_hz / 1_000_000_000.0),
                unit: "GHz".to_string(),
            },
        ],
    })
}

fn data_unit_to_bytes(value: f64, unit: DataUnit) -> f64 {
    match unit {
        DataUnit::Byte => value,
        DataUnit::KiB => value * 1024.0,
        DataUnit::MiB => value * 1024.0 * 1024.0,
        DataUnit::GiB => value * 1024.0 * 1024.0 * 1024.0,
        DataUnit::TiB => value * 1024.0 * 1024.0 * 1024.0 * 1024.0,
        DataUnit::KB => value * 1000.0,
        DataUnit::MB => value * 1000.0 * 1000.0,
        DataUnit::GB => value * 1000.0 * 1000.0 * 1000.0,
        DataUnit::TB => value * 1000.0 * 1000.0 * 1000.0,
    }
}

fn time_unit_to_ms(value: f64, unit: TimeUnit) -> f64 {
    match unit {
        TimeUnit::Millisecond => value,
        TimeUnit::Second => value * 1000.0,
        TimeUnit::Minute => value * 1000.0 * 60.0,
        TimeUnit::Hour => value * 1000.0 * 60.0 * 60.0,
        TimeUnit::Day => value * 1000.0 * 60.0 * 60.0 * 24.0,
    }
}

fn frequency_unit_to_hz(value: f64, unit: FrequencyUnit) -> f64 {
    match unit {
        FrequencyUnit::Hertz => value,
        FrequencyUnit::Kilohertz => value * 1000.0,
        FrequencyUnit::Megahertz => value * 1_000_000.0,
        FrequencyUnit::Gigahertz => value * 1_000_000_000.0,
    }
}

fn data_unit_name(unit: DataUnit) -> &'static str {
    match unit {
        DataUnit::Byte => "B",
        DataUnit::KiB => "KiB",
        DataUnit::MiB => "MiB",
        DataUnit::GiB => "GiB",
        DataUnit::TiB => "TiB",
        DataUnit::KB => "KB",
        DataUnit::MB => "MB",
        DataUnit::GB => "GB",
        DataUnit::TB => "TB",
    }
}

fn time_unit_name(unit: TimeUnit) -> &'static str {
    match unit {
        TimeUnit::Millisecond => "ms",
        TimeUnit::Second => "s",
        TimeUnit::Minute => "min",
        TimeUnit::Hour => "h",
        TimeUnit::Day => "day",
    }
}

fn frequency_unit_name(unit: FrequencyUnit) -> &'static str {
    match unit {
        FrequencyUnit::Hertz => "Hz",
        FrequencyUnit::Kilohertz => "kHz",
        FrequencyUnit::Megahertz => "MHz",
        FrequencyUnit::Gigahertz => "GHz",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bytes_conversion() {
        let result = convert_data_units_command(1024.0, DataUnit::KiB, DataUnit::MB).unwrap();
        assert_eq!(result.value, 1.0);
        assert_eq!(result.unit, "MB");
    }

    #[test]
    fn test_time_conversion() {
        let result = convert_time_units_command(3600.0, TimeUnit::Minute, TimeUnit::Hour).unwrap();
        assert_eq!(result.value, 60.0);
        assert_eq!(result.unit, "h");
    }

    #[test]
    fn test_frequency_conversion() {
        let result = convert_frequency_units_command(1000.0, FrequencyUnit::Hertz, FrequencyUnit::Kilohertz).unwrap();
        assert_eq!(result.value, 1.0);
        assert_eq!(result.unit, "kHz");
    }
}
