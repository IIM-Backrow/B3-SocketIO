import { PlayerService } from "@/services/player.service";
import { Socket } from "socket.io";

export class UserHandler {
  public static handleLogin(socket: Socket): void {
    socket.on("login", (username: string) => {
      const playerService = PlayerService.getInstance();
      const profile = playerService.getOrCreateProfile(username);

      // Store username in socket data for future reference
      socket.data.username = username;

      socket.emit("profile", profile);
    });
  }
}
