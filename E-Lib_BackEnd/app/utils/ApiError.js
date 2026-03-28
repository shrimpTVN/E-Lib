// utils/appError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Helps distinguish planned errors from hosting/system crashes

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
