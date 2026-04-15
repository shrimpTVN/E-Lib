import Book from "../model/Book.js";
import Publisher from "../model/Publisher.js";

export const createBook = async (bookData) => {
  return await Book.create(bookData);
};

export const getAllBooks = async ({
  keyword = "",
  types,
  authors,
  publishers,
  page = 1,
  limit = 12,
}) => {
  // 1. Build the dynamic Mongoose query object
  const query = {};

  if (types) {
    // Convert "Fiction,Science" into an array of case-insensitive RegEx for flexible matching
    const typeArray = types
      .split(",")
      .map((t) => new RegExp(`^${t.trim()}$`, "i"));
    query.theLoai = { $in: typeArray };
  }

  if (authors) {
    const authorArray = authors
      .split(",")
      .map((a) => new RegExp(`^${a.trim()}$`, "i"));
    query.tacGia = { $in: authorArray };
  }

  if (publishers) {
    // Since Books reference Publishers via idNXB, we first need to find the Publisher IDs
    const pubArray = publishers
      .split(",")
      .map((p) => new RegExp(`^${p.trim()}$`, "i"));
    const matchingPublishers = await Publisher.find({
      tenNXB: { $in: pubArray },
    }).select("_id");
    const publisherIds = matchingPublishers.map((pub) => pub._id);

    query.idNXB = { $in: publisherIds };
  }

  if (keyword) {
    // We create a reusable case-insensitive Regex for the search term
    const searchRegex = { $regex: keyword.trim(), $options: "i" };

    // The $or array checks multiple fields against the same keyword
    query.$or = [
      { tenSach: searchRegex }, // Search by Book Title
      { tacGia: searchRegex }, // Search by Author Name
      { theLoai: searchRegex }, // Search by Category
    ];
  }
  // 2. Calculate pagination parameters

  const parsedPage = Math.max(Number(page) || 1, 1);
  const parsedLimit = Math.max(Number(limit) || 12, 1);
  const skip = (parsedPage - 1) * parsedLimit;

  const [items, total] = await Promise.all([
    await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .populate("idNXB", "tenNXB"),
    Book.countDocuments(query),
  ]);

  return {
    total,
    page: parsedPage,
    limit: parsedLimit,
    books: items,
  };
};

export const getSuggestions = async (keyword) => {
  if (!keyword) return [];

  const searchRegex = { $regex: keyword.trim(), $options: "i" };

  // Dùng .select() để CHỈ lấy các trường cần thiết, giảm tối đa băng thông
  // Dùng .limit(6) để query siêu nhanh
  const suggestions = await Book.find({
    $or: [{ tenSach: searchRegex }, { tacGia: searchRegex }],
  })
    .select("_id tenSach tacGia biaSach") // Chỉ lấy những trường cần thiết cho gợi ý
    .limit(6)
    .lean();

  return suggestions;
};

export const getBookById = async (id) => {
  return await Book.findById(id).populate("idNXB", "tenNXB");
};

export const getRelatedBooks = async (book, limit = 12) => {
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
    runValidators: true,
  }).populate("idNXB", "tenNXB");
};

export const deleteBook = async (id) => {
  return await Book.findByIdAndDelete(id);
};
