import mongoose from "mongoose";
import * as reviewService from "../service/review.service.js";
import AppError from "../utils/ApiError.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createReview = async (req, res, next) => {
  try {
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
