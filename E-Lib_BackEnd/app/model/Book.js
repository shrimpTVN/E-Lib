import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    tenSach: { type: String, required: true, trim: true },
    biaSach: { type: String }, //url ảnh bìa sách
    maSach: { type: String, unique: true, uppercase: true },
    theLoai: { type: String, required: true },
    moTa: { type: String },
    donGia: { type: Number, required: true, min: 0 },
    soLuong: { type: Number, required: true, min: 0 }, // Total copies
    conLai: { type: Number, min: 0 }, // Available copies
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

// 1. Use pre('validate') to set fields before validation checks occur
bookSchema.pre("validate", async function (next) {
  // Only run this logic if the document is newly created
  if (this.isNew) {
    try {
      // FIX: Count 'Book' documents, not 'Reader' documents
      const count = await mongoose.model("Book").countDocuments();

      // Auto-generate Book ID (e.g., S0001, S0002)
      this.maSach = `S${String(count + 1).padStart(4, "0")}`;

      // Initialize available copies to equal total copies
      this.conLai = this.soLuong;
    } catch (error) {
      return next(error);
    }
  }
  // next();
});

bookSchema.pre("save", function (next) {
  // Ensure conLai does not exceed soLuong
  if (Number(this.conLai) > Number(this.soLuong)) {
    this.conLai = this.soLuong;
  }
});

export default mongoose.model("Book", bookSchema, "SACH");
