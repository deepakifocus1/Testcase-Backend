const express = require("express");
const { register, login } = require("../controllers/authController");
const {
  isAuthenticated,
  isAuthorized,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/profile",
  isAuthenticated,
  isAuthorized(["user", "admin", "manager"]),
  (req, res) => {
    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          projects: req.user.projects,
        },
      },
    });
  }
);

router.get("/admin", isAuthenticated, isAuthorized(["admin"]), (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the admin dashboard",
  });
});

module.exports = router;
