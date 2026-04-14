import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const staffSchema = new mongoose.Schema(
  {
    maNhanVien: { type: String, unique: true, uppercase: true },
    avatar: { type: String }, // URL to the staff's avatar image
    hoTen: { type: String, required: true },
    ngaySinh: { type: Date },
    chucVu: { type: String, default: "Nhân viên" },
    dienThoai: { type: String, required: true },
    diaChi: { type: String },
    username: {
      type: String,
    },
    password: { type: String, required: true, default: "123456" }, // Remember to hash this with bcrypt!
    vaiTro: { type: String, enum: ["admin", "staff"], default: "staff" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

staffSchema.pre("validate", async function (next) {
  if (this.isNew) {
    try {
      const count = await mongoose.model("Staff").countDocuments();
      this.maNhanVien = `NV${String(count + 1).padStart(4, "0")}`;
      this.username = this.maNhanVien;
    } catch (error) {
      return next(error);
    }
  }
  // next();
});

staffSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  if (this.vaiTro === "admin") {
    this.chucVu = "Quản trị viên";
  } else {
    this.chucVu = "Thủ thư";
  }
  // next();
});

export default mongoose.model("Staff", staffSchema, "NHAN_VIEN");
