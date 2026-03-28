db.createCollection("NHA_XUAT_BAN", {
    "capped": false,
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "title": "NHA_XUAT_BAN",
            "properties": {
                "_id": {
                    "bsonType": "objectId"
                },
                "maNXB": {
                    "bsonType": "string"
                },
                "tenNXB": {
                    "bsonType": "string"
                },
                "diaChi": {
                    "bsonType": "string"
                }
            },
            "additionalProperties": false
        }
    },
    "validationLevel": "off",
    "validationAction": "warn"
});