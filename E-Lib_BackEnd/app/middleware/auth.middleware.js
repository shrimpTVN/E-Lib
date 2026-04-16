import jwt from "jsonwebtoken";

export const decodedToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};
/**
 * Middleware to verify if the user is authenticated via an HttpOnly cookie
 */
export const verifyToken = (req, res, next) => {
  // 1. Extract the token from the incoming cookie
  // Note: This requires 'cookie-parser' to be configured in your app.js
  const token = req.cookies.token;
  // console.log("Token from cookie:", token);
  // 2. If no token is found, block the request
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập để thực hiện hành động này.",
    });
  }

  try {
    // 3. Verify the token's validity and extract the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the payload data to the request object
    // This makes req.userId and req.userRole available to your controllers
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // 5. Pass control to the next middleware or the main controller function
    next();
  } catch (error) {
    // Distinguish between an expired token and an invalid/tampered token
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

export function isAdmin(req, res, next) {
  const token = req.cookies.token;
  const decoded = decodedToken(token);
  console.log("Decoded token:", decoded);
  if (!decoded || decoded.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền admin" });
  }
  next();
}

export function isStaff(req, res, next) {
  const token = req.cookies.token;
  const decoded = decodedToken(token);
  if (!decoded || decoded.role !== "staff") {
    return res.status(403).json({ message: "Không có quyền staff" });
  }
  next();
}

export function isAdminOrStaff(req, res, next) {
  const token = req.cookies.token;
  const decoded = decodedToken(token);
  if (!decoded || (decoded.role !== "admin" && decoded.role !== "staff")) {
    return res.status(403).json({ message: "Không có quyền admin hoặc staff" });
  }
  next();
}

export function isUser(req, res, next) {
  const token = req.cookies.token;
  const decoded = decodedToken(token);
  if (!decoded || decoded.role !== "") {
    return res
      .status(403)
      .json({ message: "Vui lòng đăng nhập với quyền độc giá" });
  }
  next();
}

export default {
  decodedToken,
  verifyToken,
  isAdmin,
  isStaff,
  isAdminOrStaff,
  isUser,
};
