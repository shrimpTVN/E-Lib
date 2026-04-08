import Loan from "../model/Loan.js";

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
  return await Loan.find().populate("idDocGia").populate("idSach");
};

export const getAllLoanByReaderId = async (idDocGia) => {
  return await Loan.find({ idDocGia: idDocGia }).populate("idSach");
};

export const getLoanById = async (id) => {
  return await Loan.findById(id).populate("idDocGia").populate("idSach");
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

export const getOverdueLoans = async () => {
  const now = new Date();
  return await Loan.find({ isQuaHan: true, isReturned: false });
};

export const updateLoan = async (id, updateData) => {
  return await Loan.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("idDocGia")
    .populate("idSach");
};

export const deleteLoan = async (id) => {
  const loan = await Loan.findById(id);

  return await Loan.findByIdAndDelete(id);
};
