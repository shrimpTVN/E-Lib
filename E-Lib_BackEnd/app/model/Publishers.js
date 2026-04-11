import mongoose from "mongoose";

const publisherSchema = new mongoose.Schema(
  {
    // Mongoose automatically creates an _id (maps to maNXB)
    tenNXB: { type: String, required: true, trim: true },
    maNXB: { type: String, unique: true, uppercase: true },
    diaChi: { type: String, trim: true },
  },
  { timestamps: true },
);

publisherSchema.pre("save", async function (next) {
  const coutn = await mongoose.model("Publisher").countDocuments();
  this.maNXB = `NXB${String(coutn + 1).padStart(4, "0")}`;
});

export default mongoose.model("Publisher", publisherSchema, "NHA_XUAT_BAN");
