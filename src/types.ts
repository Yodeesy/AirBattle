export const CANVAS_WIDTH = 700;
export const CANVAS_HEIGHT = 890;

export enum GameState {
  INTRO_SYSU = 'INTRO_SYSU',
  INTRO_YODEESHI = 'INTRO_YODEESHI',
  LOGIN_USER = 'LOGIN_USER',
  STORY_1 = 'STORY_1',
  LOADING = 'LOADING',
  MAIN_MENU = 'MAIN_MENU',
  MAP_SELECT = 'MAP_SELECT',
  SHOP_DEFAULT = 'SHOP_DEFAULT',
  SHOP_TPC_GUTS = 'SHOP_TPC_GUTS',
  TECH_TREE = 'TECH_TREE',
  MUYU = 'MUYU',
  MEDALS = 'MEDALS',
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  VICTORY = 'VICTORY',
  GAME_OVER = 'GAME_OVER',
  ENDING = 'ENDING'
}

export interface UserProfile {
  name: string;
  amount: number;       // Current funds (Score / in-game credits)
  highScore: number;
  fighters_owned: boolean[]; // 13 fighters (0..12)
  levels_passed: boolean[];  // 8 levels (0..7)
  medals?: boolean[];        // 12 medals (0..11)
  language?: 'zh' | 'en';
  bgmVolume?: number;
  sfxVolume?: number;
  stats?: {
    totalRolls?: number;
    muyuClicks?: number;
    flankSquadronsKilled?: number;
  };
}

export interface FighterSpec {
  id: number;
  name: string;
  code: string;
  role: string;
  sprite: string;
  width: number;
  height: number;
  speed: number;
  maxHp: number;
  fireCooldown: number; // frames between shots at 60 FPS
  rollCooldown: number; // frames cooldown between roll dodges (60 FPS, e.g. 120 = 2.0s)
  damage: number;
  bulletType: number;
  price: number;
  isGuts: boolean;
  desc: string;
}

export interface StageSpec {
  id: number;
  title: string;
  subtitle: string;
  bgSprite: string;
  bgm: string;
  bgmAlt?: string;
  scrollSpeed: number;
  targetScore: number;
  hasBoss: boolean;
  bossType?: number;        // 4=Boss1, 10=Boss2
  bossScoreThreshold?: number;
  isEasterEgg?: boolean;
}
