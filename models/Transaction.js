const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // ✅ Extend types
    type: {
      type: String,
      enum: ["deposit", "withdraw", "entry", "win_final", "win_half", "win_timeout"],
      required: true,
    },

    amount: { type: Number, required: true },

    balanceAfter: { type: Number, required: true },

    // ✅ NEW: status for UI
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "completed",
    },

    // ✅ NEW: store match/game info
    title: { type: String }, // "Game Winnings (Final)"
    subtitle: { type: String }, // "DUK vs UNC • Mar 24"
    winningNumber: {
  type: Number,
  default: null,
},

    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);