import mongoose from "mongoose";
import * as loanService from "../service/loan.service.js";
import AppError from "../utils/ApiError.js";
import * as bookService from "../service/book.service.js";
import * as historyService from "../service/history.service.js";
import * as readerService from "../service/reader.service.js";
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

    const reader = await readerService.getReaderById(idDocGia);
    if (!reader) {
      return next(new AppError("Không tìm thấy độc giả", 404));
    }

    const countBanDay = await historyService.countBanDayByReaderId(idDocGia);
    if (countBanDay > 0) {
      return next(
        new AppError(
          `Bạn đang bị cấm mượn sách trong ${countBanDay} ngày tới do vi phạm quy định.`,
          400,
        ),
      );
    }

    if (reader.tienPhat < 0) {
      return next(
        new AppError(
          "Bạn đang có tiền phạt chưa thanh toán. Vui lòng thanh toán trước khi mượn sách.",
          400,
        ),
      );
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

export const updateLoanStatus = async (req, res, next) => {
  const { idLoan, newStatus, idNhanVien, idSach, idDocGia } = req.body;
  // console.log("Received update status request:", {
  //   idLoan,
  //   newStatus,
  //   idNhanVien,
  //   idSach
  // });
  const nextStatus = {
    "Hủy nhận": "Đã hủy nhận",
    "Từ chối": "Bị từ chối",
    Duyệt: "Chờ nhận",
    "Đã nhận": "Đang mượn",
    "Đã trả": "Đã trả",
    "Thất lạc": "Thất lạc",
  };

  try {
    if (!isValidObjectId(idLoan)) {
      return next(new AppError("Loan ID không hợp lệ", 400));
    }

    if (!isValidObjectId(idNhanVien)) {
      return next(new AppError("Staff ID không hợp lệ", 400));
    }

    if (!nextStatus[newStatus]) {
      return next(new AppError("Trạng thái mới không hợp lệ", 400));
    }

    const loan = await loanService.getLoanById(idLoan);
    if (!loan) {
      return next(new AppError("Không tìm thấy lượt mượn để cập nhật", 404));
    }

    const book = await bookService.getBookById(idSach);
    if (!book) {
      return next(new AppError("Không tìm thấy sách để cập nhật", 404));
    }

    loan.trangThaiHienTai = nextStatus[newStatus];
    loan.TRANG_THAI.push({
      tenTrangThai: newStatus,
      idNhanVien: idNhanVien,
    });

    if (newStatus === "Duyệt") {
      book.conLai -= 1;
    }

    if (newStatus === "Đã trả" || newStatus === "Hủy nhận") {
      if (newStatus === "Đã trả") {
        if (!loan.isQuaHan) {
          await historyService.createHistory(idDocGia, {
            type: "point",
            number: 1,
            lyDo: `Điểm tích lũy từ việc trả sách ${book.tenSach} đúng hạn`,
          });
        } else {
          await historyService.createHistory(idDocGia, {
            type: "point",
            number: -1,
            lyDo: `Trừ điểm tích lũy từ việc trả sách ${book.tenSach} quá hạn`,
          });
        }
        loan.ngayTra = new Date();
      }

      if (newStatus === "Hủy nhận") {
        await historyService.createHistory(idDocGia, {
          type: "point",
          number: -2,
          lyDo: `Điểm trừ do không nhận sách ${book.tenSach} sau 1 tuần được duyệt`,
        });
      }

      loan.isReturned = true;
      book.conLai += 1;
    }

    if (newStatus === "Thất lạc") {
      book.isReturned = true;
      book.soLuong -= 1;
      await historyService.createHistory(idDocGia, {
        type: "money",
        number: book.giaTien,
        lyDo: `Tiền phạt do thất lạc sách ${book.tenSach}`,
      });
    }

    if (newStatus === "Đã nhận ") {
      loan.hanTra = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }

    const updated = await loan.save();
    await book.save();
    res.status(200).json(updated);
  } catch (error) {
    next(new AppError(error.message, 500));
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

export const extendLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Loan ID không hợp lệ", 400));
    }

    const loan = await loanService.getLoanById(id);
    if (!loan) {
      return next(new AppError("Không tìm thấy lượt mượn để gia hạn", 404));
    }

    if (loan.isGiaHan) {
      return next(new AppError("Lượt mượn đã được gia hạn trước đó", 400));
    }

    if (loan.trangThaiHienTai !== "Đang mượn") {
      return next(new AppError("Chỉ có thể gia hạn lượt mượn đang mượn", 400));
    }

    if (loan.idDocGia.diemTichLuy < 7) {
      return next(
        new AppError(
          "Bạn cần ít nhất 7 điểm tích lũy để gia hạn lượt mượn",
          400,
        ),
      );
    }

    await historyService.createHistory(loan.idDocGia, {
      type: "point",
      number: -7,
      lyDo: `Điểm trừ do gia hạn lượt mượn sách ${loan.idSach.tenSach} thêm 7 ngày`,
    });

    loan.isGiaHan = true;
    loan.hanTra = new Date(loan.hanTra.getTime() + 7 * 24 * 60 * 60 * 1000);

    res.status(200).json(await loan.save());
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
