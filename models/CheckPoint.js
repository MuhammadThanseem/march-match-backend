const mongoose = require("mongoose");

const checkpointSchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },

    type: {
      type: String,
      enum: ["timeout", "halftime", "final"],
    },

    sequence: Number,
    rewardAmount: Number,

    status: {
      type: String,
      enum: ["pending", "processing", "completed"],
      default: "pending",
    },

    // ✅ RESULT
    winningNumber: Number,
    winningEntryId: { type: mongoose.Schema.Types.ObjectId, ref: "GameEntry" },

    // 🔥 NEW (for UI)
    startTime: Date,
    endTime: Date,
    duration: Number, // seconds (e.g. 240)
  },
  { timestamps: true },
);

module.exports = mongoose.model("Checkpoint", checkpointSchema);
