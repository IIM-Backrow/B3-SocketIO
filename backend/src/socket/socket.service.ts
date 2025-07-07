import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { createFeatureLogger } from "../../lib/logger";
import { PingHandler } from "./handlers/ping.handler";

const logger = createFeatureLogger("socket.service");

export class SocketService {
  private io: Server;

  constructor(httpServer: HttpServer, corsOrigin: string) {
    this.io = new Server(httpServer, {
      cors: {
        origin: corsOrigin,
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket) => {
      logger.info("Client connected", {
        socketId: socket.id,
        remoteAddress: socket.handshake.address
      });

      // Register all event handlers
      PingHandler.handlePing(socket);

      // Handle disconnection
      socket.on("disconnect", (reason) => {
        logger.info("Client disconnected", {
          socketId: socket.id,
          reason
        });
      });
    });
  }

  public getIO(): Server {
    return this.io;
  }

  public emitToAll(event: string, data: unknown): void {
    this.io.emit(event, data);
  }

  public emitToRoom(room: string, event: string, data: unknown): void {
    this.io.to(room).emit(event, data);
  }
}
