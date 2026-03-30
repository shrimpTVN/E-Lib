import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  maDocGia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reader",
    required: true,
  },
  maSach: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  binhLuan: { type: String, trim: true },
  danhGia: { type: Number, required: true, min: 1, max: 5 },
  ngayTao: { type: Date, default: Date.now },
});

// Ensures one reader can only leave one review per book
reviewSchema.index({ maDocGia: 1, maSach: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema, "DANH_GIA");
