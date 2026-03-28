import express from "express";
import globalErrorHandler from "./app/controller/ErrorController.js";
import AppError from "./app/utils/ApiError.js";
import cors from "cors";

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable CORS for all origins by default

// ... your routes (e.g., /api/books)

app.get("/", (req, res) => {
  res.send("Welcome to the Book API");
});

app.get("/api/users/:id/:username", (req, res) => {
  res.send(
    `Welcome to the Book API, ${req.params.username}! Your ID is ${req.params.id}.`,
  );
});

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// The Global Error Handler
app.use(globalErrorHandler);

export default app;
