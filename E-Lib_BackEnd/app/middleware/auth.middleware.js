import jwt from "jsonwebtoken";

const decodedToken = (token) => {
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

  // 2. If no token is found, block the request
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access Denied. No token provided. Please log in.",
    });
  }

  try {
    // 3. Verify the token's validity and extract the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the payload data to the request object
    // This makes req.userId and req.userRole available to your controllers
    req.userId = decoded.id;
    req.userRole = decoded.role;

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

export function onlyAdmin(req, res, next) {
  const token = req.cookies.token;
  const decoded = decodedToken(token);
  if (!decoded || decoded.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền admin" });
  }
  next();
}

export function onlyUser(req, res, next) {
  const token = req.cookies.token;
  const decoded = decodedToken(token);
  if (!decoded || decoded.role !== "user") {
    return res.status(403).json({ message: "Không có quyền user" });
  }
  next();
}

export default { verifyToken, onlyAdmin, onlyUser };
