const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.get("/", getAllUsers);
router.put("/:userId", updateUser);
router.delete("/:userId", deleteUser);

module.exports = router;
