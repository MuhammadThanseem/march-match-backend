const gameService = require("../services/gameService");

// ✅ Create Game
exports.createGame = async (req, res) => {
  try {
    const game = await gameService.createGame(req.body);
    res.json({ success: true, game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Join Game
exports.joinGame = async (req, res) => {
  try {
    const entry = await gameService.joinGame(req.params.gameId, req.user.id);
    res.json({ success: true, entry });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Start Game
exports.startGame = async (req, res) => {
  try {
    const game = await gameService.startGame(req.params.gameId);
    res.json({ success: true, game });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Update Score
exports.updateScore = async (req, res) => {
  try {
    const { gameId, teamAScore, teamBScore } = req.body;

    const result = await gameService.updateScore(
      gameId,
      teamAScore,
      teamBScore,
    );

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get Game
exports.getGame = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware
    const data = await gameService.getGame(req.params.gameId, userId);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Game Details
exports.getGameDetails = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware
    const data = await gameService.getGameDetails(req.params.gameId, userId);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get All Games
exports.getAllGames = async (req, res) => {
  try {
    const games = await gameService.getAllGames();
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Upcoming Games
exports.getUpcomingGames = async (req, res) => {
  try {
    const games = await gameService.getUpcomingGames();
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Live Games
exports.getLiveGames = async (req, res) => {
  try {
    const games = await gameService.getLiveGames();
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCheckpoints = async (req, res) => {
  try {
    const { id } = req.params;

    const checkpoints = await gameService.getCheckpoints(id);

    res.json({
      success: true,
      data: checkpoints,
    });
  } catch (err) {
    console.error("getCheckpoints error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ GET WINNERS
exports.getWinners = async (req, res) => {
  try {
    const { id } = req.params;

    const winners = await gameService.getWinners(id);

    res.json({
      success: true,
      data: winners,
    });
  } catch (err) {
    console.error("getWinners error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
