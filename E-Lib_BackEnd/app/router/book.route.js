import express from "express";
import * as bookController from "../controller/book.controller.js";
import { uploadBookImages } from "../middleware/upload.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router
  .route("/")
  .get(bookController.getAllBooks)
  .post([verifyToken, uploadBookImages], bookController.createBook);

router.route("/suggestions").get(bookController.getBookSuggestions);

router.get("/:id/report", bookController.getBookReport);
router
  .route("/:id")
  .get(bookController.getBookById)
  .patch([verifyToken, uploadBookImages], bookController.updateBook)
  .delete([verifyToken], bookController.deleteBook);

export default router;
