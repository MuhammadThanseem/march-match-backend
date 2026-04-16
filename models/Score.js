const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
    checkpointId: { type: mongoose.Schema.Types.ObjectId, ref: "Checkpoint" },
    teamAScore: Number,
    teamBScore: Number,
    combinedScore: Number,
    winningNumber: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Score", scoreSchema);
