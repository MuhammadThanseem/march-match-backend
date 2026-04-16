const User = require("../models/User");
const bcrypt = require("bcryptjs");

class UserService {
  // Create new user
  async createUser(data) {
    // hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new User({ ...data, password: hashedPassword });
    return user.save();
  }

  // Find user by email or mobile
  async findByLogin(identifier) {
    return User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }],
    });
  }

  // Verify password
  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  }
  async getUserStats(userId) {
    // 1️⃣ Total Entries
    const totalEntries = await GameEntry.countDocuments({ userId });

    // 2️⃣ Get all winning checkpoints for this user
    const wins = await Checkpoint.find({ status: "completed" }).populate({
      path: "winningEntryId",
      match: { userId: userId },
    });

    // filter only checkpoints where user actually won
    const userWins = wins.filter((c) => c.winningEntryId !== null);

    // 3️⃣ Total games won
    const totalWins = userWins.length;

    // 4️⃣ Total earnings
    const totalEarnings = userWins.reduce(
      (sum, c) => sum + (c.rewardAmount || 0),
      0,
    );

    // 5️⃣ Highest win
    const highestWin =
      userWins.length > 0
        ? Math.max(...userWins.map((c) => c.rewardAmount || 0))
        : 0;

    return {
      totalEntries,
      totalWins,
      totalEarnings,
      highestWin,
    };
  }
  // Update user
  async updateUser(userId, updateData) {
    // If password is being updated → hash it
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password"); // hide password

    return updatedUser;
  }
}

module.exports = new UserService();
