import mongoose from "mongoose";
import * as loanService from "../service/loan.service.js";
import AppError from "../utils/ApiError.js";
import { decodedToken } from "../middleware/auth.middleware.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createLoan = async (req, res, next) => {
  try {
    const idDocGia = req.body.idDocGia;
    const bookIds = req.body.idSach;
    if (!isValidObjectId(idDocGia)) {
      return next(new AppError("Reader ID không hợp lệ", 400));
    }

    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      return next(new AppError("Danh sách sách mượn không hợp lệ", 400));
    }

    // check the number of active loans for the reader
    const exitsActiveLoad = await loanService.getActiveLoanByReaderId(idDocGia);
    if (exitsActiveLoad + bookIds.length > 5) {
      res.status(400).json({
        message: `Bạn hiện đang mượn ${exitsActiveLoad} quyển sách. Bạn chỉ có thể mượn thêm ${5 - exitsActiveLoad} quyển sách nữa.`,
      });
      return;
    }

    // check whether the reader has overdue loans
    const isOverdue = await loanService.getOverdueLoanByReaderId(idDocGia);
    if (isOverdue > 0) {
      res.status(400).json({
        message: `Bạn có ${isOverdue} lượt mượn quá hạn. Vui lòng trả sách trước khi mượn thêm.`,
      });
      return;
    }

    const created = await Promise.all(
      bookIds.map((idSach) => {
        if (!isValidObjectId(idSach)) {
          throw new AppError(`Book ID ${idSach} không hợp lệ`, 400);
        }

        return loanService.createLoan(idDocGia, idSach);
      }),
    );

    res
      .status(201)
      .json({ bookCreated: created, message: "Tạo lượt mượn thành công" });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const getAllLoans = async (req, res, next) => {
  try {
    const decode = decodedToken(req.cookies.token);

    if (!decode) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    let loans = null;
    if (decode.role === "") {
      loans = await loanService.getAllLoanByReaderId(decode.id);
    } else {
      loans = await loanService.getAllLoans();
    }

    res
      .status(200)
      .json({ loans, message: "Lấy danh sách lượt mượn thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xử lý khi lấy danh sách lượt mượn" });
    next(new AppError(error.message, 500));
  }
};

export const getLoanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Loan ID không hợp lệ", 400));
    }

    const item = await loanService.getLoanById(id);

    if (!item) {
      return next(new AppError("Không tìm thấy lượt mượn", 404));
    }

    res.status(200).json(item);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const updateLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Loan ID không hợp lệ", 400));
    }

    const updated = await loanService.updateLoan(id, req.body);

    if (!updated) {
      return next(new AppError("Không tìm thấy lượt mượn để cập nhật", 404));
    }

    res.status(200).json(updated);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const deleteLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Loan ID không hợp lệ" });
      return;
    }

    const deleted = await loanService.deleteLoan(id);
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy lượt mượn để xóa" });
      return;
    }

    res.status(200).json({ message: "Xóa lượt mượn thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xử lý khi xóa lượt mượn" });
    next(new AppError(error.message, 500));
  }
};
