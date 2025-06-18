const RecentActivity = require("../models/recentActivity");
const {
  createActivity,
  getAllRecentActivities,
} = require("../controllers/recentActivity");

jest.mock("../models/recentActivity");

describe("recentActivity controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createActivity", () => {
    it("should create and return a recent activity", async () => {
      const payload = { action: "created", createdBy: "user1" };
      const mockActivity = { ...payload, _id: "123" };
      RecentActivity.create.mockResolvedValue(mockActivity);

      const result = await createActivity(payload);

      expect(RecentActivity.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(mockActivity);
    });

    it("should handle errors and log them", async () => {
      const payload = { action: "error" };
      const error = new Error("DB error");
      RecentActivity.create.mockRejectedValue(error);
      console.error = jest.fn();

      await createActivity(payload);

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe("getAllRecentActivities", () => {
    it("should fetch and return all recent activities", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockActivities = [{ action: "created" }, { action: "updated" }];
      const populateMock = jest.fn().mockReturnThis();
      const sortMock = jest.fn().mockResolvedValue(mockActivities);

      RecentActivity.find.mockReturnValue({
        populate: populateMock,
        sort: sortMock,
      });

      await getAllRecentActivities(req, res);

      expect(RecentActivity.find).toHaveBeenCalled();
      expect(populateMock).toHaveBeenCalledWith("createdBy");
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockActivities);
    });

    it("should handle errors and log them", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error("DB error");
      const populateMock = jest.fn().mockReturnThis();
      const sortMock = jest.fn().mockRejectedValue(error);

      RecentActivity.find.mockReturnValue({
        populate: populateMock,
        sort: sortMock,
      });

      console.error = jest.fn();

      await getAllRecentActivities(req, res);

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });
});
