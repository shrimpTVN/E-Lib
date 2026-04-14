import mongoose from "mongoose";
import * as staffService from "../service/staff.service.js";
import AppError from "../utils/ApiError.js";
import bcrypt from "bcryptjs";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const sanitizeStaff = (staffDoc) => {
  const staff = staffDoc.toObject ? staffDoc.toObject() : staffDoc;
  delete staff.password;
  return staff;
};

export const createStaff = async (req, res, next) => {
  try {
    const created = await staffService.createStaff(req.body);
    res.status(201).json(sanitizeStaff(created));
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const getAllStaffs = async (req, res, next) => {
  try {
    const items = await staffService.getAllStaffs();
    res.status(200).json(items.map(sanitizeStaff));
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getStaffById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Staff ID không hợp lệ", 400));
    }

    const item = await staffService.getStaffById(id);
    if (!item) {
      return next(new AppError("Không tìm thấy nhân viên", 404));
    }

    res.status(200).json(sanitizeStaff(item));
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Staff ID không hợp lệ", 400));
    }

    const updated = await staffService.updateStaff(id, req.body);

    if (!updated) {
      return next(new AppError("Không tìm thấy nhân viên để cập nhật", 404));
    }

    res.status(200).json(sanitizeStaff(updated));
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Staff ID không hợp lệ", 400));
    }

    const deleted = await staffService.deleteStaff(id);
    if (!deleted) {
      return next(new AppError("Không tìm thấy nhân viên để xóa", 404));
    }

    res.status(200).json({ message: "Xóa nhân viên thành công" });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const toggleStaffActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    // console.log(req.body);
    if (!isValidObjectId(id)) {
      return next(new AppError("Staff ID không hợp lệ", 400));
    }

    const currentStaff = await staffService.getStaffById(req.body.staff._id);
    if (!currentStaff) {
      return next(new AppError("Không tìm thấy nhân viên hiện tại", 404));
    }

    const isMatch = await bcrypt.compare(
      req.body.staff.password,
      currentStaff.password,
    );

    if (!isMatch) {
      return next(new AppError("Mật khẩu không đúng", 401));
    }

    const staff = await staffService.getStaffById(id);
    if (!staff) {
      return next(new AppError("Không tìm thấy nhân viên", 404));
    }
    staff.isActive = !staff.isActive;
    const updated = await staffService.updateStaff(id, {
      isActive: staff.isActive,
    });
    res.status(200).json(sanitizeStaff(updated));
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    if (!isValidObjectId(id)) {
      return next(new AppError("Staff ID không hợp lệ", 400));
    }

    const staff = await staffService.getStaffById(id);
    if (!staff) {
      return next(new AppError("Không tìm thấy nhân viên", 404));
    }

    const isMatch = await bcrypt.compare(oldPassword, staff.password);
    if (!isMatch) {
      return next(new AppError("Mật khẩu cũ không đúng", 401));
    }

    staff.password = newPassword;

    res.status(200).json(await staff.save());
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
