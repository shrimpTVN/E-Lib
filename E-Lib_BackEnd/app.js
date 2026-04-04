import express from "express";
import globalErrorHandler from "./app/controller/error.controller.js";
import AppError from "./app/utils/ApiError.js";
import cors from "cors";
import router from "./app/router/routes.js";
import cookieParser from "cookie-parser";
import { verifyToken } from "./app/middleware/auth.middleware.js";

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

app.use(
  cors({
    origin: "http://localhost:3001", // URL của frontend
    credentials: true, // Cho phép gửi/nhận cookie
  }),
); // Enable CORS with credentials
app.use(cookieParser()); // Middleware to parse cookies

app.get("/", (req, res) => {
  res.send("Welcome to the Book API");
});

app.get("/api/me", verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

// catch-all route and pass for the matched route
router(app);

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// The Global Error Handler
app.use(globalErrorHandler);

export default app;
