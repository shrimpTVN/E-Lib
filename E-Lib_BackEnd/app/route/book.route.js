import express from "express";
import * as bookController from "../controller/book.controller.js";

const router = express.Router();

router
  .route("/")
  .get(bookController.getAllBooks)
  .post(bookController.createBook);

router
  .route("/:id")
  .get(bookController.getBookById)
  .patch(bookController.updateBook)
  .delete(bookController.deleteBook);

export default router;
