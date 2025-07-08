import { Color, GameState } from "./match";
import { PlayerProfile } from "./player";
export interface ServerToClientEvents {
  pong: (timestamp: number) => void;

  // Matchmaking events
  match_found: (as: Color) => void;

  // Game events
  game_update: (game_state: GameState) => void;
  game_end: (winner: Color) => void;


  profile: (profile: PlayerProfile) => void;
}

export interface ClientToServerEvents {
  ping: (timestamp: number) => void;

  // Matchmaking events
  join_queue: () => void;
  leave_queue: () => void;

  // Game events
  place_piece: (column: number) => void;

  login: (username: string) => void;

}

export interface InterServerEvents {}

export interface SocketData {}
