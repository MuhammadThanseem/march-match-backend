require("dotenv").config();
const mongoose = require("mongoose");

const Checkpoint = require("../../models/CheckPoint"); // ✅ fixed case
const Score = require("../../models/Score");

// 🔁 Import your service
const gameService = require("../../services/gameService");

// ✅ SCORE GENERATOR
function generateScores(totalSlots) {
  let scores = [];

  let teamAScore = 0;
  let teamBScore = 0;

  for (let i = 1; i <= totalSlots; i++) {
    const incA = Math.floor(Math.random() * 4);
    const incB = Math.floor(Math.random() * 4);

    teamAScore += incA;
    teamBScore += incB;

    // Default winning number logic (example)
    let winningNumber = Math.abs(teamAScore - teamBScore) % 10;

    // ✅ Force 0 for specific checkpoints
    if ([1, 3, 6].includes(i)) {
      winningNumber = 0;
    }

    scores.push({
      sequence: i,
      teamAScore,
      teamBScore,
      winningNumber,
    });
  }

  // ✅ Enforce final winning difference (0–3)
  let diff = Math.abs(teamAScore - teamBScore);

  if (diff > 3) {
    console.log("⚠ Adjusting final score to keep diff within 0–3");

    if (teamAScore > teamBScore) {
      teamBScore = teamAScore - Math.floor(Math.random() * 4);
    } else {
      teamAScore = teamBScore - Math.floor(Math.random() * 4);
    }

    // update last slot
    const last = scores[scores.length - 1];
    last.teamAScore = teamAScore;
    last.teamBScore = teamBScore;

    // recompute winning number
    last.winningNumber = Math.abs(teamAScore - teamBScore) % 10;

    // ✅ re-enforce if last is 1,3,6
    if ([1, 3, 6].includes(last.sequence)) {
      last.winningNumber = 0;
    }
  }

  return scores;
}

async function run() {
  try {
    console.log("🚀 Starting Game Creation Script...\n");

    // ✅ DB connect
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected\n");

    const totalSlots = 8;

    console.log(`🎯 Generating ${totalSlots} slots of scores...\n`);

    // ✅ generate scores
    const autoScores = generateScores(totalSlots);

    console.log("\n📊 Final Generated Scores:");
    console.table(autoScores);

    const startTime = new Date(Date.now() + 2 * 60 * 1000);

    // Force seconds and milliseconds to 0
    startTime.setSeconds(0, 0);

    console.log("\n⏱ Game Start Time:", startTime);

    const gameData = {
      title: "Demo Match",
      teamAName: "Lakers",
      teamBName: "Warriors",
      league: "NBA",
      entryFee: 10,
      totalSlots,
      startTime,
      status: "upcoming",
      scores: autoScores,
    };

    console.log("\n📦 Creating Game...\n");

    const game = await gameService.createGame(gameData);

    console.log("🎉 Game Created Successfully!");
    console.log("🆔 Game ID:", game._id);

    // ✅ Optional: verify DB inserts
    const checkpointCount = await Checkpoint.countDocuments({
      gameId: game._id,
    });

    const scoreCount = await Score.countDocuments({
      gameId: game._id,
    });

    console.log("\n📌 Verification:");
    console.log(`✔ Checkpoints Created: ${checkpointCount}`);
    console.log(`✔ Scores Inserted: ${scoreCount}`);

    console.log("\n✅ Script Completed Successfully\n");

    process.exit(0);
  } catch (err) {
    console.error("\n❌ ERROR OCCURRED:");
    console.error(err.message);
    console.error(err.stack);

    process.exit(1);
  }
}

run();
