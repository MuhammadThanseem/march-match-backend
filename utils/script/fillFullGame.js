require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Game = require("../../models/Game");
const GameEntry = require("../../models/Entry");
const User = require("../../models/User");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env");
  process.exit(1);
}

const argv = process.argv.slice(2);
const gameId = argv[0] || process.env.GAME_ID;
const targetCount = Number(argv[1] || process.env.COUNT || 10);

if (!gameId) {
  console.error("Usage: node utils/script/fillFullGame.js <gameId> [count]");
  console.error("Example: node utils/script/fillFullGame.js 64b123abcd 10");
  process.exit(1);
}

async function createTestUser(index) {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `testuser_${suffix}_${index}`;
  const email = `testuser_${suffix}_${index}@example.com`;
  const mobile = `9000000${String(Math.floor(Math.random() * 900000) + 100000)}`;
  const password = await bcrypt.hash("Password123!", 10);

  const user = new User({
    name: `Test User ${index}`,
    username,
    email,
    mobile,
    password,
    role: "user",
  });

  await user.save();
  return user;
}

async function getAvailableUsers(requiredCount, excludeIds = []) {
  const users = await User.find({
    _id: { $nin: excludeIds },
    role: { $ne: "superadmin" },
  })
    .limit(requiredCount)
    .lean();

  const existingCount = users.length;
  const result = [...users];

  for (let i = existingCount; i < requiredCount; i += 1) {
    const user = await createTestUser(i + 1);
    result.push(user);
  }

  return result;
}

async function run() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const game = await Game.findById(gameId).lean();
    if (!game) {
      throw new Error(`Game not found for id ${gameId}`);
    }

    const existingEntries = await GameEntry.find({ gameId }).lean();
    const existingCount = existingEntries.length;
    const currentNumbers = new Set(existingEntries.map((entry) => entry.assignedNumber));

    if (existingCount >= game.totalSlots) {
      console.log(`✅ Game is already full: ${existingCount}/${game.totalSlots}`);
      process.exit(0);
    }

    const fillCount = Math.min(targetCount, game.totalSlots) - existingCount;
    if (fillCount <= 0) {
      console.log(`✅ Nothing to add. Current entries: ${existingCount}/${game.totalSlots}`);
      process.exit(0);
    }

    console.log(`🎯 Filling game ${gameId} with ${fillCount} entries (${existingCount}/${game.totalSlots} present)`);

    const neededUsers = await getAvailableUsers(fillCount, existingEntries.map((entry) => entry.userId));
    const availableNumbers = Array.from({ length: game.totalSlots }, (_, i) => i).filter(
      (n) => !currentNumbers.has(n),
    );

    const newEntries = neededUsers.map((user, index) => ({
      gameId: new mongoose.Types.ObjectId(gameId),
      userId: new mongoose.Types.ObjectId(user._id),
      assignedNumber: availableNumbers[index],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await GameEntry.insertMany(newEntries);

    console.log(`✅ Added ${newEntries.length} entries to game ${gameId}`);
    console.log(`🧾 Final count: ${existingCount + newEntries.length}/${game.totalSlots}`);
    console.log("📌 Assigned numbers:");
    newEntries.forEach((entry) => console.log(` - userId=${entry.userId}, number=${entry.assignedNumber}`));

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to fill game entries:", error.message || error);
    process.exit(1);
  }
}

run();
