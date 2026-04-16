const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { auth } = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// Protected route example
router.put("/:id", auth, userController.updateUser);

module.exports = router;