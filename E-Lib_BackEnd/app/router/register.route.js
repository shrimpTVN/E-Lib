import express from "express";
import * as loginController from "../controller/login.controller.js";

const router = express.Router();

router.post("/", loginController.register);

export default router;
