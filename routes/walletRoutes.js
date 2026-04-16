const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { auth } = require("../middlewares/authMiddleware");

router.get("/me", auth, walletController.getMyWallet);
router.post("/deposit", auth, walletController.deposit);
router.post("/withdraw", auth, walletController.withdraw);
router.get("/transactions", auth, walletController.getMyTransactions);
router.get("/recent-payouts", auth, walletController.getRecentPayouts);

module.exports = router;