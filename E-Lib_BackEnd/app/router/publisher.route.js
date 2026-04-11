import * as publisherController from "../controller/publisher.controller.js";
import express from "express";

const router = express.Router();

router.post("/", publisherController.createPublisher);
router.get("/", publisherController.getAllPublishers);
router.get("/:id", publisherController.getPublisherById);
router.put("/:id", publisherController.updatePublisher);

export default router;
