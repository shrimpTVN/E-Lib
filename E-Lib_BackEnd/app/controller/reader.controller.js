import mongoose from "mongoose";
import * as readerService from "../service/reader.service.js";
import { getStaffById } from "../service/staff.service.js";
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
    res.status(200).json({ readers: items.map(sanitizeReader) });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

export const blockReader = async (req, res, next) => {
  try {
    // console.log(req.body);
    const staff = await getStaffById(req.body.staff._id);
    if (!staff) {
      return next(new AppError("Không tìm thấy nhân viên", 404));
    }

    const isMatched = await bcrypt.compare(
      req.body.staff.password,
      staff.password,
    );
    if (!isMatched) {
      res
        .status(200)
        .json({ message: "Mật khẩu nhân viên không đúng!", type: "error" });
      return;
    }

    await readerService.updateReader(req.params.id, {
      isActive: req.body.isActive,
    });
    res.status(200).json({ message: "Cập nhật trạng thái độc giả thành công" });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};
