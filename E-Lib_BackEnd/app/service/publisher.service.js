import Publisher from "../model/Publisher.js";

export const createPublisher = async (publisherData) => {
  return await Publisher.create(publisherData);
};

export const getAllPublishers = async () => {
  return await Publisher.find();
};

export const getPublisherById = async (id) => {
  return await Publisher.findById(id);
};

export const updatePublisher = async (id, updateData) => {
  return await Publisher.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

export const deletePublisher = async (id) => {
  return await Publisher.findByIdAndDelete(id);
};
