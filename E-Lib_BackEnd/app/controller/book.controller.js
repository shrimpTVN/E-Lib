import mongoose from "mongoose";
import * as bookService from "../service/book.service.js";
import * as publisherService from "../service/publisher.service.js";
import AppError from "../utils/ApiError.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createBook = async (req, res, next) => {
  try {
    // If a file was successfully uploaded to Cloudinary, attach the URL
    // if (req.file) {
    //   bookData.coverImageUrl = req.file.path;
    // }

    const created = await bookService.createBook(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const getAllBooks = async (req, res, next) => {
  try {
    // console.log("get all books");
    const books = await bookService.getAllBooks(req.query);
    const publishers = await publisherService.getAllPublishers();
    const publisherNames = publishers.map((pub) => pub.tenNXB);
    const types = [...new Set(books.data.map((book) => book.theLoai))];
    const authors = [...new Set(books.data.map((book) => book.tacGia))];

    res.status(200).json({ books: books.data, publisherNames, types, authors });
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

export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError("Book ID không hợp lệ", 400));
    }

    const updated = await bookService.updateBook(id, req.body);

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
