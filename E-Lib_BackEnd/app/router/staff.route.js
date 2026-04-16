import express from "express";
import * as staffController from "../controller/staff.controller.js";
import {
  verifyToken,
  isAdminOrStaff,
  isAdmin,
} from "../middleware/auth.middleware.js";
const router = express.Router();

router
  .route("/", verifyToken)
  .get(isAdmin, staffController.getAllStaffs)
  .post(isAdmin, staffController.createStaff);

router.patch("/:id/active", isAdmin, staffController.toggleStaffActive);
router.patch("/:id/change-password", staffController.changePassword);

router
  .route("/:id", verifyToken, isAdminOrStaff)
  .get(staffController.getStaffById)
  .patch(staffController.updateStaff)

  .delete(staffController.deleteStaff);

export default router;
