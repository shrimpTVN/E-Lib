import express from "express";
import * as bookController from "../controller/book.controller.js";
import uploadCloud from "../middleware/upload.js";

const router = express.Router();

router
  .route("/")
  .get(bookController.getAllBooks)
  .post(uploadCloud.array("image", 5), bookController.createBook);

router
  .route("/:id")
  .get(bookController.getBookById)
  .patch(uploadCloud.array("image", 5), bookController.updateBook)
  .delete(bookController.deleteBook);

export default router;
