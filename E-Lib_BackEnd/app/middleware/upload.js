// app/middleware/upload.js
import cloudinary from "cloudinary";
import multer from "multer";
import cloudinaryStorage from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = cloudinaryStorage({
  cloudinary,
  // Change 'params' from a static object to an async function
  params: async (req, file) => {
    // Extract a unique identifier from the request body.
    // We use maSach (Book Code) as it is unique and uppercase
    // Fallback to 'uncategorized' if maSach is missing
    const bookCode = req.body.maSach ? req.body.maSach.trim() : "uncategorized";

    // Define the dynamic folder path (e.g., "elib_books/B001")
    const folderPath = `elib_books/${bookCode}`;

    return {
      folder: folderPath,
      allowedFormats: ["jpeg", "png", "jpg", "webp"],
    };
  },
});

const uploadCloud = multer({ storage });

export default uploadCloud;
