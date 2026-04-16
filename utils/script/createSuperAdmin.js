const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");

const ensureSuperAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || "superadmin@example.com";
    const mobile = process.env.ADMIN_MOBILE || "9999999999";
    const username = process.env.ADMIN_USERNAME || "superadmin";

    const existing = await User.findOne({
      $or: [{ email }, { mobile }, { username }],
    });

    if (existing) {
      console.log("👑 Superadmin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "SuperAdmin@123",
      10,
    );

    const superadmin = new User({
      name: "Super Admin",
      email,
      mobile,
      username,
      password: hashedPassword,
      role: "superadmin",
    });

    await superadmin.save();

    console.log("🔥 Superadmin created successfully!");
  } catch (error) {
    console.error("❌ Error creating superadmin:", error);
  }
};

module.exports = ensureSuperAdmin;
