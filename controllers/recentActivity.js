const RecentActivity = require("../models/recentActivity");

const createActivity = async (payload) => {
  try {
    const recentActivity = await RecentActivity.create(payload);
    return recentActivity;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createActivity,
};
