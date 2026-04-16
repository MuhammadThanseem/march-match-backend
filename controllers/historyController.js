const historyService = require("../services/historyService");

exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await historyService.getUserGameHistory(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get History Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch history",
    });
  }
};