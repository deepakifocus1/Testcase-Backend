const User = require("../models/userModel");
const AppError = require("../middleware/errorHandler");

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

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

module.exports = {
  getAllUsers,
};
