const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/database");
const startGameScheduler = require("./utils/scheduler");

console.log("🔄 Loading environment variables...");
dotenv.config();

// Initialize Express App
console.log("🚀 Initializing Express app...");
const app = express();

// CORS Setup
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";
console.log("🌐 CORS allowed origin:", allowedOrigin);

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parser
console.log("📦 Setting up middlewares...");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (VERY USEFUL 🔥)
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Connect DB
console.log("🛢️ Connecting to database...");
connectDB();

// Start Game Scheduler
console.log("⏰ Starting game scheduler...");
startGameScheduler();

// Routes
console.log("🛣️ Registering routes...");

app.use("/api/user", require("./routes/userRoutes"));
console.log("✔️ /api/user loaded");

app.use("/api/games", require("./routes/gameRoutes"));
console.log("✔️ /api/games loaded");

app.use("/api/entries", require("./routes/entryRoutes"));
console.log("✔️ /api/entries loaded");

app.use("/api/history", require("./routes/historyRoutes"));
console.log("✔️ /api/history loaded");

app.use("/api/wallet", require("./routes/walletRoutes"));
console.log("✔️ /api/wallet loaded");

app.use("/api/checkpoints", require("./routes/checkpointRoutes"));
console.log("✔️ /api/checkpoints loaded");

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("=================================");
});