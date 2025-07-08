import { PlayerProfile } from "../../../shared/types/player";

export class PlayerService {
  private static instance: PlayerService;
  private profiles = new Map<string, PlayerProfile>();

  private constructor() {}

  public static getInstance(): PlayerService {
    if (!PlayerService.instance) PlayerService.instance = new PlayerService();
    return PlayerService.instance;
  }

  public getOrCreateProfile(username: string, socketId: string): PlayerProfile {
    // Cherche un profil existant par username
    let profile = Array.from(this.profiles.values()).find(p => p.username === username);
    if (!profile) {
      profile = { id: socketId, username, elo: 1000 };
      this.profiles.set(socketId, profile);
    } else {
        // Met à jour le socketId si besoin
      this.profiles.set(socketId, { ...profile, id: socketId });
    }
    return profile;
  }

  public getProfileBySocket(socketId: string): PlayerProfile | undefined {
    return this.profiles.get(socketId);
  }
    public updateElo(socketId: string, newElo: number): void {
    const profile = this.profiles.get(socketId);
    if (profile) {
      profile.elo = newElo;
      this.profiles.set(socketId, profile);
    }
  }
}