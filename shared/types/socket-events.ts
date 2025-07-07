export interface ServerToClientEvents {
  pong: (timestamp: number) => void;
}

export interface ClientToServerEvents {
  ping: (timestamp: number) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {}
