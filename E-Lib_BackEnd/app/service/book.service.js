import Book from "../model/Book.js";

export const createBook = async (bookData) => {
  return await Book.create(bookData);
};

export const getAllBooks = async ({
  keyword,
  theLoai,
  tacGia,
  page = 1,
  limit = 10,
}) => {
  const filter = {};

  if (keyword) {
    filter.$text = { $search: keyword };
  }
  if (theLoai) {
    filter.theLoai = theLoai;
  }
  if (tacGia) {
    filter.TacGia = tacGia;
  }

  const parsedPage = Math.max(Number(page) || 1, 1);
  const parsedLimit = Math.max(Number(limit) || 10, 1);
  const skip = (parsedPage - 1) * parsedLimit;

  const [items, total] = await Promise.all([
    Book.find(filter).skip(skip).limit(parsedLimit).populate("maNXB"),
    Book.countDocuments(filter),
  ]);

  return {
    total,
    page: parsedPage,
    limit: parsedLimit,
    data: items,
  };
};

export const getBookById = async (id) => {
  return await Book.findById(id).populate("maNXB");
};

export const updateBook = async (id, updateData) => {
  return await Book.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("maNXB");
};

export const deleteBook = async (id) => {
  return await Book.findByIdAndDelete(id);
};
