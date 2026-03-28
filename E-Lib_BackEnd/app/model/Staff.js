import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
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

module.exports = mongoose.model("Employee", employeeSchema);
