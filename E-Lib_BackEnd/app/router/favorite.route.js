import express from "express";
import * as favoriteController from "../controller/favorite.controller.js";
import { verifyToken, isUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router
  .route("/", [verifyToken, isUser])
  .get(favoriteController.getAllFavorites)
  .post(favoriteController.addFavorite)
  .patch(favoriteController.updateFavorite)
  .delete(favoriteController.deleteFavorite);

export default router;
