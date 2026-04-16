// scripts/createSuperAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/userdb";

mongoose
  .connect(MONGO_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function createSuperAdmin() {
  try {
    const email = "superadmin@example.com"; // change email
    const mobile = "9999999999"; // optional mobile
    const password = "SuperAdmin@123"; // change password
    const name = "Super Admin";
    const username = "superadmin";

    // Check if superadmin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Superadmin already exists!");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create superadmin
    const superadmin = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      role: "superadmin",
      username,
    });

    await superadmin.save();
    console.log("Superadmin created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating superadmin:", error);
    process.exit(1);
  }
}

createSuperAdmin();
