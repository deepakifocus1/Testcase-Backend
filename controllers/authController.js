const User = require("../models/userModel");
const { AppError } = require("../middleware/errorHandler");
const { userSchema, loginSchema } = require("../validations/UserValidationJoi");
const {
  authController,
  STATUS_MESSAGE,
  SUCCESS_MESSAGES,
} = require("../constants/constants");

const register = async (req, res, next) => {
  try {
    if (!req.body) {
      throw new AppError(authController.requestBody, 400);
    }

    const { error, value: payload } = userSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new AppError(errorMessage, 400);
    }

    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      throw new AppError(authController.userExist, 409);
    }

    const {
      password = "Ifocus@123",
      isApproved = false,
      projects = [],
      ...restPayload
    } = payload;

    const userData = {
      ...restPayload,
      password,
      isApproved,
      projects,
    };

    const result = await User.register(userData);
    res.status(201).json({
      status: STATUS_MESSAGE.SUCCESS,
      message: SUCCESS_MESSAGES.USER_CREATED,
      data: { user: result.user, token: result.token },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    if (!req.body) {
      throw new AppError(authController.requestBody, 400);
    }

    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new AppError(errorMessage, 400);
    }

    const { email, password } = value;
    const result = await User.login(email, password);
    res.status(200).json({
      status: STATUS_MESSAGE.SUCCESS,
      data: { user: result.user, token: result.token },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
