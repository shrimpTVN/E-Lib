import express from "express";
import * as readController from "../controller/reader.controller.js";
import * as historyController from "../controller/history.controller.js";

const router = express.Router();

router
  .get("/", readController.getAllReaders)
  .post("/", readController.createReader)
  .get("/:id", readController.getReaderById)
  .post("/:id/history", historyController.createHistory)
  .patch("/:id", readController.updateReader)
  .patch("/:id/change-password", readController.changePassword)
  .patch("/:id/block", readController.blockReader)
  .delete("/:id", readController.deleteReader);
export default router;
