import { Socket } from "socket.io";
import { Logger } from "winston";

export const withSocketErrorHandling = <T extends unknown[]>(
  logger: Logger,
  eventName: string,
  socket: Socket,
  handler: (...args: T) => void | Promise<void>
) => {
  return async (...args: T): Promise<void> => {
    try {
      await handler(...args);
    } catch (error) {
      logger.error(`Error in socket event handler: ${eventName}`, {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        socketId: socket.id,
        eventName,
        remoteAddress: socket.handshake.address
      });
    }
  };
};
