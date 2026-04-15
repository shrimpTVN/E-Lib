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

publisherSchema.pre("validate", async function (next) {
  if (this.isNew) {
    try {
      const count = await mongoose.model("Publisher").countDocuments();
      this.maNXB = `NXB${String(count + 1).padStart(4, "0")}`;
    } catch (error) {
      return next(error);
    }
  }
});

export default mongoose.model("Publisher", publisherSchema, "NHA_XUAT_BAN");
