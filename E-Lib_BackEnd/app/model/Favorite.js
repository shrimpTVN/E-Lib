import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  idDocGia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reader",
    required: true,
  },
  idSach: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  soLuong: { type: Number, required: true, default: 1 },
});

export default mongoose.model("Favorite", favoriteSchema, "YEU_THICH");
