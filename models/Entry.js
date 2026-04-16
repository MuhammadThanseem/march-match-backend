const mongoose = require("mongoose");

const gameEntrySchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedNumber: { type: Number, required: true }, // 0–9
  },
  { timestamps: true },
);

// ✅ Unique number per game
gameEntrySchema.index({ gameId: 1, assignedNumber: 1 }, { unique: true });

// ✅ One entry per user per game
gameEntrySchema.index({ gameId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("GameEntry", gameEntrySchema);
