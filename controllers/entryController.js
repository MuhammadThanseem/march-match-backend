const entryService = require("../services/entryService");

// ===============================
// ✅ Create Entry
// ===============================
exports.createEntry = async (req, res) => {
  try {
    const entry = await entryService.createEntry(req.body);

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// ✅ Get User Entries
// ===============================
exports.getUserEntries = async (req, res) => {
  try {
    const entries = await entryService.getEntriesByUser(req.params.userId);

    res.json({
      success: true,
      data: entries,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// ✅ Get Joined Users by Game
// ===============================
exports.getJoinedUsers = async (req, res) => {
  try {
    const { gameId } = req.params;

    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: "Game ID is required",
      });
    }

    const users = await entryService.getJoinedUsersByGame(gameId);

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get Joined Users Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};