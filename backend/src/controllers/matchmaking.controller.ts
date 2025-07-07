import { Request, Response } from "express";
import { createFeatureLogger } from "../../lib/logger";
import { withErrorHandling } from "../utils/error-handler.util";
import { MatchmakingHandler } from "../socket/handlers/matchmaking.handler";

const logger = createFeatureLogger("matchmaking.controller");

export class MatchmakingController {
  public static getMatchmakingStats = withErrorHandling(logger, (req: Request, res: Response): void => {
    logger.info("Matchmaking stats requested", {
      ip: req.ip,
      userAgent: req.get("User-Agent")
    });

    res.status(200).json({
      status: "success",
      data: {
        queueSize: MatchmakingHandler.getQueueSize(),
        activeGames: MatchmakingHandler.getActiveGamesCount(),
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  });
}
