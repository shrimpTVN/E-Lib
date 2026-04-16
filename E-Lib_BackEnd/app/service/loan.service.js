import Loan from "../model/Loan.js";
import Reader from "../model/Reader.js";
import History from "../model/History.js";

export const createLoan = async (idDocGia, idSach) => {
  await Loan.create({
    idDocGia,
    idSach,
  });
  const newLoad = await Loan.findOne({ idDocGia, idSach })
    .sort({ createdAt: -1 })
    .populate("idSach", "tenSach");

  return newLoad;
};

export const getAllLoans = async () => {
  return await Loan.find()
    .sort({ updatedAt: -1 })
    .populate("idDocGia", "hoLot ten")
    .populate("idSach", "tenSach")
    .populate("TRANG_THAI.idNhanVien", "hoTen");
};

export const getAllLoanByReaderId = async (idDocGia) => {
  return await Loan.find({ idDocGia: idDocGia })
    .sort({ updatedAt: -1 })
    .populate("idSach");
};

export const getLoanById = async (id) => {
  return await Loan.findById(id)
    .populate("idDocGia")
    .populate("idSach", "tenSach");
};

export const getActiveLoanByReaderId = async (idDocGia) => {
  return await Loan.find({ idDocGia: idDocGia })
    .where("isReturned")
    .equals(false)
    .countDocuments()
    .sort({ updatedAt: -1 });
};

export const getOverdueLoanByReaderId = async (idDocGia) => {
  const cnt = await Loan.countDocuments({
    idDocGia: idDocGia,
    isQuaHan: true,
    isReturned: false,
  });
  return cnt;
};

export const getBookReportByBookId = async (idSach) => {
  const loanQuantity = await Loan.countDocuments({ idSach: idSach });
  const overdueQuantity = await Loan.countDocuments({
    idSach: idSach,
    isQuaHan: true,
    isReturned: false,
  });
  const registerQuantity = await Loan.countDocuments({
    idSach: idSach,
    trangThaiHienTai: "Chờ duyệt",
  });
  const waitingQuantity = await Loan.countDocuments({
    idSach: idSach,
    trangThaiHienTai: "Chờ nhận",
  });
  const borrowingQuantity = await Loan.countDocuments({
    idSach: idSach,
    trangThaiHienTai: "Đang mượn",
  });

  return {
    loanQuantity,
    overdueQuantity,
    registerQuantity,
    waitingQuantity,
    borrowingQuantity,
  };
};

export const hasUserBorrowedBook = async (idDocGia, idSach) => {
  const loan = await Loan.findOne({
    idDocGia,
    idSach,
  })
    .where("trangThaiHienTai")
    .equals("Đã trả");
  return !!loan;
};

export const getOverdueLoans = async () => {
  const now = new Date();
  return await Loan.find({ isQuaHan: true, isReturned: false });
};

export const updateLoan = async (id, updateData) => {
  return await Loan.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("idDocGia", "hoLot ten")
    .populate("idSach", "tenSach");
};

export const deleteLoan = async (id) => {
  const loan = await Loan.findById(id);

  return await Loan.findByIdAndDelete(id);
};

export const processDailyPenalties = async () => {
  try {
    console.log("[CRON] Starting daily penalty processing...");
    const penaltyAmount = -2000;
    const today = new Date();
    const systemStaffId = "69df52735a32e5462324b9f3"; // Hệ thống tự động

    // 1. Find all active loans that are past their due date
    // Assuming TRANG_THAI array does not contain 'Returned'
    const overdueLoans = await Loan.find({
      hanTra: { $lt: today },
      isReturned: { $ne: true },
    }).populate("idSach", "tenSach");

    if (overdueLoans.length === 0) {
      console.log("[CRON] No overdue books today.");
      return;
    }

    overdueLoans = overdueLoans.filter((loan) => {
      // Only process loans that haven't been marked as overdue yet
      const daysOverdue = Math.ceil(
        (today - loan.hanTra) / (1000 * 60 * 60 * 24),
      );

      // Chỉ áp dụng phạt nếu sách quá hạn dưới 7 ngày, tránh phạt quá nặng nếu quên trả lâu
      if (daysOverdue < 7) {
        return true;
      }
      return false;
    });

    // 2. Prepare bulk operations
    const readerUpdates = {};
    const historyInserts = [];
    const loanUpdates = [];

    // Group penalties by reader (in case a reader has multiple overdue books)
    overdueLoans.forEach((loan) => {
      const readerId = loan.idDocGia.toString();

      // Tally up total penalty for the reader
      if (!readerUpdates[readerId]) {
        readerUpdates[readerId] = 0;
      }
      readerUpdates[readerId] += penaltyAmount;

      // Prepare History log
      historyInserts.push({
        idDocGia: loan.idDocGia,
        type: "money",
        ngayTao: today,
        number: penaltyAmount,
        lyDo: `Quá hạn trả sách  ${loan.idSach.tenSach}. Hạn trả: ${loan.hanTra.toLocaleDateString()}`,
      });

      //if the loan is not already marked as overdue, prepare to update it
      if (!loan.isQuaHan) {
        loanUpdates.push({
          updateOne: {
            filter: { _id: loan._id },
            update: {
              // 1. Dùng $set để cập nhật các trường đơn lẻ
              $set: {
                isQuaHan: true,
                trangThaiHienTai: "Quá hạn",
              },
              // 2. Dùng $push để thêm một object mới vào mảng TRANG_THAI
              $push: {
                TRANG_THAI: {
                  tenTrangThai: "Quá hạn",
                  ngayTao: today,
                  idNhanVien: systemStaffId, // Bắt buộc phải truyền vì Schema đang required: true
                },
              },
            },
          },
        });
      }
    });

    // 3. Build Reader bulk writes
    const readerBulkOps = Object.keys(readerUpdates).map((readerId) => ({
      updateOne: {
        filter: { _id: readerId },
        update: { $inc: { tienPhat: readerUpdates[readerId] } },
      },
    }));

    // 4. Execute all database operations concurrently
    await Promise.all([
      Reader.bulkWrite(readerBulkOps),
      Loan.bulkWrite(loanUpdates),
      History.insertMany(historyInserts),
    ]);

    console.log(`[CRON] Processed penalties for ${overdueLoans.length} loans.`);
  } catch (error) {
    console.error("[CRON] Failed to process daily penalties:", error);
    // In a real app, you might want to send an error alert to the Admin here
  }
};
