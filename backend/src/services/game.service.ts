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

const logger = createFeatureLogger("game.service");

export class Game {
  private match: Match;
  private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private roomId: string;

  constructor(
    io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    redPlayer: string,
    bluePlayer: string
  ) {
    // TODO(Quentin): Initialize the game instance with players and create initial game state
    // Should create match ID, room ID, and set up the initial empty board
    // Log game creation with relevant information
    this.io = io;
    this.roomId = `game-${uuidv4()}`;

    this.match = {
      id: uuidv4(),
      red_player: redPlayer,
      blue_player: bluePlayer,
      game_state: this.createInitialGameState()
    };
  }

  public async startGame(): Promise<void> {
    // TODO(Quentin): Start the game by adding players to socket room
    // - Get socket instances for both players
    // - Add them to the game room
    // - Emit "match_found" event to each player with their color
    // - Send initial game state with "game_update" event
    // - Handle cases where players might have disconnected before game start
    // - Log game start success/failure
  }

  public placePiece(_socketId: string, _column: number): boolean {
    // TODO(Quentin): Handle piece placement logic
    // - Verify it's the player's turn by checking socketId against current turn
    // - Validate column is within bounds (0-6)
    // - Find the lowest empty row in the specified column
    // - Place the piece on the board
    // - Switch turns to the other player
    // - Check for win condition after placing piece
    // - Emit "game_update" event with new board state
    // - If there's a winner, call endGame()
    // - Return true if piece was placed successfully, false otherwise
    // - Log all move attempts and results
    return false;
  }

  private createInitialGameState(): GameState {
    // TODO(Quentin): Create initial Connect Four game state
    // - Create 6x7 board filled with null values
    // - Set turn to "red" (red always starts)
    // - Return the initial GameState object
    return {
      turn: "red",
      board: []
    };
  }

  private getPlayerColor(_socketId: string): Color | null {
    // TODO(Quentin): Determine player color based on socket ID
    // - Return "red" if socketId matches red_player
    // - Return "blue" if socketId matches blue_player
    // - Return null if socketId doesn't match any player
    return null;
  }

  private checkWinCondition(_row: number, _col: number, _color: Color): Color | null {
    // TODO(Quentin): Check if the last placed piece creates a winning condition
    // - Check horizontal line (left and right from placed piece)
    // - Check vertical line (up and down from placed piece)
    // - Check diagonal / line (up-right and down-left from placed piece)
    // - Check diagonal \ line (up-left and down-right from placed piece)
    // - Return the winning color if 4 in a row found, null otherwise
    // - Use checkDirection helper method for each direction
    return null;
  }

  private checkDirection(
    _board: (Color | null)[][],
    _row: number,
    _col: number,
    _deltaRow: number,
    _deltaCol: number,
    _color: Color
  ): boolean {
    // TODO(Quentin): Check for 4 consecutive pieces in a specific direction
    // - Start with count of 1 (the placed piece)
    // - Check in positive direction (deltaRow, deltaCol) until different color/boundary
    // - Check in negative direction (-deltaRow, -deltaCol) until different color/boundary
    // - Return true if total count >= 4, false otherwise
    return false;
  }

  private endGame(_winner: Color): void {
    // TODO(Quentin): Handle game end logic
    // - Emit "game_end" event to both players with winner color
    // - Log game end with winner and game details
    // - Call cleanup() to remove players from room and clean up resources
  }

  private cleanup(): void {
    // TODO(Quentin): Clean up game resources
    // - Remove all players from the game room
    // - Log cleanup completion
    // - Notify MatchmakingHandler to remove this game from active games tracking
    // - Use dynamic import to avoid circular dependency with MatchmakingHandler
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

  public hasPlayer(_socketId: string): boolean {
    // TODO(Quentin): Check if socketId belongs to one of the players in this game
    // - Return true if socketId matches red_player or blue_player
    // - Return false otherwise
    return false;
  }
}
