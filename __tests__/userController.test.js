const userController = require("../controllers/userController");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const { AppError } = require("../middleware/errorHandler");
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("../constants/constants");

jest.mock("../models/userModel");
jest.mock("mongoose", () => ({
  ...jest.requireActual("mongoose"),
  isValidObjectId: jest.fn(),
}));

describe("userController", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("should return users if found", async () => {
      const users = [{ _id: "1", name: "Test" }];
      const select = jest.fn().mockReturnThis();
      const populate = jest.fn().mockReturnThis();
      const sort = jest.fn().mockResolvedValue(users);

      User.find.mockReturnValue({ select, populate, sort });

      await userController.getAllUsers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: { users },
      });
    });

    it("should call next with AppError if no users found", async () => {
      const select = jest.fn().mockReturnThis();
      const populate = jest.fn().mockReturnThis();
      const sort = jest.fn().mockResolvedValue([]);

      User.find.mockReturnValue({ select, populate, sort });

      await userController.getAllUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe(ERROR_MESSAGES.NO_USERS_FOUND);
    });

    it("should call next on error", async () => {
      const select = jest.fn().mockReturnThis();
      const populate = jest.fn().mockReturnThis();
      const sort = jest.fn().mockRejectedValue(new Error("DB error"));

      User.find.mockReturnValue({ select, populate, sort });

      await userController.getAllUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("updateUser", () => {
    beforeEach(() => {
      mongoose.isValidObjectId.mockReturnValue(true);
      req.params.userId = "507f1f77bcf86cd799439011";
    });

    it("should update user and return updated user", async () => {
      req.body = { name: "Updated", email: "test@example.com" };
      User.findOne.mockResolvedValue(null);
      User.findByIdAndUpdate.mockResolvedValue({
        _id: req.params.userId,
        name: "Updated",
      });

      await userController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        updatedUser: { _id: req.params.userId, name: "Updated" },
      });
    });

    it("should return 409 if email exists for another user", async () => {
      req.body = { email: "exists@example.com" };
      User.findOne.mockResolvedValue({ _id: "anotherId" });

      await userController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: ERROR_MESSAGES.EMAIL_EXIST,
      });
    });

    it("should call next with AppError if userId is invalid", async () => {
      mongoose.isValidObjectId.mockReturnValue(false);

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe(
        ERROR_MESSAGES.VALID_ID_REQUIRED
      );
    });

    it("should call next with AppError if projects contain invalid id", async () => {
      mongoose.isValidObjectId.mockImplementation((id) => id === "validId");
      req.body.projects = ["validId", "invalidId"];

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe(
        ERROR_MESSAGES.VALID_ID_REQUIRED
      );
    });

    it("should call next with AppError if user not updated", async () => {
      req.body = {};
      User.findOne.mockResolvedValue(null);
      User.findByIdAndUpdate.mockResolvedValue(null);

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe(
        ERROR_MESSAGES.USER_NOT_UPDATED
      );
    });

    it("should handle ValidationError", async () => {
      const error = {
        name: "ValidationError",
        errors: { name: { message: "Invalid name" } },
      };
      req.body = {};
      User.findOne.mockResolvedValue(null);
      User.findByIdAndUpdate.mockRejectedValue(error);

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe("Invalid name");
    });

    it("should handle duplicate key error", async () => {
      const error = { code: 11000, keyValue: { email: "test@example.com" } };
      req.body = {};
      User.findOne.mockResolvedValue(null);
      User.findByIdAndUpdate.mockRejectedValue(error);

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toContain("Duplicate field value");
    });
  });

  describe("deleteUser", () => {
    beforeEach(() => {
      req.params.userId = "507f1f77bcf86cd799439011";
      mongoose.isValidObjectId.mockReturnValue(true);
    });

    it("should delete user and return success", async () => {
      User.findByIdAndDelete.mockResolvedValue({ _id: req.params.userId });

      await userController.deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: SUCCESS_MESSAGES.USER_DELETED,
      });
    });

    it("should call next with AppError if userId is invalid", async () => {
      mongoose.isValidObjectId.mockReturnValue(false);

      await userController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe(ERROR_MESSAGES.INVALID_ID);
    });

    it("should call next with AppError if user not found", async () => {
      User.findByIdAndDelete.mockResolvedValue(null);

      await userController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe(
        ERROR_MESSAGES.USER_NOT_DELETED
      );
    });

    it("should call next on error", async () => {
      User.findByIdAndDelete.mockRejectedValue(new Error("DB error"));

      await userController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
