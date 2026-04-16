import * as reviewController from "../controller/review.controller.js";
import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
const router = express.Router();

router
  .route("/")
  .post(verifyToken, reviewController.createReview)
  .get(reviewController.getAllReviews);

router.route("/book/:bookId").get(reviewController.getReviewByBookId);

router
  .route("/:id")
  .get(reviewController.getReviewById)
  .patch(verifyToken, reviewController.updateReview)
  .delete(verifyToken, reviewController.deleteReview);

export default router;
