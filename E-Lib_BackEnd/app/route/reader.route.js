import express from "express";
import * as readController from "../controller/reader.controller.js";

const router = express.Router();

router
  .get("/:id", readController.getReaderById)
  .get("/", readController.getAllReaders)
  .post("/", readController.createReader)
  .patch("/:id", readController.updateReader)
  .delete("/:id", readController.deleteReader);
export default router;
