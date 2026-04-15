import mongoose from "mongoose";
import * as bookService from "../service/book.service.js";
import * as publisherService from "../service/publisher.service.js";
import AppError from "../utils/ApiError.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createBook = async (req, res, next) => {
  try {
    const bookData = { ...req.body };

    if (req.files?.biaSach?.length) {
      bookData.biaSach = req.files.biaSach[0].url;
    }

    bookData.hinhAnh = req.files?.newHinhAnh?.length
      ? req.files.newHinhAnh.map((file) => file.url)
      : [];

    const created = await bookService.createBook(bookData);
    res.status(201).json(created);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const getAllBooks = async (req, res, next) => {
  try {
    // console.log("get all books");
    // console.log("Query parameters:", req.query);
    const data = await bookService.getAllBooks({
      keyword: req.query.keyword,
      types: req.query.types,
      authors: req.query.authors,
      keyword: req.query.keyword,
      publishers: req.query.publishers,
      page: req.query.page,
      limit: req.query.limit,
    });
    // console.log("Books retrieved:", data);
    const publishers = await publisherService.getAllPublishers();
    const publisherNames = publishers.map((pub) => pub.tenNXB);
    const types = [...new Set(data.books.map((book) => book.theLoai))];
    const authors = [...new Set(data.books.map((book) => book.tacGia))];

    res.status(200).json({
      books: data.books,
      publisherNames,
      types,
      authors,
      totalRecords: data.total,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Book ID không hợp lệ", 400));
    }

    const book = await bookService.getBookById(id);
    if (!book) {
      return next(new AppError("Không tìm thấy sách", 404));
    }
    const relatedBooks = await bookService.getRelatedBooks(book);
    res.status(200).json({ book: book, relatedBooks: relatedBooks });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const getBookSuggestions = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    const suggestions = await bookService.getSuggestions(keyword);
    return res.status(200).json(suggestions);
  } catch (error) {
    console.error("Lỗi khi lấy gợi ý:", error);
    return res.status(500).json({ message: "Lỗi server." });
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Book ID không hợp lệ", 400));
    }

    const bookData = { ...req.body };

    bookData.hinhAnh = JSON.parse(bookData.hinhAnh || "[]");
    // console.log("Existing book data:", bookData.hinhAnh);
    if (req.files?.biaSach?.length) {
      bookData.biaSach = req.files.biaSach[0].url;
    }

    if (req?.files?.newHinhAnh?.length) {
      // console.log("New images uploaded:", req.files.newHinhAnh);
      const newImages = req.files?.newHinhAnh?.length
        ? req.files.newHinhAnh.map((file) => file.url)
        : [];

      bookData.hinhAnh = [...bookData.hinhAnh, ...newImages];
    }

    // console.log("Updated book data:", bookData.hinhAnh);

    const updated = await bookService.updateBook(id, bookData);
    if (!updated) {
      return next(new AppError("Không tìm thấy sách để cập nhật", 404));
    }

    res.status(200).json(updated);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Book ID không hợp lệ", 400));
    }

    const deleted = await bookService.deleteBook(id);
    if (!deleted) {
      return next(new AppError("Không tìm thấy sách để xóa", 404));
    }

    res.status(200).json({ message: "Xóa sách thành công" });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
