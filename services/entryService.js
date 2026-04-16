const Entry = require("../models/Entry");

exports.createEntry = async (data) => {
  const entry = new Entry(data);
  return await entry.save();
};

exports.getEntriesByUser = async (userId) => {
  return await Entry.find({ userId }).populate("gameId");
};

exports.getEntriesByGame = async (gameId) => {
  return await Entry.find({ gameId }).populate("userId");
};