const User = require("../models/userModel");
const { AppError } = require("../middleware/errorHandler");

const register = async (req, res, next) => {
  try {
    if (!req.body) {
      throw new AppError("Request body is required", 400, "MISSING_BODY");
    }
    const { name, email, password, role, projects } = req.body;
    if (!name || !email || !password || !role) {
      throw new AppError(
        "Name, email, password, and role are required",
        400,
        "MISSING_FIELDS"
      );
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(
        "User with this email already exists",
        409,
        "USER_EXISTS"
      );
    }
    const userData = { name, email, password, role, projects: projects || [] };
    const result = await User.register(userData);
    res.status(201).json({
      status: "success",
      data: { user: result.user, token: result.token },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    if (!req.body) {
      throw new AppError("Request body is required", 400, "MISSING_BODY");
    }
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError(
        "Email and password are required",
        400,
        "MISSING_FIELDS"
      );
    }
    const result = await User.login(email, password);
    res.status(200).json({
      status: "success",
      data: { user: result.user, token: result.token },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
