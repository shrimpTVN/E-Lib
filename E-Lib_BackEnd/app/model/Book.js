import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    tenSach: { type: String, required: true, trim: true },
    theLoai: { type: String, required: true },
    donGia: { type: Number, required: true, min: 0 },
    soLuong: { type: Number, required: true, min: 0 }, // Total copies
    conLai: { type: Number, required: true, min: 0 }, // Available copies
    namXuatBan: { type: String },
    TacGia: { type: String, required: true },
    dichGia: { type: String },
    // Foreign Key linking to Publisher
    maNXB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publisher",
      required: true,
    },
  },
  { timestamps: true },
);

// Index for faster search by title or author
bookSchema.index({ tenSach: "text", TacGia: "text" });

export default mongoose.model("Book", bookSchema, "SACH");
