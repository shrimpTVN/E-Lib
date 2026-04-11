import AppError from "../utils/ApiError.js";
import * as historyService from "../service/history.service.js";

export const createHistory = async (req, res, next) => {
  try {
    if (req.body.type == "day" && req.body.number < 0) {
      return next(new AppError("Số ngày phải là số dương", 400));
    }

    console.log("Creating history with data:", req.body);

    const historyCreated = await historyService.createHistory(
      req.params.id,
      req.body,
    );
    res.status(201).json(historyCreated);
  } catch (error) {
    next(new AppError(error.message, 400));
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

export const getHistoryById = async (req, res, next) => {
  try {
    const item = await historyService.getHistoryById(req.params.id);
    if (!item) {
      return next(new AppError("History not found", 404));
    }
    res.status(200).json(item);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const updateHistory = async (req, res, next) => {
  try {
    const item = await historyService.updateHistory(req.params.id, req.body);
    if (!item) {
      return next(new AppError("History not found", 404));
    }
    res.status(200).json(item);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const deleteHistory = async (req, res, next) => {
  try {
    const item = await historyService.deleteHistory(req.params.id);
    if (!item) {
      return next(new AppError("History not found", 404));
    }
    res.status(200).json({ message: "History deleted successfully" });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
