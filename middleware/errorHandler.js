const mongoose = require("mongoose");

class AppError extends Error {
  constructor(message, statusCode, errorCode = "GENERIC_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let errorCode = err.errorCode || "SERVER_ERROR";

  if (err.name === "ValidationError") {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  } else if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    errorCode = "INVALID_ID";
    message = "Invalid ID format";
  } else if (err.code === 11000) {
    statusCode = 409;
    errorCode = "DUPLICATE_KEY";
    message = `Duplicate field value: ${Object.keys(err.keyValue).join(", ")}`;
  } else if (err instanceof mongoose.Error) {
    statusCode = 400;
    errorCode = "MONGOOSE_ERROR";
    message = err.message;
  } else if (!(err instanceof AppError)) {
    statusCode = 500;
    errorCode = "INTERNAL_SERVER_ERROR";
    message = "An unexpected error occurred";
  }

  res.status(statusCode).json({
    status: "error",
    errorCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { AppError, globalErrorHandler };
