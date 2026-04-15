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
  const histories = await History.find({ idDocGia: readerId }).sort({
    ngayTao: -1,
  });
  console.log(`Found ${histories.length} histories for reader ${readerId}`);
  return histories;
};

export const getHistoryById = async (id) => {
  return await History.findById(id);
};

export const countBanDayByReaderId = async (readerId) => {
  try {
    // 1. Use findOne() to directly fetch the single most recent record
    const latestBan = await History.findOne({
      idDocGia: readerId,
      type: "day",
    }).sort({ ngayTao: -1 }); // Match the 'ngayTao' field from your ERD

    // 2. If no ban record exists, return 0
    if (!latestBan) {
      return 0;
    }

    // 3. Calculate elapsed time
    const now = new Date();
    const banStartDate = new Date(latestBan.ngayTao);
    const elapsedMs = now - banStartDate;

    // 4. Convert milliseconds to elapsed days
    // Using Math.floor ensures we count fully completed 24-hour cycles
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));

    // 5. Calculate remaining days
    const totalBanDuration = latestBan.number;
    const remainingDays = totalBanDuration - elapsedDays;

    // 6. Prevent negative numbers if the ban has already expired
    return Math.max(0, remainingDays);
  } catch (error) {
    console.error("Error calculating ban days for reader:", error);
    throw error; // Always good practice to throw the error to be handled by the controller
  }
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
