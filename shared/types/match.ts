export type Color = "red" | "blue";

export interface GameState {
  turn: Color;
  board: (Color | null)[][];
}

export interface Match {
  id: string;

  // Players
  red_player: string;
  blue_player: string;

  // Game state
  game_state: GameState;
}
