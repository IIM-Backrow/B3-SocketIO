import { Request, Response } from "express";
import { createFeatureLogger } from "../../lib/logger";
import { withErrorHandling } from "../utils/error-handler.util";

const logger = createFeatureLogger("status.controller");

export class StatusController {
  public static getStatus = withErrorHandling(logger, (req: Request, res: Response): void => {
    if (req.query.error) {
      throw new Error("Test error from status controller");
    }

    logger.info("Status endpoint accessed", {
      ip: req.ip,
      userAgent: req.get("User-Agent")
    });

    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development (by default)"
    });
  });
}
