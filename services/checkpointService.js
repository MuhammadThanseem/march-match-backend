const Checkpoint = require("../models/CheckPoint");

class CheckpointService {
  /**
   * Get current running checkpoint
   * startTime <= now <= endTime
   */
  static async getCurrentCheckpoint({ gameId = null } = {}) {
    const now = new Date();

    const query = {
      startTime: { $lte: now },
      endTime: { $gte: now },
      status: "pending",
    };

    if (gameId) {
      query.gameId = gameId;
    }

    return await Checkpoint.findOne(query)
      .sort({ sequence: 1 })
      .lean();
  }

  /**
   * Get all active checkpoints (in case you allow multiple)
   */
  static async getActiveCheckpoints({ gameId = null } = {}) {
    const now = new Date();

    const query = {
      startTime: { $lte: now },
      endTime: { $gte: now },
    };

    if (gameId) {
      query.gameId = gameId;
    }

    return await Checkpoint.find(query)
      .sort({ sequence: 1 })
      .lean();
  }

  /**
   * Get next upcoming checkpoint
   */
  static async getNextCheckpoint({ gameId = null } = {}) {
    const now = new Date();

    const query = {
      startTime: { $gt: now },
      status: "pending",
    };

    if (gameId) {
      query.gameId = gameId;
    }

    return await Checkpoint.findOne(query)
      .sort({ startTime: 1 })
      .lean();
  }

  /**
   * Get last completed checkpoint
   */
  static async getLastCompletedCheckpoint({ gameId = null } = {}) {
    const query = {
      status: "completed",
    };

    if (gameId) {
      query.gameId = gameId;
    }

    return await Checkpoint.findOne(query)
      .sort({ endTime: -1 })
      .lean();
  }

  /**
   * Mark checkpoint as completed
   */
  static async completeCheckpoint(checkpointId, data = {}) {
    return await Checkpoint.findByIdAndUpdate(
      checkpointId,
      {
        status: "completed",
        ...data, // winningNumber, winningEntryId, etc.
      },
      { new: true }
    );
  }

  /**
   * Get checkpoints timeline for a game
   */
  static async getGameCheckpoints(gameId) {
    return await Checkpoint.find({ gameId })
      .sort({ sequence: 1 })
      .lean();
  }
}

module.exports = CheckpointService;