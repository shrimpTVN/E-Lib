db.createCollection("YEU_THICH", {
    "capped": false,
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "title": "YEU_THICH",
            "properties": {
                "_id": {
                    "bsonType": "objectId"
                },
                "maDocGia": {
                    "bsonType": "string"
                },
                "maSach": {
                    "bsonType": "string"
                },
                "soLuong": {
                    "bsonType": "number"
                }
            },
            "additionalProperties": false
        }
    },
    "validationLevel": "off",
    "validationAction": "warn"
});