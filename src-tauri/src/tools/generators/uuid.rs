use serde::{Deserialize, Serialize};
use uuid::{Uuid, Context, Timestamp};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum UuidVersion {
    V1,
    V4,
    V7,
}

pub fn generate_uuid(version: &UuidVersion) -> String {
    match version {
        UuidVersion::V1 => {
            let context = Context::new(0, 0);
            Uuid::new_v1(&context, Timestamp::now(0, 0)).to_string()
        }
        UuidVersion::V4 => Uuid::new_v4().to_string(),
        UuidVersion::V7 => Uuid::now_v7().to_string(),
    }
}

pub fn generate_multiple_uuids(version: &UuidVersion, count: usize) -> Vec<String> {
    (0..count).map(|_| generate_uuid(version)).collect()
}

pub fn validate_uuid(input: &str) -> bool {
    Uuid::parse_str(input).is_ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_uuid_v1() {
        let uuid = generate_uuid(&UuidVersion::V1);
        assert_eq!(uuid.len(), 36);
        assert!(validate_uuid(&uuid));
    }

    #[test]
    fn test_generate_uuid_v4() {
        let uuid = generate_uuid(&UuidVersion::V4);
        assert_eq!(uuid.len(), 36);
        assert!(validate_uuid(&uuid));
    }

    #[test]
    fn test_generate_uuid_v7() {
        let uuid = generate_uuid(&UuidVersion::V7);
        assert_eq!(uuid.len(), 36);
        assert!(validate_uuid(&uuid));
    }

    #[test]
    fn test_generate_multiple_uuids() {
        let uuids = generate_multiple_uuids(&UuidVersion::V4, 5);
        assert_eq!(uuids.len(), 5);
        for uuid in &uuids {
            assert!(validate_uuid(uuid));
        }
    }

    #[test]
    fn test_validate_uuid_valid() {
        assert!(validate_uuid("550e8400-e29b-41d4-a716-446655440000"));
        assert!(validate_uuid("6ba7b810-9dad-11d1-80b4-00c04fd430c8"));
    }

    #[test]
    fn test_validate_uuid_invalid() {
        assert!(!validate_uuid("not-a-uuid"));
        assert!(!validate_uuid(""));
        assert!(!validate_uuid("550e8400-e29b-41d4-a716"));
    }
}
