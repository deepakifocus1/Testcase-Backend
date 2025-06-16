const User = require("../models/userModel");
const { AppError } = require("../middleware/errorHandler");
const mongoose = require("mongoose");
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("../constants/constants");

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("projects")
      .populate("accountCreatedBy")
      .sort({ createdAt: -1 });

    if (!users || users.length === 0) {
      throw new AppError(ERROR_MESSAGES.NO_USERS_FOUND, 404);
    }

    res.status(200).json({
      status: "success",
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      name,
      email,
      jobTitle,
      timeZone,
      isApproved,
      language,
      role,
      team,
      projects,
    } = req.body || {};

    if (!userId || !mongoose.isValidObjectId(userId)) {
      throw new AppError(ERROR_MESSAGES.VALID_ID_REQUIRED, 400);
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (jobTitle) updateData.jobTitle = jobTitle;
    if (timeZone) updateData.timeZone = timeZone;
    if (language) updateData.language = language;
    if (role) updateData.role = role;
    if (team) updateData.team = team;
    if (isApproved) updateData.isApproved = isApproved;

    // Handle projects separately
    if (projects && Array.isArray(projects)) {
      const validProjects = projects.filter((id) =>
        mongoose.isValidObjectId(id)
      );
      if (validProjects.length !== projects.length) {
        throw new AppError(ERROR_MESSAGES.INVALID_ID, 400);
      }
      updateData.$addToSet = { projects: { $each: validProjects } };
    }
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(409).json({
          status: "error",
          message: ERROR_MESSAGES.EMAIL_EXIST,
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!updatedUser) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_UPDATED, 404);
    }

    res.status(200).json({
      status: "success",
      updatedUser,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return next(
        new AppError(
          Object.values(error.errors)
            .map((val) => val.message)
            .join(", "),
          400
        )
      );
    }
    if (error.code === 11000) {
      return next(
        new AppError(
          `Duplicate field value: ${Object.keys(error.keyValue).join(", ")}`,
          409
        )
      );
    }
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ID, 400);
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_DELETED, 404);
    }
    res.status(200).json({
      status: "success",
      message: SUCCESS_MESSAGES.USER_DELETED,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
};
