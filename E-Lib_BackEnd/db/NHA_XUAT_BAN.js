db.createCollection("NHA_XUAT_BAN", {
  capped: false,
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "NHA_XUAT_BAN",
      properties: {
        _id: {
          bsonType: "objectId",
        },
        maNXB: {
          bsonType: "string",
        },
        tenNXB: {
          bsonType: "string",
        },
        diaChi: {
          bsonType: "string",
        },
      },
      additionalProperties: false,
    },
  },
  validationLevel: "off",
  validationAction: "warn",
});

db.NHA_XUAT_BAN.insertMany([
  {
    maNXB: "NXB001",
    tenNXB: "NXB Trẻ",
    diaChi: "161B Lý Chính Thắng, Quận 3, TP.HCM",
  },
  {
    maNXB: "NXB002",
    tenNXB: "NXB Kim Đồng",
    diaChi: "55 Quang Trung, Hai Bà Trưng, Hà Nội",
  },
  {
    maNXB: "NXB003",
    tenNXB: "Nhã Nam",
    diaChi: "59 Đỗ Quang, Trung Hòa, Cầu Giấy, Hà Nội",
  },
  {
    maNXB: "NXB004",
    tenNXB: "NXB Tổng hợp TP.HCM",
    diaChi: "62 Nguyễn Thị Minh Khai, Quận 1, TP.HCM",
  },
  {
    maNXB: "NXB005",
    tenNXB: "Phanbook",
    diaChi: "Đường Phan Kế Bính, Quận 1, TP.HCM",
  },
]);
