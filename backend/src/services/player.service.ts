import { PlayerProfile } from "../../../shared/types/player";

export class PlayerService {
  private static instance: PlayerService;
  private profiles = new Map<string, PlayerProfile>();

  private constructor() {}

  public static getInstance(): PlayerService {
    if (!PlayerService.instance) PlayerService.instance = new PlayerService();
    return PlayerService.instance;
  }

  public getOrCreateProfile(username: string): PlayerProfile {
    let profile = this.profiles.get(username);

    if (!profile) {
      profile = { username, elo: 1000 };
      this.profiles.set(username, profile);
    }

    return profile;
  }

  public updateElo(username: string, newElo: number): void {
    const profile = this.getOrCreateProfile(username);

    profile.elo = newElo;
    this.profiles.set(username, profile);
  }
}
