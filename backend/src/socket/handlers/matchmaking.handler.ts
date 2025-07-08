import { Socket } from "socket.io";
import { createFeatureLogger } from "../../../lib/logger";
import { withSocketErrorHandling } from "../../utils/socket-error-handler.util";
import { QueueService } from "../../services/queue.service";
import { Game } from "../../services/game.service";

const logger = createFeatureLogger("matchmaking.handler");

export class MatchmakingHandler {
  private static queueService = QueueService.getInstance();
  private static activeGames = new Map<string, Game>();

  public static handleJoinQueue(socket: Socket): void {
    socket.on(
      "join_queue",
      withSocketErrorHandling<[]>(logger, "join_queue", socket, () => {
        logger.info("Player requesting to join queue", {
          socketId: socket.id
        });

        // Add player to queue
        this.queueService.addPlayer(socket.id);

        // Check for potential match
        this.tryCreateMatch(socket);
      })
    );
  }

  public static handleLeaveQueue(socket: Socket): void {
    socket.on(
      "leave_queue",
      withSocketErrorHandling<[]>(logger, "leave_queue", socket, () => {
        logger.info("Player requesting to leave queue", {
          socketId: socket.id
        });

        const removed = this.queueService.removePlayer(socket.id);
        if (!removed) {
          logger.warn("Player not found in queue when trying to leave", {
            socketId: socket.id
          });
        }
      })
    );
  }

  public static handlePlacePiece(socket: Socket): void {
    socket.on(
      "place_piece",
      withSocketErrorHandling<[number]>(logger, "place_piece", socket, (column: number) => {
        logger.info("Player attempting to place piece", {
          socketId: socket.id,
          column
        });

        // Find the game this player is in
        const game = this.findPlayerGame(socket.id);
        if (!game) {
          logger.warn("Player not in any active game", {
            socketId: socket.id
          });
          return;
        }

        // Attempt to place the piece
        const success = game.placePiece(socket.id, column);
        if (!success) {
          logger.warn("Failed to place piece", {
            socketId: socket.id,
            column,
            gameId: game.getGameId()
          });
        }
      })
    );
  }

  public static handleDisconnect(socket: Socket): void {
    socket.on("disconnect", () => {
      logger.info("Player disconnected", {
        socketId: socket.id
      });

      // Remove from queue if they were in it
      this.queueService.removePlayer(socket.id);

      // Handle disconnect from active game
      const game = this.findPlayerGame(socket.id);
      if (game) {
        logger.warn("Player disconnected from active game", {
          socketId: socket.id,
          gameId: game.getGameId()
        });
        // You might want to implement game pause/forfeit logic here
        // For now, we'll leave the game running
      }
    });
  }

  private static tryCreateMatch(initiatingSocket: Socket): void {
    const matchedPlayers = this.queueService.getMatchedPlayers();

    if (matchedPlayers) {
      const [player1SocketId, player2SocketId] = matchedPlayers;

      // Get socket instances to access usernames
      const player1Socket = initiatingSocket.nsp.sockets.get(player1SocketId);
      const player2Socket = initiatingSocket.nsp.sockets.get(player2SocketId);

      if (!player1Socket || !player2Socket) {
        logger.error("Cannot find socket instances for matched players", {
          player1SocketId,
          player2SocketId
        });
        return;
      }

      // Get usernames from socket data
      const player1Username = player1Socket.data.username;
      const player2Username = player2Socket.data.username;

      if (!player1Username || !player2Username) {
        logger.error("Players not logged in - missing usernames", {
          player1SocketId,
          player2SocketId,
          player1Username,
          player2Username
        });
        return;
      }

      logger.info("Creating new game", {
        player1SocketId,
        player2SocketId,
        player1Username,
        player2Username
      });

      // Create new game instance using usernames but also store socket IDs
      const game = new Game(
        initiatingSocket.nsp.server,
        player1SocketId, // Still need socket ID for game operations
        player2SocketId,
        player1Username, // Pass usernames for ELO
        player2Username
      );

      // Store the game
      this.activeGames.set(game.getGameId(), game);

      // Start the game
      game.startGame();

      logger.info("Game started successfully", {
        gameId: game.getGameId(),
        roomId: game.getRoomId(),
        redPlayer: player1Username,
        bluePlayer: player2Username
      });
    }
  }

  private static findPlayerGame(socketId: string): Game | undefined {
    for (const game of this.activeGames.values()) {
      if (game.hasPlayer(socketId)) {
        return game;
      }
    }
    return undefined;
  }

  public static getActiveGamesCount(): number {
    return this.activeGames.size;
  }

  public static getQueueSize(): number {
    return this.queueService.getQueueSize();
  }

  // Clean up finished games
  public static cleanupGame(gameId: string): void {
    const deleted = this.activeGames.delete(gameId);
    if (deleted) {
      logger.info("Game cleaned up", { gameId });
    }
  }
}
