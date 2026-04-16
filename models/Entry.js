const mongoose = require("mongoose");

const gameEntrySchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedNumber: Number, // 0–9
  },
  { timestamps: true },
);

// ✅ Prevent duplicate numbers per game
gameEntrySchema.index(
  { gameId: 1, assignedNumber: 1 },
  { unique: true }
);

// (Optional but recommended)
// ✅ Prevent same user joining twice
gameEntrySchema.index(
  { gameId: 1, userId: 1 },
  { unique: true }
);

module.exports = mongoose.model("GameEntry", gameEntrySchema);