const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AppError } = require("../middleware/errorHandler");

const UserSchema = new mongoose.Schema(
  {
    // firstName: String,
    // lastName: String,
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)",
      ],
      // default: "Ifocus@123",
    },
    role: {
      type: String,
    },
    jobTitle: String,
    timeZone: String,
    language: String,
    team: String,
    isApproved: {
      type: Boolean,
      default: false,
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      const salt = await bcryptjs.genSalt(10);
      this.password = await bcryptjs.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.statics.register = async function (userData) {
  try {
    const user = new this(userData);
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" }
    );

    return {
      user,
      token,
    };
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(
        `Duplicate field value: ${Object.keys(error.keyValue).join(", ")}`,
        409
      );
    }
    if (error.name === "ValidationError") {
      throw new AppError(
        Object.values(error.errors)
          .map((val) => val.message)
          .join(", "),
        400
      );
    }
    throw new AppError(error.message, 500);
  }
};

UserSchema.statics.login = async function (email, password) {
  try {
    const user = await this.findOne({ email });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" }
    );

    return {
      user,
      token,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message, 500);
  }
};

module.exports = mongoose.model("User", UserSchema);
