const express = require("express");
const router = express.Router();
const CheckpointController = require("../controllers/checkpointController");

router.get("/current", CheckpointController.getCurrent);
router.get("/active", CheckpointController.getActive);
router.get("/next", CheckpointController.getNext);
router.get("/last-completed", CheckpointController.getLastCompleted);
router.post("/:id/complete", CheckpointController.complete);
router.get("/game/:gameId", CheckpointController.getGameCheckpoints);

module.exports = router;