const express = require("express");
const router = express.Router();
const controller = require("../controllers/gameController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");

// Admin routes
router.post("/create", auth, isAdmin, controller.createGame);
router.post("/start/:gameId", auth, isAdmin, controller.startGame);
router.post("/update-score", auth, isAdmin, controller.updateScore);

// User
router.post("/join/:gameId", auth, controller.joinGame);

// Public
router.get("/all", auth, controller.getAllGames);
router.get("/upcoming", auth, controller.getUpcomingGames);
router.get("/live", auth, controller.getLiveGames);
router.get("/:gameId", auth, controller.getGame);
router.get("/:gameId/details", auth, controller.getGameDetails);
router.get("/:id/checkpoints", auth, controller.getCheckpoints);
router.get("/:id/winners", auth, controller.getWinners);

module.exports = router;
