import AppError from "../utils/ApiError.js";

export const createHistory = async (req, res, next) => {
  next(
    new AppError(
      "Model History chưa được định nghĩa trong app/model/History.js",
      501,
    ),
  );
};

export const getAllHistories = async (req, res, next) => {
  next(
    new AppError(
      "Model History chưa được định nghĩa trong app/model/History.js",
      501,
    ),
  );
};

export const getHistoryById = async (req, res, next) => {
  next(
    new AppError(
      "Model History chưa được định nghĩa trong app/model/History.js",
      501,
    ),
  );
};

export const updateHistory = async (req, res, next) => {
  next(
    new AppError(
      "Model History chưa được định nghĩa trong app/model/History.js",
      501,
    ),
  );
};

export const deleteHistory = async (req, res, next) => {
  next(
    new AppError(
      "Model History chưa được định nghĩa trong app/model/History.js",
      501,
    ),
  );
};
