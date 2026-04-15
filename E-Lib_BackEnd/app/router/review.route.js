import * as reviewController from "../controller/review.controller.js";
import express from "express";

const router = express.Router();

router
  .route("/")
  .post(reviewController.createReview)
  .get(reviewController.getAllReviews);

router.route("/book/:bookId").get(reviewController.getReviewByBookId);

router
  .route("/:id")
  .get(reviewController.getReviewById)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

export default router;
