import mongoose from "mongoose";
import * as reviewService from "../service/review.service.js";
import * as loanService from "../service/loan.service.js";

import AppError from "../utils/ApiError.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createReview = async (req, res, next) => {
  try {
    const { idSach, idDocGia } = req.body;
    console.log("Received review data:", req.body); // Debug log
    if (!isValidObjectId(idSach)) {
      return next(new AppError("Book ID không hợp lệ", 400));
    }
    if (!isValidObjectId(idDocGia)) {
      return next(new AppError("User ID không hợp lệ", 400));
    }

    // Kiểm tra nếu người dùng đã mượn sách này trước đó
    const hasBorrowed = await loanService.hasUserBorrowedBook(idDocGia, idSach);
    if (!hasBorrowed) {
      return next(
        new AppError(
          "Bạn chỉ có thể đánh giá sách đã mượn. Hãy mượn và cảm nhận sách trước khi đánh giá",
          403,
        ),
      );
    }

    const existingReview = await reviewService.hasUserVoted(idSach, idDocGia);
    if (existingReview) {
      return next(new AppError("Bạn đã có đánh giá cho sách này.", 400));
    }

    const created = await reviewService.createReview(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const getAllReviews = async (req, res, next) => {
  try {
    const items = await reviewService.getAllReviews();
    res.status(200).json(items);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getReviewByBookId = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    // console.log(req.params);
    if (!isValidObjectId(bookId)) {
      return next(new AppError("Book ID không hợp lệ", 400));
    }
    const reviews = await reviewService.getReviewsByBookId(bookId);
    res.status(200).json(reviews);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Review ID không hợp lệ", 400));
    }

    const item = await reviewService.getReviewById(id);
    if (!item) {
      return next(new AppError("Không tìm thấy đánh giá", 404));
    }

    res.status(200).json(item);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Review ID không hợp lệ", 400));
    }

    const updated = await reviewService.updateReview(id, req.body);

    if (!updated) {
      return next(new AppError("Không tìm thấy đánh giá để cập nhật", 404));
    }

    res.status(200).json(updated);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Review ID không hợp lệ", 400));
    }

    const deleted = await reviewService.deleteReview(id);
    if (!deleted) {
      return next(new AppError("Không tìm thấy đánh giá để xóa", 404));
    }

    res.status(200).json({ message: "Xóa đánh giá thành công" });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
