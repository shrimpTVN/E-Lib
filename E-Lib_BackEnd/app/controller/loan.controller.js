import mongoose from "mongoose";
import * as loanService from "../service/loan.service.js";
import AppError from "../utils/ApiError.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createLoan = async (req, res, next) => {
  try {
    const created = await loanService.createLoan(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const getAllLoans = async (req, res, next) => {
  try {
    const items = await loanService.getAllLoans();

    res.status(200).json(items);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getLoanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Loan ID không hợp lệ", 400));
    }

    const item = await loanService.getLoanById(id);

    if (!item) {
      return next(new AppError("Không tìm thấy lượt mượn", 404));
    }

    res.status(200).json(item);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const updateLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Loan ID không hợp lệ", 400));
    }

    const updated = await loanService.updateLoan(id, req.body);

    if (!updated) {
      return next(new AppError("Không tìm thấy lượt mượn để cập nhật", 404));
    }

    res.status(200).json(updated);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const deleteLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Loan ID không hợp lệ", 400));
    }

    const deleted = await loanService.deleteLoan(id);
    if (!deleted) {
      return next(new AppError("Không tìm thấy lượt mượn để xóa", 404));
    }

    res.status(200).json({ message: "Xóa lượt mượn thành công" });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
