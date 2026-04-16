import * as publisherController from "../controller/publisher.controller.js";
import express from "express";
import { isAdminOrStaff, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  [verifyToken, isAdminOrStaff],
  publisherController.createPublisher,
);
router.get("/", publisherController.getAllPublishers);
router.get("/:id", publisherController.getPublisherById);
router.put(
  "/",
  [verifyToken, isAdminOrStaff],
  publisherController.updatePublisher,
);

export default router;
