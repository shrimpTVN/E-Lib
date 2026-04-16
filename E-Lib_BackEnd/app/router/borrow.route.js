import express from "express";
import * as loanController from "../controller/loan.controller.js";
import {
  verifyToken,
  isUser,
  isAdminOrStaff,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router
  .route("/")
  .get(verifyToken, loanController.getAllLoans)
  .post([verifyToken, isUser], loanController.createLoan);

router
  .route("/update-status")
  .patch(verifyToken, loanController.updateLoanStatus);
router.route("/extend/:id").patch(verifyToken, loanController.extendLoan);

router
  .route("/:id", verifyToken)
  .get(loanController.getLoanById)
  .patch(isAdminOrStaff, loanController.updateLoan)
  .delete(isUser, loanController.deleteLoan);

export default router;
