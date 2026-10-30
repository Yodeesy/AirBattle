import { UserProfile } from './types';

const STORAGE_KEY = 'airbattle_user_save';

export class SaveManager {
  private static instance: SaveManager;
  public profile: UserProfile;

  private constructor() {
    this.profile = this.createDefaultProfile('Pilot');
  }

  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  public createDefaultProfile(name: string): UserProfile {
    return {
      name: name || 'Pilot',
      amount: 500, // starting funds
      highScore: 0,
      fighters_owned: [
        true,  // 0: F0-B
        false, // 1: F1-J
        false, // 2: F2-S
        false, // 3: F3-V
        false, // 4: GW-01
        false, // 5: GW-02
        false, // 6: GW-01A
        false, // 7: GW-02A
        false, // 8: GS (Guts Shadow)
        false, // 9: GW-02 Texas
        false, // 10: GW-EX-J Beta
        false, // 11: GW-EX-J Combined
        false  // 12: GUTS Eagle
      ],
      levels_passed: [
        false, false, false, false, // L1..L4
        false, false, false, false  // L5..L8
      ],
      // Medals locked initially for player unlock testing
      medals: new Array(12).fill(false),
      language: 'zh',
      bgmVolume: 0.7,
      sfxVolume: 0.8,
      stats: {
        totalRolls: 0,
        muyuClicks: 0,
        flankSquadronsKilled: 0
      }
    };
  }

  public async load(): Promise<UserProfile> {
    // 1. Try Desktop Electron IPC
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        const data = await (window as any).electronAPI.loadProfile();
        if (data && data.name) {
          this.profile = data;
          if (!this.profile.fighters_owned || this.profile.fighters_owned.length < 13) {
            const current = this.profile.fighters_owned || [];
            while (current.length < 13) current.push(false);
            this.profile.fighters_owned = current;
          }
          if (!this.profile.medals || this.profile.medals.length < 12) {
            this.profile.medals = new Array(12).fill(false);
          }
          if (!this.profile.stats) {
            this.profile.stats = { totalRolls: 0, muyuClicks: 0, flankSquadronsKilled: 0 };
          }
          return this.profile;
        }
      } catch (e) {
        console.warn('Electron save load fallback to localStorage', e);
      }
    }

    // 2. Browser LocalStorage Fallback
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.profile = JSON.parse(raw);
        if (!this.profile.fighters_owned || this.profile.fighters_owned.length < 13) {
          const current = this.profile.fighters_owned || [];
          while (current.length < 13) current.push(false);
          this.profile.fighters_owned = current;
        }
        if (!this.profile.medals || this.profile.medals.length < 12) {
          this.profile.medals = new Array(12).fill(false);
        }
        if (!this.profile.stats) {
          this.profile.stats = { totalRolls: 0, muyuClicks: 0, flankSquadronsKilled: 0 };
        }
      }
    } catch (e) {
      console.warn('LocalStorage load failed, using default', e);
    }

    return this.profile;
  }

  public async getSaveFilePath(): Promise<string> {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.getSavePath) {
      try {
        return await (window as any).electronAPI.getSavePath();
      } catch (e) {
        // fallback
      }
    }
    return 'Browser LocalStorage [key: airbattle_user_save]';
  }

  public async save(): Promise<void> {
    // 1. Try Desktop Electron IPC
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        await (window as any).electronAPI.saveProfile(this.profile);
      } catch (e) {
        console.warn('Electron save write failed', e);
      }
    }

    // 2. Always sync to LocalStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  public addFunds(amount: number) {
    this.profile.amount = Math.max(0, this.profile.amount + amount);
    this.save();
  }

  public unlockFighter(id: number) {
    if (id >= 0 && id < this.profile.fighters_owned.length) {
      this.profile.fighters_owned[id] = true;
      this.save();
    }
  }

  public passLevel(levelIndex: number) {
    if (levelIndex >= 0 && levelIndex < this.profile.levels_passed.length) {
      this.profile.levels_passed[levelIndex] = true;
      // If Stage 4 (index 3) is passed, unlock GUTS Wings for Easter Egg
      if (levelIndex === 3) {
        this.unlockFighter(4); // GW-01
        this.unlockFighter(5); // GW-02
      }
      this.save();
    }
  }

  public unlockMedal(medalIndex: number): boolean {
    if (!this.profile.medals) {
      this.profile.medals = new Array(12).fill(false);
    }
    if (medalIndex >= 0 && medalIndex < 12) {
      if (!this.profile.medals[medalIndex]) {
        this.profile.medals[medalIndex] = true;
        this.save();
        return true;
      }
    }
    return false;
  }
}
