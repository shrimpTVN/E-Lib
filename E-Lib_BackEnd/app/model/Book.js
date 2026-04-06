import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    tenSach: { type: String, required: true, trim: true },
    biaSach: { type: String },
    maSach: { type: String, unique: true, uppercase: true },
    theLoai: { type: String, required: true },
    gioiThieu: { type: String },
    donGia: { type: Number, required: true, min: 0 },
    soLuong: { type: Number, required: true, min: 0 }, // Total copies
    conLai: { type: Number, required: true, min: 0 }, // Available copies
    namXuatBan: { type: String },
    tacGia: { type: String, required: true },
    dichGia: { type: String },
    maNXB: { type: String },
    // Foreign Key linking to Publisher
    idNXB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publisher",
      required: true,
    },
    hinhAnh: { type: [String], default: [] }, // URL to the book cover image
  },
  { timestamps: true },
);

// Index for faster search by title or author
bookSchema.index({ tenSach: "text", tacGia: "text" });

export default mongoose.model("Book", bookSchema, "SACH");
