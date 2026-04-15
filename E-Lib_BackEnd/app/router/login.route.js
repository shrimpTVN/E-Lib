import express from "express";
import * as loginController from "../controller/login.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", loginController.login);
router.get("/me", verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});
router.post("/logout", loginController.logout);

export default router;
