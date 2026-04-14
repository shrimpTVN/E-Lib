import express from "express";
import * as bookController from "../controller/book.controller.js";
import { uploadBookImages } from "../middleware/upload.js";

const router = express.Router();

router
  .route("/")
  .get(bookController.getAllBooks)
  .post(uploadBookImages, bookController.createBook);

router
  .route("/:id")
  .get(bookController.getBookById)
  .patch(uploadBookImages, bookController.updateBook)
  .delete(bookController.deleteBook);

export default router;
