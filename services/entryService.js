const mongoose = require("mongoose");
const Entry = require("../models/Entry");

// ===============================
// ✅ Create Entry
// ===============================
exports.createEntry = async (data) => {
  const entry = new Entry(data);
  return await entry.save();
};

// ===============================
// ✅ Get Entries by User
// ===============================
exports.getEntriesByUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid User ID");
  }

  return await Entry.find({ userId }).populate("gameId").lean();
};

// ===============================
// ✅ Get Entries by Game (raw)
// ===============================
exports.getEntriesByGame = async (gameId) => {
  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    throw new Error("Invalid Game ID");
  }

  return await Entry.find({ gameId }).populate("userId").lean();
};

// ===============================
// ✅ Get Joined Users (formatted)
// ===============================
exports.getJoinedUsersByGame = async (gameId) => {
  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    throw new Error("Invalid Game ID");
  }

  const entries = await Entry.find({ gameId })
    .populate("userId", "name email mobile")
    .sort({ assignedNumber: 1 })
    .lean();

  return entries.map((entry) => ({
    id: entry._id,
    number: entry.assignedNumber,
    userId: entry.userId?._id,
    userName: entry.userId?.name || "Unknown",
    email: entry.userId?.email,
    mobile: entry.userId?.mobile,
    joinedAt: entry.createdAt,
  }));
};