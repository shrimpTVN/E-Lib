import express from "express";
import * as loanController from "../controller/loan.controller.js";

const router = express.Router();

router
  .route("/")
  .get(loanController.getAllLoans)
  .post(loanController.createLoan);

router
  .route("/:id")
  .get(loanController.getLoanById)
  .patch(loanController.updateLoan)
  .delete(loanController.deleteLoan);

export default router;
