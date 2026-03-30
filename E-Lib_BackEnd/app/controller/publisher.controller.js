import mongoose from "mongoose";
import * as publisherService from "../service/publisher.service.js";
import AppError from "../utils/ApiError.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createPublisher = async (req, res, next) => {
  try {
    const created = await publisherService.createPublisher(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const getAllPublishers = async (req, res, next) => {
  try {
    const items = await publisherService.getAllPublishers();
    res.status(200).json(items);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getPublisherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Publisher ID không hợp lệ", 400));
    }

    const item = await publisherService.getPublisherById(id);
    if (!item) {
      return next(new AppError("Không tìm thấy nhà xuất bản", 404));
    }

    res.status(200).json(item);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const updatePublisher = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Publisher ID không hợp lệ", 400));
    }

    const updated = await publisherService.updatePublisher(id, req.body);

    if (!updated) {
      return next(new AppError("Không tìm thấy nhà xuất bản để cập nhật", 404));
    }

    res.status(200).json(updated);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const deletePublisher = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Publisher ID không hợp lệ", 400));
    }

    const deleted = await publisherService.deletePublisher(id);
    if (!deleted) {
      return next(new AppError("Không tìm thấy nhà xuất bản để xóa", 404));
    }

    res.status(200).json({ message: "Xóa nhà xuất bản thành công" });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
