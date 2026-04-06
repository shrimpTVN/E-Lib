import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const readerSchema = new mongoose.Schema(
  {
    maDocGia: { type: String, unique: true, uppercase: true },
    avatar: { type: String }, // URL to the reader's avatar image
    hoLot: { type: String, required: true },
    ten: { type: String, required: true },
    phai: { type: String, enum: ["Nam", "Nữ", "Khác"] },
    dienThoai: { type: String, required: true },
    diaChi: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // Remember to hash this with bcrypt!
    diemTichLuy: { type: Number, default: 0 },
    ngaySinh: { type: Date },
    tienPhat: { type: Number, default: 0 },
  },
  { timestamps: true },
);

readerSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // next();
});

export default mongoose.model("Reader", readerSchema, "DOC_GIA");
