db.createCollection("LICH_SU", {
  capped: false,
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "LICH_SU",
      properties: {
        _id: {
          bsonType: "objectId",
        },
        maDocGia: {
          bsonType: "string",
        },
        loai: {
          bsonType: "string",
        },
        ngayTao: {
          bsonType: "date",
        },
        number: {
          bsonType: "number",
        },
        lyDo: {
          bsonType: "string",
        },
      },
      additionalProperties: false,
    },
  },
  validationLevel: "off",
  validationAction: "warn",
});
