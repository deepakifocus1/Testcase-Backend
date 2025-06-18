const authController = require("../controllers/authController");
const User = require("../models/userModel");
const { AppError } = require("../middleware/errorHandler");
const {
  STATUS_MESSAGE,
  SUCCESS_MESSAGES,
  authController: AUTH_MSGS,
} = require("../constants/constants");

jest.mock("../models/userModel");

describe("authController", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user and return success", async () => {
      req.body = { email: "test@example.com", name: "Test", password: "pass" };
      User.findOne.mockResolvedValue(null);
      User.register = jest.fn().mockResolvedValue({
        user: { _id: "1", email: "test@example.com" },
        token: "token123",
      });

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS_MESSAGE.SUCCESS,
        message: SUCCESS_MESSAGES.USER_CREATED,
        data: {
          user: { _id: "1", email: "test@example.com" },
          token: "token123",
        },
      });
    });

    it("should call next with error if body is missing", async () => {
      req.body = undefined;
      await authController.register(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe(AUTH_MSGS.requestBody);
    });

    it("should call next with error if user already exists", async () => {
      req.body = { email: "exists@example.com", name: "Test" };
      User.findOne.mockResolvedValue({ _id: "1" });

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe(AUTH_MSGS.userExist);
    });

    it("should call next on validation error", async () => {
      req.body = { email: "invalid" }; // invalid according to Joi
      await authController.register(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toMatch(/email/);
    });
  });

  describe("login", () => {
    it("should login user and return token", async () => {
      req.body = { email: "test@example.com", password: "pass" };
      User.login = jest.fn().mockResolvedValue({
        user: { _id: "1", email: "test@example.com" },
        token: "token123",
      });

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: STATUS_MESSAGE.SUCCESS,
        data: {
          user: { _id: "1", email: "test@example.com" },
          token: "token123",
        },
      });
    });

    it("should call next with error if body is missing", async () => {
      req.body = undefined;
      await authController.login(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe(AUTH_MSGS.requestBody);
    });

    it("should call next on validation error", async () => {
      req.body = { email: "invalid" }; // invalid according to Joi
      await authController.login(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toMatch(/email/);
    });

    it("should call next on login error", async () => {
      req.body = { email: "test@example.com", password: "wrong" };
      User.login = jest.fn().mockRejectedValue(new Error("Login failed"));

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
