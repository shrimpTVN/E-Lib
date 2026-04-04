import mongoose from "mongoose";
import * as readerService from "../service/reader.service.js";
import AppError from "../utils/ApiError.js";
import bcrypt from "bcryptjs";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const sanitizeReader = (readerDoc) => {
  const reader = readerDoc.toObject ? readerDoc.toObject() : readerDoc;
  delete reader.password;
  return reader;
};

export const createReader = async (req, res, next) => {
  try {
    const created = await readerService.createReader(req.body);
    res.status(201).json(sanitizeReader(created));
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const getAllReaders = async (req, res, next) => {
  try {
    const items = await readerService.getAllReaders();
    res.status(200).json(items.map(sanitizeReader));
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getReaderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Reader ID không hợp lệ", 400));
    }

    const reader = await readerService.getReaderById(id);
    if (!reader) {
      return next(new AppError("Không tìm thấy độc giả", 404));
    }

    res.status(200).json(sanitizeReader(reader));
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const updateReader = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Reader ID không hợp lệ", 400));
    }

    const updated = await readerService.updateReader(id, req.body);

    if (!updated) {
      return next(new AppError("Không tìm thấy độc giả để cập nhật", 404));
    }

    res.status(200).json(sanitizeReader(updated));
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPass, newPass } = req.body;
    if (!isValidObjectId(id)) {
      return next(new AppError("Reader ID không hợp lệ", 400));
    }

    const user = await readerService.getReaderById(id);
    if (!user) {
      return next(new AppError("Không tìm thấy độc giả", 404));
    }

    console.log("Đổi mật khẩu", { id, currentPass, newPass });
    console.log("User hiện tại", user);

    const isMatched = await bcrypt.compare(currentPass, user.password);
    if (!isMatched) {
      res
        .status(200)
        .json({ message: "Mật khẩu hiện tại không đúng!", type: "error" });
      return;
    }

    user.password = newPass;
    await user.save();

    res
      .status(200)
      .json({ message: "Mật khẩu đã được cập nhật", type: "success" });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const deleteReader = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Reader ID không hợp lệ", 400));
    }

    const deleted = await readerService.deleteReader(id);
    if (!deleted) {
      return next(new AppError("Không tìm thấy độc giả để xóa", 404));
    }

    res.status(200).json({ message: "Xóa độc giả thành công" });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
