import express from "express";
import * as loanController from "../controller/loan.controller.js";
import {
  verifyToken,
  isUser,
  isAdminOrStuff,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router
  .route("/")
  .get(verifyToken, loanController.getAllLoans)
  .post([verifyToken, isUser], loanController.createLoan);

router
  .route("/:id")
  .get(loanController.getLoanById)
  .patch([verifyToken, isAdminOrStuff], loanController.updateLoan)
  .delete([verifyToken, isUser], loanController.deleteLoan);

// router.route("/:id/update-status").patch(loanController.updateLoanStatus);

export default router;
