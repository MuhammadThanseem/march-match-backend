const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// Admin routes
router.get("/all", auth, isAdmin, userController.getAllUsers);
router.get("/stats", auth, userController.getUserStats);
router.get("/:id", auth, isAdmin, userController.getUserById);

// Protected route example
router.put("/:id", auth, userController.updateUser);

module.exports = router;
