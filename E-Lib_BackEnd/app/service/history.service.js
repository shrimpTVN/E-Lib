import History from "../model/History.js";
import Reader from "../model/Reader.js";

export const createHistory = async (readerId, historyData) => {
  const newHistory = new History({ ...historyData, idDocGia: readerId });

  if (historyData.type === "point") {
    const reader = await Reader.findById(readerId);
    reader.diemTichLuy = (reader.diemTichLuy || 0) + Number(historyData.number);
    await reader.save();
  } else if (historyData.type === "money") {
    const reader = await Reader.findById(readerId);
    reader.tienPhat = (reader.tienPhat || 0) + Number(historyData.number);
    await reader.save();
  }
  return await newHistory.save();
};

export const getAllHistoriesByReaderId = async (readerId) => {
  return await History.find({ idDocGia: readerId });
};

export const getHistoryById = async (id) => {
  return await History.findById(id);
};

export const updateHistory = async (id, updateData) => {
  return await History.findByIdAndUpdate(id, updateData, {
    // new: true,
    runValidators: true,
  });
};

export const deleteHistory = async (id) => {
  return await History.findByIdAndDelete(id);
};
