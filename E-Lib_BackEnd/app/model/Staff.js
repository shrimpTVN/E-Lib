import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const staffSchema = new mongoose.Schema(
  {
    maNhanVien: { type: String, unique: true, uppercase: true },
    avatar: { type: String }, // URL to the staff's avatar image
    hoTen: { type: String, required: true },
    chucVu: { type: String, required: true },
    dienThoai: { type: String, required: true },
    diaChi: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Remember to hash this with bcrypt!
    vaiTro: { type: String, enum: ["admin", "staff"], default: "staff" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

staffSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // next();
});

export default mongoose.model("Staff", staffSchema, "NHAN_VIEN");
