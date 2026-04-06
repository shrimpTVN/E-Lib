import Book from "../model/Book.js";

export const createBook = async (bookData) => {
  return await Book.create(bookData);
};

export const getAllBooks = async ({
  keyword,
  theLoai,
  tacGia,
  page = 1,
  limit = 12,
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
  const parsedLimit = Math.max(Number(limit) || 12, 1);
  const skip = (parsedPage - 1) * parsedLimit;

  const [items, total] = await Promise.all([
    Book.find(filter).skip(skip).limit(parsedLimit).populate("idNXB", "tenNXB"),
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
  return await Book.findById(id).populate("idNXB", "tenNXB");
};

export const getRelatedBooks = async (book, limit = 20) => {
  return await Book.find()
    .where("_id")
    .ne(book._id)
    .or([{ theLoai: book.theLoai }, { tacGia: book.tacGia }])
    .populate("idNXB", "tenNXB")
    .limit(limit)
    .lean();
};

export const updateBook = async (id, updateData) => {
  return await Book.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("idNXB", "tenNXB");
};

export const deleteBook = async (id) => {
  return await Book.findByIdAndDelete(id);
};
