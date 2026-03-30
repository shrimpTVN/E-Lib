db.createCollection("THEO_DOI_MUON_SACH", {
  capped: false,
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "THEO_DOI_MUON_SACH",
      properties: {
        _id: {
          bsonType: "objectId",
        },
        maDocGia: {
          bsonType: "string",
        },
        ngayMuon: {
          bsonType: "date",
        },
        ngayTra: {
          bsonType: "date",
        },
        maSach: {
          bsonType: "string",
        },
        soLuong: {
          bsonType: "number",
        },
        isQuaHan: {
          bsonType: "bool",
        },
        TRANG_THAI: {
          bsonType: "array",
          additionalItems: true,
        },
      },
      additionalProperties: false,
    },
  },
  validationLevel: "off",
  validationAction: "warn",
});
