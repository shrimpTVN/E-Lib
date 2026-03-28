import mongoose from "mongoose";

const readerSchema = new mongoose.Schema(
  {
    hoLot: { type: String, required: true },
    ten: { type: String, required: true },
    phai: { type: String, enum: ["Nam", "Nữ", "Khác"] },
    dienThoai: { type: String, required: true, unique: true },
    diaChi: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // Remember to hash this with bcrypt!
    diemTichLuy: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Reader", readerSchema, "DOC_GIA");
