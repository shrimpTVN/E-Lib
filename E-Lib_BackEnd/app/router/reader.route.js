import express from "express";
import * as readController from "../controller/reader.controller.js";
import * as historyController from "../controller/history.controller.js";

const router = express.Router();

router
  .route("/")
  .get(readController.getAllReaders)
  .post(readController.createReader);

router
  .patch("/:id/change-password", readController.changePassword)
  .patch("/:id/block", readController.blockReader)
  .post("/:id/history", historyController.createHistory)
  .get("/:id/history", historyController.getAllHistoriesByReaderId);

router
  .route("/:id")
  .get(readController.getReaderById)
  .patch(readController.updateReader)
  .delete(readController.deleteReader);
export default router;
