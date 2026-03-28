db.createCollection("DANH_GIA", {
  capped: false,
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "BINH_LUAN/DANH_GIA",
      properties: {
        _id: {
          bsonType: "objectId",
        },
        ngayTao: {
          bsonType: "date",
        },
        maDocGia: {
          bsonType: "string",
        },
        maSach: {
          bsonType: "string",
        },
        binhLuan: {
          bsonType: "string",
        },
        danhGia: {
          bsonType: "number",
        },
      },
      additionalProperties: false,
    },
  },
  validationLevel: "off",
  validationAction: "warn",
});
