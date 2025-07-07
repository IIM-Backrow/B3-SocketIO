import { Socket } from "socket.io";
import { createFeatureLogger } from "../../../lib/logger";
import { withSocketErrorHandling } from "../../utils/socket-error-handler.util";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
} from "../../../../shared/types/socket-events";

const logger = createFeatureLogger("ping.handler");

type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export class PingHandler {
  public static handlePing(socket: SocketType): void {
    socket.on(
      "ping",
      withSocketErrorHandling<[number]>(logger, "ping", socket, (timestamp: number) => {
        logger.info("Received ping from client", {
          socketId: socket.id,
          timestamp
        });

        socket.emit("pong", Date.now());

        logger.info("Sent pong to client", {
          socketId: socket.id,
          responseTime: Date.now() - timestamp
        });
      })
    );
  }
}
