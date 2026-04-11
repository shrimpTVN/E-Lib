import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  idDocGia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reader",
    required: true,
  },
  type: { type: String, enum: ["point", "day", "money"], required: true },
  ngayTao: { type: Date, default: Date.now },
  number: { type: Number, required: true },
  lyDo: { type: String },
});

export default mongoose.model("History", historySchema, "LICH_SU");
