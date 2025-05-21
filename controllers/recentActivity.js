const RecentActivity = require("../models/recentActivity");

const createActivity = async (payload) => {
  try {
    const recentActivity = await RecentActivity.create(payload);
    return recentActivity;
  } catch (error) {
    console.error(error);
  }
};

const getAllRecentActivities = async (req, res) => {
  try {
    const recentActivities = await RecentActivity.find().sort({
      createdAt: -1,
    });
    res.status(200).json(recentActivities);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createActivity,
  getAllRecentActivities,
};
