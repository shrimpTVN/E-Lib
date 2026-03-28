// controllers/errorController.js
const errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Development: Send detailed info for debugging
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // Production: Send clean, user-friendly messages
  else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message || "Something went wrong!",
    });
  }
};

export default errorController;
