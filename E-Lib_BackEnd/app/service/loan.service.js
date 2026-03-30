import Loan from "../model/Loan.js";

export const createLoan = async (loanData) => {
  return await Loan.create(loanData);
};

export const getAllLoans = async () => {
  return await Loan.find()
    .populate("maDocGia")
    .populate("maSach")
    .populate("TRANG_THAI.maNhanVien");
};

export const getLoanById = async (id) => {
  return await Loan.findById(id)
    .populate("maDocGia")
    .populate("maSach")
    .populate("TRANG_THAI.maNhanVien");
};

export const updateLoan = async (id, updateData) => {
  return await Loan.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("maDocGia")
    .populate("maSach")
    .populate("TRANG_THAI.maNhanVien");
};

export const deleteLoan = async (id) => {
  return await Loan.findByIdAndDelete(id);
};
