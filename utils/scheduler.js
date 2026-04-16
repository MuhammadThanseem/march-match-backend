// schedulers/gameScheduler.js

const cron = require("node-cron");
const Game = require("../models/Game");
const Checkpoint = require("../models/CheckPoint");
const GameService = require("../services/gameService");

function startGameScheduler() {
  console.log("🟢 Game Scheduler Initialized");

  cron.schedule("* * * * *", async () => {
    const now = new Date();
    console.log("⏱️ Cron triggered at:", now.toISOString());

    try {
      // Run both in parallel
      await Promise.all([handleUpcomingGames(now), handleLiveGames(now)]);
    } catch (err) {
      console.error("❌ Scheduler error:", err.message);
    }
  });
}

module.exports = startGameScheduler;

/* =====================================================
   🚀 HANDLE UPCOMING GAMES
===================================================== */
async function handleUpcomingGames(now) {
  try {
    const games = await Game.find({
      status: "upcoming",
      startTime: { $lte: now },
      processing: false,
    }).lean();

    if (!games.length) return;

    await Promise.all(
      games.map(async (game) => {
        let lockedGame = null;

        try {
          // 🔒 Lock the game (atomic)
          lockedGame = await Game.findOneAndUpdate(
            { _id: game._id, processing: false },
            { $set: { processing: true } },
            { returnDocument: "after" }, // ✅ FIX
          );

          if (!lockedGame) return;

          console.log(`🚀 Starting Game: ${lockedGame._id}`);

          // ✅ Safe start (idempotent)
          await GameService.startGame(lockedGame._id);
        } catch (err) {
          console.error(`❌ Start Error ${game._id}:`, err.message);
        } finally {
          // 🔓 Always unlock
          if (lockedGame) {
            await Game.updateOne(
              { _id: lockedGame._id },
              { $set: { processing: false } },
            );
          }
        }
      }),
    );
  } catch (err) {
    console.error("❌ Upcoming handler error:", err.message);
  }
}

/* =====================================================
   🏁 HANDLE LIVE GAMES
===================================================== */
async function handleLiveGames(now) {
  try {
    const games = await Game.find({
      status: "live",
      processing: false,
    }).lean();

    if (!games.length) return;

    await Promise.all(
      games.map(async (game) => {
        let lockedGame = null;

        try {
          // 🔒 Lock game (atomic)
          lockedGame = await Game.findOneAndUpdate(
            { _id: game._id, processing: false },
            { $set: { processing: true } },
            { returnDocument: "after" }, // ✅ FIX
          );

          if (!lockedGame) return;

          // ===============================
          // ✅ CONDITION 1: End time reached
          // ===============================
          if (lockedGame.endTime && lockedGame.endTime <= now) {
            console.log(`🏁 Completing Game (endTime): ${lockedGame._id}`);

            await GameService.completeGame(lockedGame._id);
            return;
          }

          // ===============================
          // ✅ CONDITION 2: All checkpoints done
          // ===============================
          const hasPendingCheckpoint = await Checkpoint.exists({
            gameId: lockedGame._id,
            status: "pending",
          });

          if (!hasPendingCheckpoint) {
            console.log(
              `🏁 Completing Game (checkpoints done): ${lockedGame._id}`,
            );

            await GameService.completeGame(lockedGame._id);
          }
        } catch (err) {
          console.error(`❌ Complete Error ${game._id}:`, err.message);
        } finally {
          // 🔓 Always unlock
          if (lockedGame) {
            await Game.updateOne(
              { _id: lockedGame._id },
              { $set: { processing: false } },
            );
          }
        }
      }),
    );
  } catch (err) {
    console.error("❌ Live handler error:", err.message);
  }
}
