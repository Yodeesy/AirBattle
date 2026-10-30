import { StageSpec } from './types';

export const STAGES: Record<number, StageSpec> = {
  1: {
    id: 1,
    title: "STAGE 01",
    subtitle: "RAINFOREST CANOPY // 热带雨林侦察歼灭 (积分目标: 50)",
    bgSprite: "assets/sprites/common/L1_tileable.png",
    bgm: "assets/music/night_crusing.mp3",
    scrollSpeed: 1.6,
    targetScore: 50,
    hasBoss: false
  },
  2: {
    id: 2,
    title: "STAGE 02",
    subtitle: "RED CANYON // 赤岩峡谷渗透突击 (积分目标: 50)",
    bgSprite: "assets/sprites/common/L2_tileable.png",
    bgm: "assets/music/night_crusing.mp3",
    scrollSpeed: 1.8,
    targetScore: 50,
    hasBoss: false
  },
  3: {
    id: 3,
    title: "STAGE 03",
    subtitle: "VOLCANO CRAG // 熔岩炼狱拦截前哨 (积分目标: 50)",
    bgSprite: "assets/sprites/common/L3_tileable.png",
    bgm: "assets/music/night_crusing.mp3",
    scrollSpeed: 2.0,
    targetScore: 50,
    hasBoss: false
  },
  4: {
    id: 4,
    title: "STAGE 04",
    subtitle: "STRATOSPHERE // 平流层迎击与超重型母舰 (BOSS: 母舰 1500 HP)",
    bgSprite: "assets/sprites/common/L4_tileable.png",
    bgm: "assets/music/thedogs.mp3",
    scrollSpeed: 2.2,
    targetScore: 50,
    hasBoss: true,
    bossType: 4, // Boss 1 Mothership
    bossScoreThreshold: 50
  },
  5: {
    id: 5,
    title: "STAGE 05",
    subtitle: "TOKYO DEFENSE // 东京废墟决战超古代怪兽佐加 (彩蛋关 · 目标: 100)",
    bgSprite: "assets/sprites/common/L5_tileable.png",
    bgm: "assets/music/love_theme_from_tiga.mp3",
    bgmAlt: "assets/music/you_are_always_my_hero.mp3",
    scrollSpeed: 1.5,
    targetScore: 100, // Adjusted target score to 100
    hasBoss: false,
    isEasterEgg: true
  },
  6: {
    id: 6,
    title: "STAGE 06",
    subtitle: "ASTEROID BELT // 深空小行星与陨石带强袭 (积分目标: 100)",
    bgSprite: "assets/sprites/common/L6_tileable.png",
    bgm: "assets/music/valse_di_fantastica.mp3",
    scrollSpeed: 1.5,
    targetScore: 100,
    hasBoss: false
  },
  7: {
    id: 7,
    title: "STAGE 07",
    subtitle: "DEEP NEBULA // 幽紫星云重型巡洋突击 (积分目标: 100)",
    bgSprite: "assets/sprites/common/L6_tileable.png",
    bgm: "assets/music/valse_di_fantastica.mp3",
    scrollSpeed: 1.5,
    targetScore: 100,
    hasBoss: false
  },
  8: {
    id: 8,
    title: "STAGE 08",
    subtitle: "VOID CORE // 决战深空指挥旗舰与重返地球大本营",
    bgSprite: "assets/sprites/common/L8.png",
    bgm: "assets/music/valse_di_fantastica.mp3",
    scrollSpeed: 1.6,
    targetScore: 465, // Adjusted target score to 465 (450 -> 465)
    hasBoss: true,
    bossType: 10, // Boss 2 Command Fortress Flagship
    bossScoreThreshold: 215 // Adjusted boss spawn score threshold (200 -> 215)
  }
};
