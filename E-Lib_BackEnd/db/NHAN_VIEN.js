db.createCollection("NHAN_VIEN", {
    "capped": false,
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "title": "NHAN_VIEN",
            "properties": {
                "_id": {
                    "bsonType": "objectId"
                },
                "maNhanVien": {
                    "bsonType": "string"
                },
                "hoTen": {
                    "bsonType": "string"
                },
                "chucVu": {
                    "bsonType": "string"
                },
                "dienThoai": {
                    "bsonType": "string"
                },
                "diaChi": {
                    "bsonType": "string"
                },
                "username": {
                    "bsonType": "string"
                },
                "password": {
                    "bsonType": "string"
                }
            },
            "additionalProperties": false
        }
    },
    "validationLevel": "off",
    "validationAction": "warn"
});