const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { AppError } = require("./errorHandler");

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication token required", 401, "NO_TOKEN");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      throw new AppError("User not found", 401, "INVALID_TOKEN");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401, "INVALID_TOKEN"));
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401, "TOKEN_EXPIRED"));
    }
    next(error);
  }
};

const isAuthorized = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "NOT_AUTHENTICATED");
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError(
          "You do not have permission to perform this action",
          403,
          "UNAUTHORIZED"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { isAuthenticated, isAuthorized };
