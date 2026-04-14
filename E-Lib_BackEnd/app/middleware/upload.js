import cloudinary from "cloudinary";
import multer from "multer";
import CloudinaryStorage from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "E-lib/Books",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const uploadBookImages = multer({ storage }).fields([
  { name: "biaSach", maxCount: 1 },
  { name: "newHinhAnh", maxCount: 5 },
]);

export { cloudinary, uploadBookImages };
