db.createCollection("DOC_GIA", {
  capped: false,
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "DOC_GIA",
      properties: {
        _id: {
          bsonType: "objectId",
        },
        maDocGia: {
          bsonType: "string",
        },
        hoLot: {
          bsonType: "string",
        },
        ten: {
          bsonType: "string",
        },
        phai: {
          bsonType: "string",
        },
        dienThoai: {
          bsonType: "string",
        },
        diaChi: {
          bsonType: "string",
        },
        Email: {
          bsonType: "string",
        },
        password: {
          bsonType: "string",
        },
        diemTichLuy: {
          bsonType: "number",
        },
      },
      additionalProperties: false,
    },
  },
  validationLevel: "off",
  validationAction: "warn",
});
