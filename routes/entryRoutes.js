const express = require("express");
const router = express.Router();
const entryController = require("../controllers/entryController");

router.post("/", entryController.createEntry);
router.get("/user/:userId", entryController.getUserEntries);

module.exports = router;