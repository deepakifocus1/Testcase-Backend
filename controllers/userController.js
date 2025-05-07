const User = require("../models/userModel");
const AppError = require("../middleware/errorHandler");
const mongoose = require("mongoose");

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("projects")
      .sort({ createdAt: -1 });

    if (!users || users.length === 0) {
      throw new AppError("No users found", 404, "NO_USERS_FOUND");
    }

    res.status(200).json({
      status: "success",
      data: {
        users: users.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          projects: user.projects,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    if (!req.body) {
      throw new AppError("Request body is required", 400, "MISSING_BODY");
    }

    const { userId } = req.params;
    const { name, email, role, projects } = req.body;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      throw new AppError("Valid user ID is required", 400, "INVALID_USER_ID");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Prepare update data
    const updateData = {};

    // Update basic fields if provided
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    // Handle projects array - append new projects rather than replace
    if (projects && Array.isArray(projects)) {
      // Validate all project IDs
      const validProjects = projects.filter((projectId) =>
        mongoose.isValidObjectId(projectId)
      );

      if (validProjects.length !== projects.length) {
        throw new AppError(
          "One or more project IDs are invalid",
          400,
          "INVALID_PROJECT_IDS"
        );
      }

      // Use $addToSet to add unique project IDs to the array
      // This ensures we don't add duplicates
      await User.findByIdAndUpdate(userId, {
        $addToSet: { projects: { $each: validProjects } },
      });
    }

    // Update the user with the basic fields
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run validators on update
    }).select("-password");

    if (!updatedUser) {
      throw new AppError("Failed to update user", 500, "UPDATE_FAILED");
    }

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          projects: updatedUser.projects,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      },
    });
  } catch (error) {
    // Handle specific errors
    if (error.name === "ValidationError") {
      return next(
        new AppError(
          Object.values(error.errors)
            .map((val) => val.message)
            .join(", "),
          400,
          "VALIDATION_ERROR"
        )
      );
    }
    if (error.code === 11000) {
      return next(
        new AppError(
          `Duplicate field value: ${Object.keys(error.keyValue).join(", ")}`,
          409,
          "DUPLICATE_KEY"
        )
      );
    }
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUser,
};
