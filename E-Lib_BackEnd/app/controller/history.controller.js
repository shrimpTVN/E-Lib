import AppError from "../utils/ApiError.js";
import * as historyService from "../service/history.service.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createHistory = async (req, res, next) => {
  try {
    if (req.body.type == "day" && req.body.number < 0) {
      return next(new AppError("Số ngày phải là số dương", 400));
    }

    // console.log("Creating history with data:", req.body);

    const historyCreated = await historyService.createHistory(
      req.params.id,
      req.body,
    );
    res.status(201).json(historyCreated);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const getAllHistoriesByReaderId = async (req, res, next) => {
  try {
    const userId = req.params.id;

    console.log("getAllHistoriesByReaderId called with id:", userId);

    if (!isValidObjectId(userId)) {
      console.log("Invalid reader id, skipping history query:", userId);
      return next(new AppError("User ID is required", 400));
    }

    const history = await historyService.getAllHistoriesByReaderId(userId);
    console.log("History found:", history);
    if (!history) {
      return next(new AppError("History not found", 404));
    }

    res.status(200).json({ history });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getBanDayByReaderId = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const banDays = await historyService.countBanDayByReaderId(userId);
    // console.log("Ban days for user", userId, ":", banDays);
    res.status(200).json({ banDays });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getAllHistories = async (req, res, next) => {
  try {
    const items = await historyService.getAllHistoriesByReaderId(req.params.id);
    res.status(200).json({ histories: items });
  } catch (error) {
    res.status(500).json({ message: error.message });
    next(new AppError(error.message, 500));
  }
};

export const updateHistory = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return next(new AppError("History ID is required", 400));
    }

    const history = await historyService.updateHistory(id, req.body);
    if (!history) {
      return next(new AppError("History not found", 404));
    }
    res.status(200).json(history);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const deleteHistory = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return next(new AppError("History ID is required", 400));
    }
    const history = await historyService.deleteHistory(id);
    if (!history) {
      return next(new AppError("History not found", 404));
    }
    res.status(200).json({ message: "History deleted successfully" });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
