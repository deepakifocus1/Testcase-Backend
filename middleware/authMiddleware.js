const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { AppError } = require("./errorHandler");
const { ERROR_MESSAGES } = require("../constants/constants");

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(ERROR_MESSAGES.AUTH_TOKEN_REQUIRED, 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = await jwt.verify(
      token,
      process.env.JWT_SECRET || "63d41a0bf8a2188a52a1eb52aa7a054f6e2f7db1"
    );

    const user = await User.findOne({ email: decoded.email }).select(
      "-password"
    );
    if (!user) {
      throw new AppError(ERROR_MESSAGES.NO_USERS_FOUND, 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401));
    }
    next(error);
  }
};

const isAuthorized = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError(ERROR_MESSAGES.AUTH_TOKEN_REQUIRED, 401);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError(ERROR_MESSAGES.PERMISSION_DENIED, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { isAuthenticated, isAuthorized };
