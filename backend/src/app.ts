import express from "express";
import { createServer } from "http";
import cors from "cors";
import { createFeatureLogger } from "../lib/logger";
import { SERVER_CONFIG } from "./config/server";
import { SocketService } from "./socket/socket.service";
import { statusRoutes } from "./routes/status.routes";
import { matchmakingRoutes } from "./routes/matchmaking.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { SocketInfoController } from "./controllers/socket-info.controller";

const logger = createFeatureLogger("app");

export class App {
  private app: express.Application;
  private server: ReturnType<typeof createServer>;
  private socketService: SocketService;
  private socketInfoController: SocketInfoController;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.socketService = new SocketService(this.server, SERVER_CONFIG.cors.origin);
    this.socketInfoController = new SocketInfoController(this.socketService);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(cors(SERVER_CONFIG.cors));

    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    this.app.use((req, res, next) => {
      logger.info("HTTP Request", {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get("User-Agent")
      });
      next();
    });
  }

  private setupRoutes(): void {
    this.app.use("/api/status", statusRoutes);
    this.app.use("/api/matchmaking", matchmakingRoutes);
    this.app.get("/api/socket/info", this.socketInfoController.getSocketInfo);
  }

  private setupErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public start(): void {
    this.server.listen(SERVER_CONFIG.port, () => {
      logger.info("Server started", {
        port: SERVER_CONFIG.port,
        environment: SERVER_CONFIG.env,
        cors: SERVER_CONFIG.cors.origin
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getServer(): ReturnType<typeof createServer> {
    return this.server;
  }

  public getSocketService(): SocketService {
    return this.socketService;
  }
}
