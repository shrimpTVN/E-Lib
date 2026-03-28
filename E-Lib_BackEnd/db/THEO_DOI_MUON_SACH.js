db.createCollection("THEO_DOI_MUON_SACH", {
    "capped": false,
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "title": "THEO_DOI_MUON_SACH",
            "properties": {
                "_id": {
                    "bsonType": "objectId"
                },
                "maDocGia": {
                    "bsonType": "string"
                },
                "ngayMuon": {
                    "bsonType": "date"
                },
                "maSach": {
                    "bsonType": "string"
                },
                "ngayTra": {
                    "bsonType": "date"
                },
                "soLuong": {
                    "bsonType": "number"
                },
                "TRANG_THAI": {
                    "bsonType": "array",
                    "additionalItems": true
                }
            },
            "additionalProperties": false
        }
    },
    "validationLevel": "off",
    "validationAction": "warn"
});