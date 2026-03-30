db.createCollection("TRANG_THAI", {
  capped: false,
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "TRANG_THAI",
      properties: {
        _id: {
          bsonType: "objectId",
        },
        tenTrangThai: {
          bsonType: "string",
        },
        ngayTao: {
          bsonType: "date",
        },
        maNhanVien: {
          bsonType: "string",
        },
      },
      additionalProperties: false,
    },
  },
  validationLevel: "off",
  validationAction: "warn",
});
