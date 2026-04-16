const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/database");
const startGameScheduler = require("./utils/scheduler");

dotenv.config();

// Initialize Express App
const app = express();

// CORS Setup for credentials (cookies or auth headers)
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin, // must be explicit, not '*'
    credentials: true,     // allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parser
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Connect DB
connectDB();

// Start Game Scheduler
startGameScheduler();

// Routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/games", require("./routes/gameRoutes"));
app.use("/api/entries", require("./routes/entryRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/wallet", require("./routes/walletRoutes"));
app.use("/api/checkpoints", require("./routes/checkpointRoutes"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));