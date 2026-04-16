const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");
const { auth } = require("../middlewares/authMiddleware");


router.get("/user", auth, historyController.getUserHistory);

module.exports = router;