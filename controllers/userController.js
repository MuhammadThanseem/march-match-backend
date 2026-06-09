const userService = require("../services/userService");
const jwt = require("jsonwebtoken");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const buildCsv = (rows, headers) => {
  const headerLine = headers.map((header) => header.label).join(",");
  const lines = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header.key] ?? "";
        const stringValue = typeof value === "string" ? value : String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      })
      .join(","),
  );
  return [headerLine, ...lines].join("\n");
};

class UserController {
  // Register
  async register(req, res) {
    try {
      const { name, email, mobile, password, username } = req.body;

      if (!password || (!email && !mobile)) {
        return res
          .status(400)
          .json({ message: "Email or mobile and password required" });
      }

      const existingUser = await userService.findByLogin(email || mobile);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // 1️⃣ Create user
      const user = await userService.createUser({
        name,
        email,
        mobile,
        password,
        username,
      });

      // 2️⃣ Create wallet with default 500 balance
      await Wallet.create({ user: user._id, balance: 500 });

      res
        .status(201)
        .json({ status: 201, message: "User created successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 500, message: "Server error" });
    }
  }
  // Login
  async login(req, res) {
    try {
      const { identifier, password } = req.body; // identifier can be email or mobile

      if (!identifier || !password) {
        return res
          .status(400)
          .json({ message: "Identifier and password required" });
      }

      const user = await userService.findByLogin(identifier);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validPassword = await userService.verifyPassword(user, password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role }, // payload
        process.env.JWT_SECRET, // secret key from .env
        { expiresIn: "1d" }, // token expiry
      );

      res.status(200).json({ message: "Login successful", user, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
  // Update user profile
  async updateUser(req, res) {
    try {
      const userId = req.params.id; // OR req.user.id (if using auth middleware)
      const updateData = req.body;

      const updatedUser = await userService.updateUser(userId, updateData);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Update User Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  async getUserStats(req, res) {
    try {
      // 🔐 assuming userId comes from auth middleware
      const userId = req.user?.id || req.params.userId;

      if (!userId) {
        return res.status(400).json({
          message: "User ID is required",
        });
      }

      const stats = await userService.getUserStats(userId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get User Stats Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch user stats",
      });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .select("-password")
        .lean();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const wallet = await Wallet.findOne({ user: user._id })
        .select("balance")
        .lean();

      return res.status(200).json({
        success: true,
        data: {
          ...user,
          balance: wallet?.balance || 0,
        },
      });
    } catch (error) {
      console.error("Get User By ID Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch user",
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await User.find().select("-password").lean();
      const wallets = await Wallet.find({
        user: { $in: users.map((u) => u._id) },
      }).lean();
      const walletByUser = new Map(
        wallets.map((wallet) => [wallet.user.toString(), wallet]),
      );

      const data = users.map((user) => ({
        ...user,
        balance: walletByUser.get(user._id.toString())?.balance || 0,
      }));

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Get All Users Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch users" });
    }
  }

  async exportUsersWithTransactions(req, res) {
    try {
      const users = await User.find().select("-password").lean();
      const userIds = users.map((user) => user._id);

      const wallets = await Wallet.find({ user: { $in: userIds } }).lean();
      const walletByUser = new Map(
        wallets.map((wallet) => [wallet.user.toString(), wallet]),
      );

      const transactions = await Transaction.find({ user: { $in: userIds } })
        .sort({ user: 1, createdAt: -1 })
        .lean();

      const transactionsByUser = new Map();
      transactions.forEach((tx) => {
        const userId = tx.user.toString();
        if (!transactionsByUser.has(userId)) {
          transactionsByUser.set(userId, []);
        }
        transactionsByUser.get(userId).push(tx);
      });

      const headers = [
        { label: "User ID", key: "userId" },
        { label: "Name", key: "name" },
        { label: "Email", key: "email" },
        { label: "Mobile", key: "mobile" },
        { label: "Username", key: "username" },
        { label: "Role", key: "role" },
        { label: "Balance", key: "balance" },
        { label: "User Created At", key: "createdAt" },
        { label: "Transaction ID", key: "transactionId" },
        { label: "Transaction Type", key: "transactionType" },
        { label: "Transaction Title", key: "transactionTitle" },
        { label: "Transaction Subtitle", key: "transactionSubtitle" },
        { label: "Transaction Amount", key: "transactionAmount" },
        { label: "Transaction Status", key: "transactionStatus" },
        { label: "Transaction Date", key: "transactionDate" },
      ];

      const rows = [];
      users.forEach((user) => {
        const baseRow = {
          userId: user._id.toString(),
          name: user.name || "",
          email: user.email || "",
          mobile: user.mobile || "",
          username: user.username || "",
          role: user.role || "",
          balance: walletByUser.get(user._id.toString())?.balance || 0,
          createdAt: user.createdAt
            ? new Date(user.createdAt).toISOString()
            : "",
        };

        const userTxs = transactionsByUser.get(user._id.toString()) || [];
        if (userTxs.length === 0) {
          rows.push({
            ...baseRow,
            transactionId: "",
            transactionType: "",
            transactionTitle: "",
            transactionSubtitle: "",
            transactionAmount: "",
            transactionStatus: "",
            transactionDate: "",
          });
        } else {
          userTxs.forEach((tx) => {
            rows.push({
              ...baseRow,
              transactionId: tx._id.toString(),
              transactionType: tx.type || "",
              transactionTitle: tx.title || "",
              transactionSubtitle: tx.subtitle || "",
              transactionAmount: tx.amount || 0,
              transactionStatus: tx.status || "",
              transactionDate: tx.createdAt
                ? new Date(tx.createdAt).toISOString()
                : "",
            });
          });
        }
      });

      const csv = buildCsv(rows, headers);
      res.setHeader("Content-Type", "text/csv;charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=users-transactions-report.csv",
      );
      return res.send(csv);
    } catch (error) {
      console.error("Export Users With Transactions Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to export users" });
    }
  }
}

module.exports = new UserController();
