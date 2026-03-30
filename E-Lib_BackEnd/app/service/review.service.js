import Review from "../model/Review.js";

export const createReview = async (reviewData) => {
  return await Review.create(reviewData);
};

export const getAllReviews = async () => {
  return await Review.find().populate("maDocGia").populate("maSach");
};

export const getReviewById = async (id) => {
  return await Review.findById(id).populate("maDocGia").populate("maSach");
};

export const updateReview = async (id, updateData) => {
  return await Review.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("maDocGia")
    .populate("maSach");
};

export const deleteReview = async (id) => {
  return await Review.findByIdAndDelete(id);
};
