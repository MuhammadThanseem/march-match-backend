const walletService = require("../services/walletService");

exports.getMyWallet = async (req, res) => {
  try {
    const wallet = await walletService.getWalletByUser(req.user._id);

    // Calculate pending withdrawals
    const pendingWithdrawals = await walletService.getPendingWithdrawals(
      req.user._id,
    );

    res.json({
      success: true,
      data: {
        ...wallet.toObject(), // Convert Mongoose doc to plain object
        pending: pendingWithdrawals || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deposit = async (req, res) => {
  try {
    const amount = Number(req.body.amount) || 0; // default to 0 if not provided
    console.log("Deposit amount:", amount, req.user);
    const wallet = await walletService.deposit(req.user._id, amount);
    res.json({ success: true, data: wallet || { balance: 0 } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const amount = Number(req.body.amount) || 0; // default to 0 if not provided
    const wallet = await walletService.withdraw(req.user._id, amount);
    res.json({ success: true, data: wallet || { balance: 0 } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await walletService.getUserTransactions(req.user._id);
    res.json({ success: true, data: transactions || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentPayouts = async (req, res) => {
  try {
    const data = await walletService.getRecentPayouts(10);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
