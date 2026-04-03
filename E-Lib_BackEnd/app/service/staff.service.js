import Staff from "../model/Staff.js";

export const createStaff = async (staffData) => {
  const newStaff = new Staff(staffData);
  return await newStaff.save();
};

export const getAllStaffs = async () => {
  return await Staff.find();
};

export const getStaffById = async (id) => {
  return await Staff.findById(id);
};

export const getStaffByUsername = async (username) => {
  return await Staff.findOne({ username: username });
};

export const updateStaff = async (id, updateData) => {
  return await Staff.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

export const deleteStaff = async (id) => {
  return await Staff.findByIdAndDelete(id);
};
