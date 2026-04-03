import express from "express";
import * as favoriteController from "../controller/favorite.controller.js";

const router = express.Router();

router
  .route("/")
  .get(favoriteController.getAllFavorites)
  .post(favoriteController.createFavorite);

router
  .route("/:id")
  .get(favoriteController.getFavoriteById)
  .patch(favoriteController.updateFavorite)
  .delete(favoriteController.deleteFavorite);

export default router;
