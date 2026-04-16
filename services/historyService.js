const History = require("../models/History");
const Checkpoint = require("../models/CheckPoint");

const getUserGameHistory = async (userId) => {
  const histories = await History.find({ user: userId })
    .populate({
      path: "gameId",
      select: "teamAName teamBName teamAScore teamBScore startTime status",
    })
    .populate({
      path: "entries",
      select: "assignedNumber",
    })
    .sort({ createdAt: -1 });

  const grouped = {};

  for (const h of histories) {
    if (!h.gameId) continue;

    const gameId = h.gameId._id.toString();

    if (!grouped[gameId]) {
      grouped[gameId] = {
        gameId,
        teamA: h.gameId.teamAName,
        teamB: h.gameId.teamBName,
        score: `${h.gameId.teamAScore || 0}-${h.gameId.teamBScore || 0}`,
        startTime: h.gameId.startTime,

        yourNumber: null, // set later safely

        entry: 0,
        amount: 0,
        checkpoints: [],
      };
    }

    // ✅ CAPTURE assigned number ONLY from joined
    if (h.action === "joined") {
      grouped[gameId].entry += h.amount || 0;

      if (grouped[gameId].yourNumber === null) {
        grouped[gameId].yourNumber = h.assignedNumber;
      }
    }

    // WIN
    if (h.action === "win") {
      grouped[gameId].amount += h.amount || 0;
    }
  }

  // ✅ FETCH CHECKPOINTS FOR ALL GAMES
  const gameIds = Object.keys(grouped);

  const checkpoints = await Checkpoint.find({
    gameId: { $in: gameIds },
  }).lean();

  // ✅ GROUP CHECKPOINTS BY GAME
  const cpMap = {};
  checkpoints.forEach((cp) => {
    const gid = cp.gameId.toString();
    if (!cpMap[gid]) cpMap[gid] = [];
    cpMap[gid].push(cp);
  });

  // ✅ ATTACH CHECKPOINT DATA
  let games = Object.values(grouped).map((g) => {
    const cps = cpMap[g.gameId] || [];

    let checkpointsData = [];
    let wonCount = 0;

    cps.forEach((cp) => {
      const isWin = cp.winningNumber === g.yourNumber;

      if (isWin) wonCount++;

      // ✅ LABEL LOGIC
      let label = "";

      if (cp.type === "final") {
        label = "Final Score";
      } else if (cp.type === "halftime") {
        label = "Halftime";
      } else {
        label = cp.label || `Media Timeout ${cp.sequence}`;
      }

      checkpointsData.push({
        label,
        amount: isWin ? cp.amount : 0,
        win: isWin,
      });
    });

    const date = new Date(g.startTime);

    return {
      ...g,
      month: date.toLocaleString("en-US", { month: "short" }),
      day: date.getDate(),

      win: g.amount > 0,

      checkpoints: checkpointsData,
      checkpointsWon: wonCount,
      totalCheckpoints: cps.length,
    };
  });

  // SORT
  games.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  // SUMMARY
  const totalWinnings = games.reduce((sum, g) => sum + g.amount, 0);
  const gamesPlayed = games.length;
  const wins = games.filter((g) => g.win).length;

  const winRate = gamesPlayed ? Math.round((wins / gamesPlayed) * 100) : 0;

  const bestHit = Math.max(...games.map((g) => g.amount), 0);

  return {
    summary: {
      totalWinnings,
      gamesPlayed,
      winRate,
      bestHit,
    },
    games,
  };
};

module.exports = {
  getUserGameHistory,
};
