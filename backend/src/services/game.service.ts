import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { createFeatureLogger } from "../../lib/logger";
import { Color, GameState, Match } from "../../../shared/types/match";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData
} from "../../../shared/types/socket-events";
import { PlayerService } from "./player.service";
import { PlayerProfile } from "../../../shared/types/player";

const logger = createFeatureLogger("game.service");

export class Game {
  private match: Match;
  private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private roomId: string;
  private redProfile: PlayerProfile;
  private blueProfile: PlayerProfile;

  constructor(
    io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    redPlayerSocketId: string,
    bluePlayerSocketId: string,
    redPlayerUsername: string,
    bluePlayerUsername: string
  ) {
    this.io = io;
    this.roomId = `game-${uuidv4()}`;

    const playerService = PlayerService.getInstance();
    const redProfile = playerService.getOrCreateProfile(redPlayerUsername);
    this.redProfile = redProfile;

    const blueProfile = playerService.getOrCreateProfile(bluePlayerUsername);
    this.blueProfile = blueProfile;

    this.match = {
      id: uuidv4(),
      red_player: redPlayerSocketId, // Keep socket IDs for game operations
      blue_player: bluePlayerSocketId,
      game_state: this.createInitialGameState()
    };
    logger.info("Game created", {
      gameId: this.match.id,
      roomId: this.roomId,
      redPlayerUsername,
      bluePlayerUsername
    });
  }

  public async startGame(): Promise<void> {
    const redSocket = this.io.sockets.sockets.get(this.match.red_player);
    const blueSocket = this.io.sockets.sockets.get(this.match.blue_player);
    if (!redSocket || !blueSocket) {
      logger.warn("One or both players are disconnected at the start of the game", {
        red: !!redSocket,
        blue: !!blueSocket,
        gameId: this.match.id
      });
      return;
    }
    await redSocket.join(this.roomId);
    await blueSocket.join(this.roomId);
    logger.info("Players joined room", { gameId: this.match.id, roomId: this.roomId });
    redSocket.emit("match_found", "red");
    blueSocket.emit("match_found", "blue");
    this.io.to(this.roomId).emit("game_update", this.match.game_state);
    logger.info("Partie démarrée", { gameId: this.match.id, roomId: this.roomId });
  }

  public placePiece(socketId: string, column: number): boolean {
    const color = this.getPlayerColor(socketId);
    if (!color) {
      logger.warn("Tentative de coup par un joueur non reconnu", { socketId });
      return false;
    }
    if (this.match.game_state.turn !== color) {
      logger.warn("Ce n'est pas le tour du joueur", { socketId, color });
      return false;
    }
    if (column < 0 || column > 6) {
      logger.warn("Colonne invalide", { column });
      return false;
    }
    // Trouver la première ligne vide en partant du bas
    const board = this.match.game_state.board;
    let placedRow = -1;
    for (let row = 5; row >= 0; row--) {
      if (board[row][column] === null) {
        board[row][column] = color;
        placedRow = row;
        break;
      }
    }
    if (placedRow === -1) {
      logger.warn("Colonne pleine", { column });
      return false;
    }
    // Vérifier la victoire
    const winner = this.checkWinCondition(placedRow, column, color);
    if (winner) {
      this.io.to(this.roomId).emit("game_update", this.match.game_state);
      this.endGame(winner);
      logger.info("Victoire détectée", { winner, gameId: this.match.id });
      return true;
    }
    // Changer de tour
    this.match.game_state.turn = color === "red" ? "blue" : "red";
    this.io.to(this.roomId).emit("game_update", this.match.game_state);
    logger.info("Coup joué", { socketId, color, column, row: placedRow, gameId: this.match.id });
    return true;
  }

  private createInitialGameState(): GameState {
    // Crée un plateau 6x7 rempli de null, le tour commence à 'red'
    return {
      turn: "red",
      board: Array.from({ length: 6 }, () => Array(7).fill(null))
    };
  }

  private getPlayerColor(socketId: string): Color | null {
    if (socketId === this.match.red_player) return "red";
    if (socketId === this.match.blue_player) return "blue";
    return null;
  }

