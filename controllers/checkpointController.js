const CheckpointService = require("../services/checkpointService");

class CheckpointController {
  /**
   * Get current running checkpoint
   * GET /checkpoints/current?gameId=xxx
   */
  static async getCurrent(req, res) {
    try {
      const { gameId } = req.query;

      const checkpoint = await CheckpointService.getCurrentCheckpoint({ gameId });

      if (!checkpoint) {
        return res.status(404).json({
          success: false,
          message: "No active checkpoint found",
        });
      }

      return res.json({
        success: true,
        data: checkpoint,
      });
    } catch (error) {
      console.error("getCurrent error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  /**
   * Get all active checkpoints
   * GET /checkpoints/active?gameId=xxx
   */
  static async getActive(req, res) {
    try {
      const { gameId } = req.query;

      const checkpoints = await CheckpointService.getActiveCheckpoints({ gameId });

      return res.json({
        success: true,
        data: checkpoints,
      });
    } catch (error) {
      console.error("getActive error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  /**
   * Get next checkpoint
   * GET /checkpoints/next?gameId=xxx
   */
  static async getNext(req, res) {
    try {
      const { gameId } = req.query;

      const checkpoint = await CheckpointService.getNextCheckpoint({ gameId });
      return res.json({
        success: true,
        data: checkpoint ?? [],
      });
    } catch (error) {
      console.error("getNext error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  /**
   * Get last completed checkpoint
   * GET /checkpoints/last-completed?gameId=xxx
   */
  static async getLastCompleted(req, res) {
    try {
      const { gameId } = req.query;

      const checkpoint = await CheckpointService.getLastCompletedCheckpoint({ gameId });

      if (!checkpoint) {
        return res.status(404).json({
          success: false,
          message: "No completed checkpoint found",
        });
      }

      return res.json({
        success: true,
        data: checkpoint,
      });
    } catch (error) {
      console.error("getLastCompleted error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  /**
   * Complete a checkpoint
   * POST /checkpoints/:id/complete
   */
  static async complete(req, res) {
    try {
      const { id } = req.params;

      const updated = await CheckpointService.completeCheckpoint(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Checkpoint not found",
        });
      }

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error("complete error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  /**
   * Get all checkpoints for a game
   * GET /checkpoints/game/:gameId
   */
  static async getGameCheckpoints(req, res) {
    try {
      const { gameId } = req.params;

      const checkpoints = await CheckpointService.getGameCheckpoints(gameId);

      return res.json({
        success: true,
        data: checkpoints,
      });
    } catch (error) {
      console.error("getGameCheckpoints error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
}

module.exports = CheckpointController;