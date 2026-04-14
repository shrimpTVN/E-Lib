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

router.route("/update-status").patch(loanController.updateLoanStatus);
router.route("/extend/:id").patch(loanController.extendLoan);

router
  .route("/:id")
  .get(loanController.getLoanById)
  .patch([verifyToken, isAdminOrStuff], loanController.updateLoan)
  .delete([verifyToken, isUser], loanController.deleteLoan);

export default router;
