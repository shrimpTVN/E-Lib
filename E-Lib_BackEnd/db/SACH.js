db.createCollection("SACH", {
    "capped": false,
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "title": "SACH",
            "properties": {
                "_id": {
                    "bsonType": "objectId"
                },
                "maSach": {
                    "bsonType": "string"
                },
                "tenSach": {
                    "bsonType": "string"
                },
                "theLoai": {
                    "bsonType": "string"
                },
                "donGia": {
                    "bsonType": "number"
                },
                "soLuong": {
                    "bsonType": "number"
                },
                "conLai": {
                    "bsonType": "number"
                },
                "namXuatBan": {
                    "bsonType": "string"
                },
                "TacGia": {
                    "bsonType": "string"
                },
                "dichGia": {
                    "bsonType": "string"
                },
                "maNXB": {
                    "bsonType": "string"
                }
            },
            "additionalProperties": false
        }
    },
    "validationLevel": "off",
    "validationAction": "warn"
});