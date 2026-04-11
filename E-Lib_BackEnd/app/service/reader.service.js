import Reader from "../model/Reader.js";

export const getAllReaders = async () => {
  return await Reader.find();
};

export const getReaderById = async (id) => {
  return await Reader.findById(id);
};

export const getReaderByEmail = async (email) => {
  console.log("Tìm reader bằng email:", email);
  return await Reader.findOne({ email: email });
};

export const createReader = async (readerData) => {
  const newReader = new Reader(readerData);
  return await newReader.save();
};

export const updateReader = async (id, updateData) => {
  return await Reader.findByIdAndUpdate(id, updateData, {
    // new: true,
    runValidators: true,
  });
};

export const deleteReader = async (id) => {
  return await Reader.findByIdAndDelete(id);
};
