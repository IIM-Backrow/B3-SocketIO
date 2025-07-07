import { createFeatureLogger } from "../../lib/logger";

const logger = createFeatureLogger("queue.service");

interface QueuedPlayer {
  socketId: string;
  joinedAt: number;
}

export class QueueService {
  private static instance: QueueService;
  private queue: QueuedPlayer[] = [];

  private constructor() {}

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  public addPlayer(socketId: string): void {
    const existingPlayer = this.queue.find((player) => player.socketId === socketId);
    if (existingPlayer) {
      logger.warn("Player already in queue", { socketId });
      return;
    }

    const player: QueuedPlayer = {
      socketId,
      joinedAt: Date.now()
    };

    this.queue.push(player);
    logger.info("Player added to queue", {
      socketId,
      queueSize: this.queue.length
    });
  }

  public removePlayer(socketId: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter((player) => player.socketId !== socketId);

    const removed = this.queue.length < initialLength;
    if (removed) {
      logger.info("Player removed from queue", {
        socketId,
        queueSize: this.queue.length
      });
    }

    return removed;
  }

  public getMatchedPlayers(): [string, string] | null {
    if (this.queue.length >= 2) {
      const player1 = this.queue.shift()!;
      const player2 = this.queue.shift()!;

      logger.info("Match found", {
        player1: player1.socketId,
        player2: player2.socketId,
        remainingQueueSize: this.queue.length
      });

      return [player1.socketId, player2.socketId];
    }

    return null;
  }

  public getQueueSize(): number {
    return this.queue.length;
  }

  public isPlayerInQueue(socketId: string): boolean {
    return this.queue.some((player) => player.socketId === socketId);
  }
}
