const User = require("../models/userModel");
const { AppError } = require("../middleware/errorHandler");

const register = async (req, res, next) => {
  try {
    if (!req.body) {
      throw new AppError("Request body is required", 400);
    }
    const {
      name,
      jobTitle,
      language,
      timeZone,
      email,
      password,
      role,
      team,
      isApproved,
      accountCreatedBy,
      projects,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }
    const userData = {
      name,
      jobTitle,
      language,
      timeZone,
      email,
      password: "Ifocus@123",
      role,
      team,
      accountCreatedBy,
      isApproved: isApproved || false,
      projects: projects || [],
    };
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
      throw new AppError("Request body is required", 400);
    }
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
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
