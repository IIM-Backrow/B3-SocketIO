import { PlayerProfile } from "../../../shared/types/player";

export class PlayerService {
  private static instance: PlayerService;
  private profiles = new Map<string, PlayerProfile>();
  private socketIdToUsername = new Map<string, string>();

  private constructor() {}

  public static getInstance(): PlayerService {
    if (!PlayerService.instance) PlayerService.instance = new PlayerService();
    return PlayerService.instance;
  }

  public getOrCreateProfile(username: string, socketId: string): PlayerProfile {
    let profile = this.profiles.get(username);
    if (!profile) {
      profile = { id: username, username, elo: 1000 };
      this.profiles.set(username, profile);
      this.socketIdToUsername.set(socketId, username);
    }
    return profile;
  }

  public getProfileByUsername(username: string): PlayerProfile | undefined {
    return this.profiles.get(username);
  }
  public getProfileBySocket(socketId: string): PlayerProfile | undefined {
    return Array.from(this.profiles.values()).find((profile) => profile.id === socketId);
  }
  public updateElo(username: string, newElo: number): void {
    const profile = this.profiles.get(username);
    if (profile) {
      profile.elo = newElo;
      this.profiles.set(username, profile);
    }
  }
}
