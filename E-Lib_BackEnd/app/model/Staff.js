import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    hoTen: { type: String, required: true },
    chucVu: { type: String, required: true },
    dienThoai: { type: String, required: true },
    diaChi: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Remember to hash this with bcrypt!
  },
  { timestamps: true },
);

export default mongoose.model("Staff", staffSchema, "NHAN_VIEN");
