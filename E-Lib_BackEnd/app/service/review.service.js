import Review from "../model/Review.js";
import * as bookService from "./book.service.js";

export const createReview = async (reviewData) => {
  const book = await bookService.getBookById(reviewData.idSach);
  const quantity = Review.countDocuments({ idSach: reviewData.idSach });

  const danhGia =
    (quantity * book.danhGia + reviewData.danhGia) / (quantity + 1);
  await bookService.updateBook(reviewData.idSach, {
    danhGia: danhGia.toFixed(1),
  });

  return await Review.create(reviewData);
};

export const getAllReviews = async () => {
  return await Review.find().populate("idDocGia").populate("idSach");
};

export const getReviewsByBookId = async (bookId) => {
  return await Review.find({ idSach: bookId })
    .sort({ ngayTao: -1 })
    .populate("idDocGia", "hoLot ten")
    .populate("idSach", "tenSach");
};

export const getReviewById = async (id) => {
  return await Review.findById(id).populate("idDocGia").populate("idSach");
};

export const hasUserVoted = async (idSach, idDocGia) => {
  const review = await Review.findOne({ idSach: idSach, idDocGia: idDocGia });
  return !!review;
};

export const updateReview = async (id, updateData) => {
  return await Review.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("idDocGia")
    .populate("idSach");
};

export const deleteReview = async (id) => {
  return await Review.findByIdAndDelete(id);
};
