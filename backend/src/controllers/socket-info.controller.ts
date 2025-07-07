import { Request, Response } from "express";
import { createFeatureLogger } from "../../lib/logger";
import { withErrorHandling } from "../utils/error-handler.util";
import { SocketService } from "../socket/socket.service";

const logger = createFeatureLogger("socket-info.controller");

export class SocketInfoController {
  constructor(private socketService: SocketService) {}

  public getSocketInfo = withErrorHandling(logger, (req: Request, res: Response): void => {
    logger.info("Socket info endpoint accessed", {
      ip: req.ip,
      userAgent: req.get("User-Agent")
    });

    const io = this.socketService.getIO();
    res.json({
      connected_clients: io.engine.clientsCount,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });
}
