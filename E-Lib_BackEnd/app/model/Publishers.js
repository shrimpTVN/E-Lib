import mongoose from "mongoose";

const publisherSchema = new mongoose.Schema(
  {
    // Mongoose automatically creates an _id (maps to maNXB)
    tenNXB: { type: String, required: true, trim: true },
    diaChi: { type: String, trim: true },
  },
  { timestamps: true },
);

export default mongoose.model("Publisher", publisherSchema, "NHA_XUAT_BAN");