  private checkWinCondition(row: number, col: number, color: Color): Color | null {
    const board = this.match.game_state.board;
    if (
      this.checkDirection(board, row, col, 0, 1, color) || // Horizontal
      this.checkDirection(board, row, col, 1, 0, color) || // Vertical
      this.checkDirection(board, row, col, 1, 1, color) || // Diagonale \
      this.checkDirection(board, row, col, 1, -1, color) // Diagonale /
    ) {
      return color;
    }
    return null;
  }

  private checkDirection(
    board: (Color | null)[][],
    row: number,
    col: number,
    deltaRow: number,
    deltaCol: number,
    color: Color
  ): boolean {
    let count = 1;
    // Sens positif
    let r = row + deltaRow;
    let c = col + deltaCol;
    while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === color) {
      count++;
      r += deltaRow;
      c += deltaCol;
    }
    // Sens négatif
    r = row - deltaRow;
    c = col - deltaCol;
    while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === color) {
      count++;
      r -= deltaRow;
      c -= deltaCol;
    }
    return count >= 4;
  }

  private endGame(winner: Color): void {
    this.io.to(this.roomId).emit("game_end", winner);
    logger.info("Fin de partie", { winner, gameId: this.match.id });

    this.updateElo(winner);
    this.cleanup();
  }

  private updateElo(winner: Color): void {
    const playerService = PlayerService.getInstance();
    const K = 32;
    const [winnerProfile, loserProfile] =
      winner === "red" ? [this.redProfile, this.blueProfile] : [this.blueProfile, this.redProfile];

    const expectedWin = 1 / (1 + Math.pow(10, (loserProfile.elo - winnerProfile.elo) / 400));
    const expectedLose = 1 / (1 + Math.pow(10, (winnerProfile.elo - loserProfile.elo) / 400));

    const newWinnerElo = Math.round(winnerProfile.elo + K * (1 - expectedWin));
    const newLoserElo = Math.round(loserProfile.elo + K * (0 - expectedLose));

    playerService.updateElo(winnerProfile.username, newWinnerElo);
    playerService.updateElo(loserProfile.username, newLoserElo);

    // Update the cached profiles
    this.redProfile.elo = winner === "red" ? newWinnerElo : newLoserElo;
    this.blueProfile.elo = winner === "blue" ? newWinnerElo : newLoserElo;

    const redSocket = this.io.sockets.sockets.get(this.match.red_player);
    const blueSocket = this.io.sockets.sockets.get(this.match.blue_player);

    // Send correct profile to each player
    if (redSocket) redSocket.emit("profile", this.redProfile);
    if (blueSocket) blueSocket.emit("profile", this.blueProfile);

    logger.info("Elo updated", {
      winner: winnerProfile.username,
      newWinnerElo,
      loser: loserProfile.username,
      newLoserElo
    });
  }

  private async cleanup(): Promise<void> {
    const redSocket = this.io.sockets.sockets.get(this.match.red_player);
    const blueSocket = this.io.sockets.sockets.get(this.match.blue_player);
    if (redSocket) await redSocket.leave(this.roomId);
    if (blueSocket) await blueSocket.leave(this.roomId);
    logger.info("Nettoyage de la room terminé", { gameId: this.match.id, roomId: this.roomId });
    // Suppression du jeu dans MatchmakingHandler (import dynamique pour éviter les cycles)
    try {
      const module = await import("../socket/handlers/matchmaking.handler");
      if (module && module.MatchmakingHandler) {
        module.MatchmakingHandler.cleanupGame?.(this.match.id);
      }
    } catch (e) {
      logger.error("Erreur lors du nettoyage du jeu dans MatchmakingHandler", { error: e });
    }
  }

  public getGameId(): string {
    return this.match.id;
  }

  public getRoomId(): string {
    return this.roomId;
  }

  public getGameState(): GameState {
    return this.match.game_state;
  }

  public hasPlayer(socketId: string): boolean {
    return socketId === this.match.red_player || socketId === this.match.blue_player;
  }
}
