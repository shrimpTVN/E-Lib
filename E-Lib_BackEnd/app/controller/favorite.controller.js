import AppError from "../utils/ApiError.js";
import * as favoriteService from "../service/favorite.service.js";

export const getAllFavorites = async (req, res, next) => {
  try {
    const userID = req.query.idDocGia || req.body.idDocGia;
    // console.log("get all favorites for userID:", userID);
    const favorites = await favoriteService.getAllFavoriteList(userID);
    res
      .status(200)
      .json({ message: "Favorites retrieved successfully", favorites });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " Failed to get favorites." });
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const userID = req.body.idDocGia;
    const bookID = req.body.idSach;

    const favorite = await favoriteService.addFavorite(userID, bookID);
    res.status(201).json({ message: "Favorite added successfully", favorite });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " Failed to add favorite." });
  }
};

export const updateFavorite = async (req, res, next) => {
  try {
    const bookID = req.body.idSach;
    const userID = req.body.idDocGia;
    const soLuong = req.body.soLuong;

    const favorite = await favoriteService.updateFavorite(
      userID,
      bookID,
      soLuong,
    );
    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }
    res
      .status(200)
      .json({ message: "Favorite updated successfully", favorite });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " Failed to update favorite." });
  }
};

export const deleteFavorite = async (req, res, next) => {
  try {
    const bookID = req.body.idSach;
    const userID = req.body.idDocGia;
    const favorite = await favoriteService.deleteFavorite(userID, bookID);
    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }
    res
      .status(200)
      .json({ message: "Favorite deleted successfully", favorite });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " Failed to delete favorite." });
  }
};
