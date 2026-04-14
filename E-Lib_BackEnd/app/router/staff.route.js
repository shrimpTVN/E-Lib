import express from "express";
import * as staffController from "../controller/staff.controller.js";

const router = express.Router();

router
  .route("/")
  .get(staffController.getAllStaffs)
  .post(staffController.createStaff);

router
  .route("/:id")
  .get(staffController.getStaffById)
  .patch(staffController.updateStaff)

  .delete(staffController.deleteStaff);

router.patch("/:id/active", staffController.toggleStaffActive);

router.patch("/:id/change-password", staffController.changePassword);
export default router;
