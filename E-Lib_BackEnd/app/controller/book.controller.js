import mongoose from "mongoose";
import * as bookService from "../service/book.service.js";
import AppError from "../utils/ApiError.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createBook = async (req, res, next) => {
  try {
    const created = await bookService.createBook(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const getAllBooks = async (req, res, next) => {
  try {
    const result = await bookService.getAllBooks(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Book ID không hợp lệ", 400));
    }

    const item = await bookService.getBookById(id);
    if (!item) {
      return next(new AppError("Không tìm thấy sách", 404));
    }

    res.status(200).json(item);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Book ID không hợp lệ", 400));
    }

    const updated = await bookService.updateBook(id, req.body);

    if (!updated) {
      return next(new AppError("Không tìm thấy sách để cập nhật", 404));
    }

    res.status(200).json(updated);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Book ID không hợp lệ", 400));
    }

    const deleted = await bookService.deleteBook(id);
    if (!deleted) {
      return next(new AppError("Không tìm thấy sách để xóa", 404));
    }

    res.status(200).json({ message: "Xóa sách thành công" });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
