const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    entries: [{ type: mongoose.Schema.Types.ObjectId, ref: "GameEntry" }],

    action: {
      type: String,
      enum: ["joined", "win", "refund"],
    },

    amount: Number,
    balanceAfter: Number,
    assignedNumber: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);
