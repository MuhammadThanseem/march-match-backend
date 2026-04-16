const mongoose = require("mongoose");

const gameEntrySchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedNumber: Number, // 0–9
  },
  { timestamps: true },
);

module.exports = mongoose.model("GameEntry", gameEntrySchema);
