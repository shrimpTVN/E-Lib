import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    idDocGia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reader",
      required: true,
    },
    idSach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    ngayMuon: { type: Date, default: Date.now, required: true },
    ngayTra: { type: Date },
    soLuong: { type: Number, default: 1, min: 1 },

    // Embedded Array for TRANG_THAI
    TRANG_THAI: [
      {
        tenTrangThai: {
          type: String,
          enum: ["Đang chờ", "Đang mượn", "Đã trả", "Quá hạn", "Mất"],
          required: true,
        },
        ngayTao: { type: Date, default: Date.now },
        // Reference to the Staff member who updated this status
        idNhanVien: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Staff",
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

// Index to quickly find active loans for a specific reader
loanSchema.index({ idDocGia: 1, "TRANG_THAI.tenTrangThai": 1 });

export default mongoose.model("Loan", loanSchema, "THEO_DOI_MUON_SACH");
