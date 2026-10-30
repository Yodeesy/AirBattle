import { Application, Container, Sprite, Text, TextStyle, Graphics, Assets, Texture } from 'pixi.js';
import { GameState, CANVAS_WIDTH, CANVAS_HEIGHT } from './types';
import { SaveManager } from './save';
import { FIGHTERS } from './fighters';
import { STAGES } from './stages';
import { sounds } from './audio';
import { StorySystem } from './story';
import { Language, getLanguage, setLanguage, I18N } from './i18n';

interface ActiveBullet {
  sprite: Sprite;
  vx: number;
  vy: number;
  damage: number;
  isEnemy: boolean;
  isUnstoppableBeam?: boolean;
}

interface ActiveEnemy {
  sprite: Sprite;
  hp: number;
  maxHp: number;
  type: number;
  vx: number;
  vy: number;
  cd: number;
  baseX: number;
  timeAlive: number;
  hitFlashTimer?: number;
  movementMode?: 'dive' | 'v_formation' | 'flank_slash' | 'sine_weave';
  flankSide?: 'left' | 'right';
  targetVx?: number;
  targetVy?: number;
}

interface ActiveBoss {
  sprite: Sprite;
  hp: number;
  maxHp: number;
  type: number; // 4=Boss1, 10=Boss2
  vx: number;
  vy: number;
  phase: number;
  laserCooldown: number;
  hitFlashTimer?: number;
  isShieldActive?: boolean;
  shieldTimer?: number;
  shieldGfx?: Graphics;
}

interface ActiveExplosion {
  sprite: Sprite;
  type: 'boom1' | 'boom2' | 'boom3_1' | 'boom3_2' | 'boom4';
  frame: number;
  timer: number;
  delay: number;
  totalFrames: number;
}

export class Game {
  public app: Application;
  public stage: Container;
  public state: GameState = GameState.MAIN_MENU;
  public saveManager: SaveManager;
  public storySystem: StorySystem;

  // Root Layers
  private bgLayer: Container;
  private gameLayer: Container;
  private uiLayer: Container;
  private storyLayer: Container;
  private modalLayer: Container;
  private toastLayer: Container;

  // Player State
  public currentFighterId: number = 0;
  private playerSprite: Sprite | null = null;
  private playerHp: number = 100;
  private playerMaxHp: number = 100;
  private playerSpeed: number = 7;
  private fireCooldownTimer: number = 0;
  private isRolling: boolean = false;
  private rollTimer: number = 0;
  private rollDirection: number = 1;
  private rollCooldownTimer: number = 0;
  private maxCannonChargeCount: number = 0;
  private chargeEffectGfx: Graphics | null = null;
  private bossChargeEffectGfx: Graphics | null = null;
  private baseScaleX: number = 1;
  private baseScaleY: number = 1;
  private lastKeyTapTime: Record<string, number> = {};

  // Local Screen Shake / Vibration
  private screenShakeTimer: number = 0;
  private screenShakeIntensity: number = 0;

  // Player Invincibility Frames & Damage Feedback (P1)
  private playerInvincibleTimer: number = 0;
  private damageVignetteTimer: number = 0;
  private damageVignetteGfx: Graphics | null = null;

  // Roll effects & aerodynamic vortices
  private rollGfx: Graphics | null = null;
  private rollVortices: Array<{ leftX: number; leftY: number; rightX: number; rightY: number; alpha: number; r: number; color: number }> = [];
  private rollShockwave: { x: number; y: number; r: number; maxR: number; alpha: number } | null = null;

  // Victory phase cinematic sequence
  private isVictorySequence: boolean = false;
  private victoryPhaseTimer: number = 0;
  private victoryPhaseDuration: number = 180; // 3s default, 5s for Stage 4/5/8
  private isPlayerFlyingOut: boolean = false;
  private victoryPostFlyoutDelay: number = 0;

  // Victory FX: Ground explosions (Stage 8) & Light convergence (Stage 5)
  private groundExplosionsGfx: Graphics | null = null;
  private groundNukeStrikes: Array<{
    x: number;
    y: number;
    age: number;
    maxAge: number;
    maxRadius: number;
    shockwaveRadius: number;
    firePuffs: Array<{ ox: number; oy: number; r: number; color: number; alphaMult: number }>;
    craterPuffs: Array<{ ox: number; oy: number; r: number; alphaMult: number }>;
    smokeBillows: Array<{ ox: number; oy: number; r: number; vx: number; vy: number; alpha: number; subPuffs: Array<{ ox: number; oy: number; r: number }> }>;
    debris: Array<{ x: number; y: number; vx: number; vy: number; r: number; alpha: number }>;
  }> = [];
  private groundExplosionSpawnTimer: number = 0;
  private lightConvergenceGfx: Graphics | null = null;
  private lightRays: Array<{ x: number; y: number; targetX: number; targetY: number; length: number; speed: number; alpha: number; width: number }> = [];

  // Dark Mist Particles (Stage 5 Phase 1 Tiga ambient effect)
  private darkMistGfx: Graphics | null = null;
  private darkMistParticles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vRot: number;
    puffs: Array<{ ox: number; oy: number; r: number; alphaMult: number }>;
  }> = [];

  // Procedural BOSS Mega Beam & Invincible Shield
  private bossShieldGfx: Graphics | null = null;
  private bossBeamGfx: Graphics | null = null;
  private activeBossBeam: {
    originX: number;
    originY: number;
    timer: number;
    duration: number;
    beamWidth: number;
    coreColor: number;
    bloomColor: number;
    damage: number;
  } | null = null;

  // GUTS Eagle (Fighter 12) Special Traits: Magnetic Deflection Shield & Tornado Thunder Beam
  private eagleShieldGfx: Graphics | null = null;
  private eagleShieldActive: boolean = false;
  private eagleShieldCooldown: number = 0; // Cooldown in frames (15s = 900 frames)
  private tornadoBeamGfx: Graphics | null = null;
  private activeTornadoBeam: {
    x: number;
    y: number;
    timer: number;
    duration: number;
    beamWidth: number;
    damage: number;
    hasHitBoss: boolean;
  } | null = null;

  // Interactive Beam Clash System (Option B: Space/J Mash to Overpower Boss Beam)
  private beamClashGfx: Graphics | null = null;
  private beamClashHudContainer: Container | null = null;
  private beamClashPromptText: Text | null = null;
  private beamClashSubText: Text | null = null;
  private beamClashGaugeGfx: Graphics | null = null;
  private beamClashState: {
    active: boolean;
    clashX: number;
    clashY: number;
    bossOriginY: number;
    playerMuzzleY: number;
    pushProgress: number; // 0.05 to 1.0 (Breakthrough)
    mashCount: number;
    flashTimer: number;
    breakthroughTriggered: boolean;
  } | null = null;
  private spacePressedThisClash: boolean = false;
  private beamClashDamageCooldown: number = 0; // Cooldown frames after clash to prevent Tornado beam melt

  // Battle Entities
  private currentStageId: number = 1;
  private stageTime: number = 0;
  private spawnTicker: number = 0;
  private score: number = 0;
  private stageTookDamage: boolean = false;
  private killedBossDuringBeam: boolean = false;
  private wonBeamClash: boolean = false;
  private bullets: ActiveBullet[] = [];
  private enemies: ActiveEnemy[] = [];
  private boss: ActiveBoss | null = null;
  private bossSpawned: boolean = false;
  private stage5Phase2Triggered: boolean = false;
  private stage8Phase2Triggered: boolean = false;
  private isStageEnding: boolean = false;
  private isTransitioning: boolean = false;
  private explosions: ActiveExplosion[] = [];

  // Stage 8 Phase 2 Final Whiteout Transition
  private whiteoutGfx: Graphics | null = null;
  private isWhiteoutActive: boolean = false;
  private whiteoutProgress: number = 0; // 0.0 to 1.0 (fade-in phase)
  private whiteoutHoldTimer: number = 0; // frames holding 100% white (120 frames = 2.0s)
  private whiteoutSfxTriggered: boolean = false;

  // Background Scrolling
  private bgSprite1: Sprite | null = null;
  private bgSprite2: Sprite | null = null;
  private bgScrollSpeed: number = 1.6;

  // Controls
  private keys: Record<string, boolean> = {};

  // Shop & Tech Tree States
  private shopMode: 'default' | 'tpc' = 'default';
  private tpcTechPage: number = 1; // 1: Tiga GUTS, 2: Dyna SUPER GUTS

  constructor() {
    this.app = new Application();
    this.stage = this.app.stage;
    this.saveManager = SaveManager.getInstance();
    this.storySystem = StorySystem.getInstance();

    this.bgLayer = new Container();
    this.gameLayer = new Container();
    this.uiLayer = new Container();
    this.storyLayer = new Container();
    this.modalLayer = new Container();
    this.toastLayer = new Container();
  }

  async init() {
    const containerEl = document.getElementById('game-container')!;
    await this.app.init({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: 0x070b14,
      resolution: Math.min(window.devicePixelRatio || 1, 1.25),
      autoDensity: true,
      antialias: true
    });
    containerEl.appendChild(this.app.canvas);

    this.stage.addChild(this.bgLayer);
    this.stage.addChild(this.gameLayer);
    this.stage.addChild(this.uiLayer);
    this.whiteoutGfx = new Graphics();
    this.stage.addChild(this.whiteoutGfx);
    this.stage.addChild(this.storyLayer);
    this.stage.addChild(this.modalLayer);
    this.stage.addChild(this.toastLayer);

    // Load persistent profile & audio configuration
    await this.saveManager.load();
    setLanguage(this.saveManager.profile.language || 'zh');
    sounds.setBgmVolume(this.saveManager.profile.bgmVolume ?? 0.7);
    sounds.setSfxVolume(this.saveManager.profile.sfxVolume ?? 0.8);

    // Setup input listeners
    this.setupInputs();

    // Start 60 FPS fixed game loop ticker
    this.app.ticker.add((ticker) => {
      this.update(ticker.deltaTime);
    });

    // Remove initial loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => loadingScreen.remove(), 300);
    }

    // Preload essential bullet, explosion and attention textures
    this.preloadCoreBattleTextures();

    // Launch startup intro sequence
    await this.playStartupSequence();
  }

  private async preloadCoreBattleTextures() {
    const texturesToLoad = [
      'assets/sprites/common/bullet_0.png',
      'assets/sprites/common/bullet_1.png',
      'assets/sprites/common/bullet_2.png',
      'assets/sprites/common/bullet_3.png',
      'assets/sprites/common/bullet_6.png',
      'assets/sprites/common/bullet_7.png',
      'assets/sprites/common/bullet_8.png',
      'assets/sprites/common/bullet_9.png',
      'assets/sprites/common/MAX.png',
      'assets/sprites/common/b1.png',
      'assets/sprites/common/e1_bullet.png',
      'assets/sprites/common/e2_bullet.png',
      'assets/sprites/common/Ebullet_1.png',
      'assets/sprites/common/Ebullet_2.png',
      'assets/sprites/common/Ebullet_3.png',
      'assets/sprites/common/Ebullet_4.png',
      'assets/sprites/common/Ebullet_5.png',
      'assets/sprites/common/enemy_1_hd.png',
      'assets/sprites/common/enemy_2_hd.png',
      'assets/sprites/common/enemy_3_hd.png',
      'assets/sprites/common/enemy_4_hd.png',
      'assets/sprites/common/enemy_5_hd.png',
      'assets/sprites/common/Zoiger1_hd.png',
      'assets/sprites/common/Zoiger2_hd.png',
      'assets/sprites/common/meteorite.png',
      'assets/sprites/common/Boss1_hd.png',
      'assets/sprites/common/Boss2_hd.png',
      'assets/sprites/common/ef1.png',
      'assets/sprites/common/e1.png',
      'assets/sprites/common/e2.png',
      'assets/sprites/common/Efire.png',
      'assets/sprites/common/Elight.png',
      'assets/sprites/common/L5_1.jpg',
      'assets/sprites/common/L5_2.jpg',
      'assets/sprites/common/L5_2_rlyeh.png',
      'assets/sprites/common/L8.jpg',
      'assets/sprites/common/L8.png',
      'assets/sprites/common/L8_2.jpg',
      'assets/sprites/common/L8_2.png',
      'assets/sprites/ui/ending_credits.png',
      'assets/story/S0.png',
      'assets/sprites/common/L1_tileable.png',
      'assets/sprites/common/fighter0_hd.png',
      'assets/sprites/common/fighter1_hd.png'
    ];

    for (let i = 0; i < 4; i++) texturesToLoad.push(`assets/sprites/booms/boom1_${i}.png`);
    for (let i = 0; i < 8; i++) texturesToLoad.push(`assets/sprites/booms/boom2_${i}.png`);
    for (let i = 0; i < 7; i++) texturesToLoad.push(`assets/sprites/booms/boom3_1_${i}.png`);
    for (let i = 0; i < 4; i++) texturesToLoad.push(`assets/sprites/booms/boom3_2_${i}.png`);
    for (let i = 0; i < 29; i++) texturesToLoad.push(`assets/sprites/booms/boom4_${i}.png`);
    for (let i = 0; i < 42; i++) texturesToLoad.push(`assets/sprites/attention/attn_${i}.png`);

    try {
      await Assets.load(texturesToLoad);
    } catch (e) {
      console.warn('Background texture preload warning:', e);
    }
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();

      // Double tap Left / Right (A / D or ArrowLeft / ArrowRight) for Barrel Roll Dodge
      if ((k === 'a' || k === 'd' || k === 'arrowleft' || k === 'arrowright') && !this.isRolling && this.rollCooldownTimer <= 0 && this.state === GameState.PLAY && !this.beamClashState) {
        const now = performance.now();
        const last = this.lastKeyTapTime[k] || 0;
        if (now - last < 280) {
          const spec = FIGHTERS[this.currentFighterId] || FIGHTERS[0];
          const dir = (k === 'd' || k === 'arrowright') ? 1 : -1;
          this.triggerBarrelRoll(dir);
          const medalsList = this.saveManager.profile.medals || new Array(12).fill(false);
          const medalCount = medalsList.filter(Boolean).length;
          const baseCd = spec.rollCooldown || 180;
          // -1.5 frames (0.025s) per medal, e.g. 12 medals = -18 frames (0.3s)
          this.rollCooldownTimer = Math.max(60, baseCd - medalCount * 1.5);

          // Track total rolls for Medal #4 (index 3)
          if (!this.saveManager.profile.stats) {
            this.saveManager.profile.stats = { totalRolls: 0, muyuClicks: 0, flankSquadronsKilled: 0 };
          }
          this.saveManager.profile.stats.totalRolls = (this.saveManager.profile.stats.totalRolls || 0) + 1;
          if (this.saveManager.profile.stats.totalRolls >= 20) {
            if (this.saveManager.unlockMedal(3)) {
              this.showMedalUnlockedToast(3);
            }
          }
          this.saveManager.save();
        }
        this.lastKeyTapTime[k] = now;
      }

      this.keys[k] = true;

      // Beam Clash Strict Tap-Mash (Space / J) - Must release before pressing again!
      if ((k === ' ' || k === 'j') && this.beamClashState && this.state === GameState.PLAY) {
        if (!e.repeat && !this.spacePressedThisClash) {
          this.spacePressedThisClash = true;
          this.handleBeamClashMash();
        }
      }

      // In-game Pause & Unpause via ESC or P
      if ((k === 'escape' || k === 'p') && (this.state === GameState.PLAY || this.state === GameState.PAUSE)) {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      this.keys[k] = false;
      if (k === ' ' || k === 'j') {
        this.spacePressedThisClash = false;
      }
    });

    window.addEventListener('pointerdown', () => {
      if (this.beamClashState && this.state === GameState.PLAY) {
        this.handleBeamClashMash();
      }
    });
  }

  // ==========================================
  // STARTUP SEQUENCE & PILOT REGISTRATION
  // ==========================================
  public async playStartupSequence() {
    try {
      // 1. Play Yodeeshi Logo animation (Clean, 1.25x speed)
      await this.playVideoIntro('assets/videos/logo.mp4', 1.25);
      // 2. Play SYSU 100th anniversary celebration at 1.25x speed (both video and audio)
      await this.playVideoIntro('assets/videos/sysu.mp4', 1.25);
      // 3. Play Story 1 Comic Intro (American comic style)
      this.clearAllLayers();
      await this.storySystem.playStory1(this.storyLayer);
      // 4. Show Pilot Login Modal
      await this.showPilotLogin();
    } catch (err) {
      console.warn('Startup sequence error, proceeding to Main Menu:', err);
    }
    // 5. Enter Main Menu
    this.showMainMenu();
  }

  public playVideoIntro(src: string, playbackRate: number = 1.0): Promise<void> {
    return new Promise((resolve) => {
      const containerEl = document.getElementById('game-container')!;

      const wrapper = document.createElement('div');
      wrapper.id = 'video-intro-wrapper';
      wrapper.style.position = 'absolute';
      wrapper.style.inset = '0';
      wrapper.style.zIndex = '900';
      wrapper.style.backgroundColor = '#000';
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';

      const video = document.createElement('video');
      video.src = src;
      video.autoplay = true;
      video.playsInline = true;
      video.style.width = '700px';
      video.style.height = '890px';
      video.style.objectFit = 'contain';

      video.defaultPlaybackRate = playbackRate;
      video.playbackRate = playbackRate;
      video.onloadedmetadata = () => {
        video.playbackRate = playbackRate;
      };
      video.onplay = () => {
        video.playbackRate = playbackRate;
      };

      // Skip button at bottom right (NO annoying top-left description text!)
      const skipBtn = document.createElement('button');
      skipBtn.innerText = '跳过 INTRO ⏭ [ESC / 点击]';
      skipBtn.style.position = 'absolute';
      skipBtn.style.bottom = '24px';
      skipBtn.style.right = '24px';
      skipBtn.style.padding = '8px 18px';
      skipBtn.style.background = 'rgba(10, 20, 35, 0.85)';
      skipBtn.style.border = '1px solid #00f0ff';
      skipBtn.style.borderRadius = '4px';
      skipBtn.style.color = '#00f0ff';
      skipBtn.style.fontSize = '12px';
      skipBtn.style.cursor = 'pointer';
      skipBtn.style.boxShadow = '0 0 10px rgba(0,240,255,0.3)';

      wrapper.appendChild(video);
      wrapper.appendChild(skipBtn);
      containerEl.appendChild(wrapper);

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        window.removeEventListener('keydown', handleKey);
        video.pause();
        wrapper.remove();
        resolve();
      };

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
          finish();
        }
      };

      (window as any).__skipCurrentIntro = finish;
      window.addEventListener('keydown', handleKey);
      video.onended = () => finish();
      video.onerror = () => finish();
      skipBtn.onclick = (e) => {
        e.stopPropagation();
        finish();
      };
      wrapper.onclick = () => finish();
    });
  }

  public showPilotLogin(): Promise<void> {
    return new Promise((resolve) => {
      this.state = GameState.LOGIN_USER;
      this.clearAllLayers();
      sounds.playMenu();

      const bg = new Graphics();
      bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      bg.fill({ color: 0x050a14 });
      bg.stroke({ color: 0x0a203a, width: 1 });
      for (let x = 0; x < CANVAS_WIDTH; x += 40) bg.moveTo(x, 0).lineTo(x, CANVAS_HEIGHT);
      for (let y = 0; y < CANVAS_HEIGHT; y += 40) bg.moveTo(0, y).lineTo(CANVAS_WIDTH, y);
      this.bgLayer.addChild(bg);

      const containerEl = document.getElementById('game-container')!;
      const inputWrapper = document.createElement('div');
      inputWrapper.style.position = 'absolute';
      inputWrapper.style.top = '415px';
      inputWrapper.style.left = '100px';
      inputWrapper.style.width = '500px';
      inputWrapper.style.zIndex = '1000';

      const input = document.createElement('input');
      input.type = 'text';
      input.value = this.saveManager.profile.name || 'PILOT_01';
      input.maxLength = 16;
      input.style.width = '100%';
      input.style.boxSizing = 'border-box';
      input.style.padding = '12px 18px';
      input.style.fontSize = '16px';
      input.style.fontFamily = 'Consolas, monospace';
      input.style.color = '#00f0ff';
      input.style.backgroundColor = 'rgba(7, 20, 38, 0.95)';
      input.style.border = '2px solid #00c8ff';
      input.style.borderRadius = '6px';
      input.style.outline = 'none';
      input.style.boxShadow = '0 0 12px rgba(0,240,255,0.3)';

      inputWrapper.appendChild(input);
      containerEl.appendChild(inputWrapper);
      input.focus();

      const cleanup = () => {
        inputWrapper.remove();
      };

      const renderUI = () => {
        this.uiLayer.removeChildren();

        const curLang = getLanguage();
        const lI18n = I18N[curLang].login;

        const card = new Graphics();
        card.roundRect(80, 140, 540, 550, 12);
        card.fill({ color: 0x0c1524, alpha: 0.96 });
        card.stroke({ color: 0x00f0ff, width: 2 });
        this.uiLayer.addChild(card);

        const badge = new Graphics();
        badge.roundRect(100, 160, 500, 32, 4);
        badge.fill({ color: 0x002c4c, alpha: 0.8 });
        badge.stroke({ color: 0x00f0ff, width: 1 });
        this.uiLayer.addChild(badge);

        const badgeText = new Text({
          text: lI18n.badge,
          style: new TextStyle({ fill: 0x00f0ff, fontSize: 12, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
        });
        badgeText.position.set(115, 167);
        this.uiLayer.addChild(badgeText);

        const title = new Text({
          text: lI18n.title,
          style: new TextStyle({ fill: 0xffffff, fontSize: 20, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
        });
        title.position.set(100, 205);
        this.uiLayer.addChild(title);

        const subtitle = new Text({
          text: lI18n.subtitle,
          style: new TextStyle({ fill: 0x88a8cc, fontSize: 13, fontFamily: 'Segoe UI, Microsoft YaHei', wordWrap: true, wordWrapWidth: 500, lineHeight: 20 })
        });
        subtitle.position.set(100, 240);
        this.uiLayer.addChild(subtitle);

        // Language Selector Area
        const langLabel = new Text({
          text: lI18n.langLabel,
          style: new TextStyle({ fill: 0xffdc3c, fontSize: 13, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
        });
        langLabel.position.set(100, 305);
        this.uiLayer.addChild(langLabel);

        const zhActive = curLang === 'zh';
        const enActive = curLang === 'en';

        this.createButton(285, 296, 150, 36, lI18n.zhBtn, zhActive ? 0x00f0ff : 0x3a5068, async () => {
          setLanguage('zh');
          this.saveManager.profile.language = 'zh';
          await this.saveManager.save();
          renderUI();
        });

        this.createButton(450, 296, 150, 36, lI18n.enBtn, enActive ? 0x00f0ff : 0x3a5068, async () => {
          setLanguage('en');
          this.saveManager.profile.language = 'en';
          await this.saveManager.save();
          renderUI();
        });

        const callsignLabel = new Text({
          text: lI18n.callsignLabel,
          style: new TextStyle({ fill: 0xffc828, fontSize: 13, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
        });
        callsignLabel.position.set(100, 375);
        this.uiLayer.addChild(callsignLabel);

        // Stats summary box
        const statsBox = new Graphics();
        statsBox.roundRect(100, 485, 500, 68, 6);
        statsBox.fill({ color: 0x08101c, alpha: 0.9 });
        statsBox.stroke({ color: 0x1e3c5c, width: 1 });
        this.uiLayer.addChild(statsBox);

        const ownedCount = this.saveManager.profile.fighters_owned.filter(Boolean).length;
        const statsHeader = new Text({
          text: lI18n.statsHeader,
          style: new TextStyle({ fill: 0x88bbdd, fontSize: 11, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
        });
        statsHeader.position.set(115, 494);
        this.uiLayer.addChild(statsHeader);

        const statsOverviewText = new Text({
          text: lI18n.statsOverview(this.saveManager.profile.amount, this.saveManager.profile.highScore, ownedCount),
          style: new TextStyle({ fill: 0x6e92b0, fontSize: 11, fontFamily: 'Segoe UI, Microsoft YaHei' })
        });
        statsOverviewText.position.set(115, 518);
        this.uiLayer.addChild(statsOverviewText);

        this.createButton(100, 600, 240, 48, lI18n.confirmSortie, 0x00f0ff, async () => {
          const name = input.value.trim() || 'PILOT_01';
          this.saveManager.profile.name = name;
          await this.saveManager.save();
          cleanup();
          resolve();
        });

        this.createButton(360, 600, 240, 48, lI18n.guestAccess, 0xffa028, async () => {
          cleanup();
          resolve();
        });
      };

      renderUI();
    });
  }

  // ==========================================
  // SCENE 1: MAIN MENU
  // ==========================================
  public async showMainMenu() {
    this.state = GameState.MAIN_MENU;
    sounds.playMenu();
    this.clearAllLayers();

    const lang = getLanguage();
    const mI18n = I18N[lang].menu;

    const bgTex = await Assets.load('assets/sprites/ui/screen_menu.jpg');
    const bgSprite = new Sprite(bgTex);
    bgSprite.width = CANVAS_WIDTH;
    bgSprite.height = CANVAS_HEIGHT;
    this.bgLayer.addChild(bgSprite);

    // Pilot Badge Header
    const pilotBadge = new Graphics();
    pilotBadge.roundRect(30, 24, 380, 38, 6);
    pilotBadge.fill({ color: 0x07111e, alpha: 0.85 });
    pilotBadge.stroke({ color: 0x00f0ff, width: 1.5 });
    this.uiLayer.addChild(pilotBadge);

    const pilotText = new Text({
      text: mI18n.pilotBadge(this.saveManager.profile.name, this.saveManager.profile.amount),
      style: new TextStyle({ fill: 0x00f0ff, fontSize: 11, fontWeight: 'bold', fontFamily: 'Consolas, Segoe UI, Microsoft YaHei' })
    });
    pilotText.position.set(42, 35);
    this.uiLayer.addChild(pilotText);

    this.createButton(410, 24, 110, 38, mI18n.switchPilot, 0xffc828, async () => {
      await this.showPilotLogin();
      this.showMainMenu();
    });

    // Top-Right Medals Room Button (Circular styling with medal badge)
    const medalCont = new Container();
    const medalG = new Graphics();
    const drawMedalKnob = (hover: boolean) => {
      medalG.clear();
      medalG.circle(585, 43, 22);
      medalG.fill({ color: hover ? 0x2b2410 : 0x141208, alpha: 0.95 });
      medalG.stroke({ color: hover ? 0xffea60 : 0xffc828, width: hover ? 2.5 : 2 });
      // Inner decorative ring
      medalG.circle(585, 43, 16);
      medalG.stroke({ color: 0xffd700, width: 1, alpha: 0.5 });
    };
    drawMedalKnob(false);
    medalCont.addChild(medalG);

    const medalIcon = new Text({
      text: '🎖️',
      style: new TextStyle({ fontSize: 18, align: 'center' })
    });
    medalIcon.anchor.set(0.5);
    medalIcon.position.set(585, 43);
    medalCont.addChild(medalIcon);

    medalCont.eventMode = 'static';
    medalCont.cursor = 'pointer';
    medalCont.on('pointerover', () => drawMedalKnob(true));
    medalCont.on('pointerout', () => drawMedalKnob(false));
    medalCont.on('pointerdown', () => this.showMedalsRoom(1));
    this.uiLayer.addChild(medalCont);

    // Top-Right Audio Knob Button (circular styling with gear/speaker indicator)
    const knobCont = new Container();
    const knobG = new Graphics();
    const drawKnob = (hover: boolean) => {
      knobG.clear();
      knobG.circle(645, 43, 22);
      knobG.fill({ color: hover ? 0x1f344d : 0x0c1624, alpha: 0.95 });
      knobG.stroke({ color: hover ? 0x00ffff : 0x00c8ff, width: hover ? 2.5 : 2 });
      // Inner decorative ring
      knobG.circle(645, 43, 16);
      knobG.stroke({ color: 0x00f0ff, width: 1, alpha: 0.4 });
    };
    drawKnob(false);
    knobCont.addChild(knobG);

    const knobIcon = new Text({
      text: '⚙️',
      style: new TextStyle({ fontSize: 18, align: 'center' })
    });
    knobIcon.anchor.set(0.5);
    knobIcon.position.set(645, 43);
    knobCont.addChild(knobIcon);

    knobCont.eventMode = 'static';
    knobCont.cursor = 'pointer';
    knobCont.on('pointerover', () => drawKnob(true));
    knobCont.on('pointerout', () => drawKnob(false));
    knobCont.on('pointerdown', () => this.showAudioSettingsModal(() => this.showMainMenu()));
    this.uiLayer.addChild(knobCont);

    const menuItems = [
      { y: 240, h: 52, text: mI18n.sortie, color: 0x00f0ff, action: () => this.showMapSelect() },
      { y: 306, h: 52, text: mI18n.hangar, color: 0xffa028, action: () => this.showShop() },
      { y: 372, h: 52, text: mI18n.meditation, color: 0x28dc78, action: () => this.showMuyu() },
      { y: 438, h: 52, text: mI18n.exitGame, color: 0xff3232, action: () => this.confirmExit() }
    ];

    menuItems.forEach(item => {
      const btnCont = new Container();
      const card = new Graphics();

      const drawCard = (hover: boolean) => {
        card.clear();
        card.roundRect(420, item.y, 230, item.h, 6);
        card.fill({ color: hover ? 0x162438 : 0x0a1422, alpha: 0.96 });
        card.stroke({ color: hover ? 0xffffff : item.color, width: hover ? 2.5 : 1.8 });
      };
      drawCard(false);
      btnCont.addChild(card);

      const label = new Text({
        text: item.text,
        style: new TextStyle({
          fill: 0xffffff,
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Segoe UI, Microsoft YaHei',
          letterSpacing: 2
        })
      });
      label.anchor.set(0.5);
      label.position.set(420 + 115, item.y + item.h / 2);
      btnCont.addChild(label);

      btnCont.eventMode = 'static';
      btnCont.cursor = 'pointer';
      btnCont.on('pointerover', () => {
        drawCard(true);
        label.style.fill = item.color;
      });
      btnCont.on('pointerout', () => {
        drawCard(false);
        label.style.fill = 0xffffff;
      });
      btnCont.on('pointerdown', item.action);
      this.uiLayer.addChild(btnCont);
    });

    this.createButton(410, 506, 120, 36, mI18n.prologue, 0x00f0ff, () => {
      this.storySystem.playStory1(this.storyLayer).then(() => this.showMainMenu());
    });
    this.createButton(540, 506, 120, 36, mI18n.replayStartup, 0xffa028, () => {
      this.playStartupSequence();
    });
  }

  // ==========================================
  // SCENE 2: MAP SELECT
  // ==========================================
  public async showMapSelect() {
    this.state = GameState.MAP_SELECT;
    sounds.playMenu();
    this.clearAllLayers();

    const bgTex = await Assets.load('assets/sprites/ui/map_select_bg.jpg');
    const bgSprite = new Sprite(bgTex);
    bgSprite.width = CANVAS_WIDTH;
    bgSprite.height = CANVAS_HEIGHT;
    this.bgLayer.addChild(bgSprite);

    const overlay = new Graphics();
    overlay.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    overlay.fill({ color: 0x050d18, alpha: 0.6 });
    this.bgLayer.addChild(overlay);

    const lang = getLanguage();
    const mapI18n = I18N[lang].map;

    const title = new Text({
      text: `${mapI18n.title}\n${mapI18n.subtitle}`,
      style: new TextStyle({ fill: 0x00f0ff, fontSize: 16, fontFamily: 'Segoe UI, Microsoft YaHei', lineHeight: 24 })
    });
    title.position.set(45, 32);
    this.uiLayer.addChild(title);

    const cardW = 135;
    const cardH = 270;
    const gapX = 18;
    const startX = Math.floor((CANVAS_WIDTH - (4 * cardW + 3 * gapX)) / 2);
    const row1Y = 110;
    const row2Y = 430;

    const levelsPassed = this.saveManager.profile.levels_passed;
    let isLaunchingStage = false;

    for (let idx = 1; idx <= 8; idx++) {
      const col = (idx - 1) % 4;
      const row = Math.floor((idx - 1) / 4);
      const x = startX + col * (cardW + gapX);
      const y = row === 0 ? row1Y : row2Y;

      let isUnlocked = false;
      let isPassed = levelsPassed[idx - 1] === true;

      if (idx === 1) {
        isUnlocked = true;
      } else if (idx === 5) {
        isUnlocked = levelsPassed[2] === true || levelsPassed[3] === true;
      } else {
        isUnlocked = levelsPassed[idx - 2] === true;
      }

      const cardTex = await Assets.load(`assets/sprites/ui/M${idx}.png`);
      const cardSprite = new Sprite(cardTex);
      cardSprite.width = cardW;
      cardSprite.height = cardH;
      cardSprite.position.set(x, y);

      if (!isUnlocked) {
        cardSprite.tint = 0x444455;
      }
      this.uiLayer.addChild(cardSprite);

      const badge = new Graphics();
      badge.roundRect(x, y + cardH + 8, cardW, 24, 5);
      badge.fill({ color: 0x0a1422, alpha: 0.9 });
      const badgeColor = isPassed ? 0x28dc78 : isUnlocked ? 0xffc828 : 0x778899;
      badge.stroke({ color: badgeColor, width: 1.5 });
      this.uiLayer.addChild(badge);

      const badgeTextStr = isPassed ? mapI18n.passed : isUnlocked ? mapI18n.unlocked : mapI18n.locked;
      const badgeText = new Text({
        text: badgeTextStr,
        style: new TextStyle({ fill: badgeColor, fontSize: 11, fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      badgeText.position.set(x + (cardW - badgeText.width) / 2, y + cardH + 12);
      this.uiLayer.addChild(badgeText);

      if (isUnlocked) {
        const hit = new Graphics();
        hit.roundRect(x, y, cardW, cardH + 34, 8);
        hit.fill({ color: 0xffffff, alpha: 0.001 });
        hit.eventMode = 'static';
        hit.cursor = 'pointer';

        hit.on('pointerover', () => {
          if (isLaunchingStage) return;
          hit.clear();
          hit.roundRect(x, y, cardW, cardH + 34, 8);
          hit.stroke({ color: 0x00f0ff, width: 2 });
          hit.fill({ color: 0x00d0ff, alpha: 0.1 });
        });

        hit.on('pointerout', () => {
          if (isLaunchingStage) return;
          hit.clear();
          hit.roundRect(x, y, cardW, cardH + 34, 8);
          hit.fill({ color: 0xffffff, alpha: 0.001 });
        });

        hit.on('pointerdown', async (e) => {
          e.stopPropagation();
          if (isLaunchingStage) return;
          isLaunchingStage = true;

          if (idx === 1) {
            await this.storySystem.playMissionBriefing1(this.storyLayer);
          } else if (idx === 5) {
            await this.storySystem.playTigaStory1(this.storyLayer);
          } else if (idx === 6) {
            await this.storySystem.playMissionBriefing6(this.storyLayer);
          }
          await this.startBattle(idx);
        });

        this.uiLayer.addChild(hit);
      }
    }

    this.createReturnButton(CANVAS_WIDTH / 2 - 90, 810, 180, 42, mapI18n.returnMenu, () => {
      if (isLaunchingStage) return;
      this.showMainMenu();
    });
  }

  // ==========================================
  // SCENE 3: SHOP & TPC GUTS HANGAR
  // ==========================================
  public async showShop() {
    this.state = GameState.SHOP_DEFAULT;
    sounds.playMenu();
    this.clearAllLayers();

    const lang = getLanguage();
    const hI18n = I18N[lang].hangar;

    // TPC Tech Tree unlocks strictly after clearing Stage 5 (index 4)
    const canSwitchTpc = this.saveManager.profile.levels_passed[4] === true;
    if (!canSwitchTpc && this.shopMode === 'tpc') {
      this.shopMode = 'default';
    }

    const bgUrl = this.shopMode === 'tpc' ? 'assets/sprites/ui/tpc_guts_hangar_bg.jpg' : 'assets/sprites/ui/shop_hangar_bg.jpg';
    const bgTex = await Assets.load(bgUrl);
    const bgSprite = new Sprite(bgTex);
    bgSprite.width = CANVAS_WIDTH;
    bgSprite.height = CANVAS_HEIGHT;
    this.bgLayer.addChild(bgSprite);

    const tint = new Graphics();
    tint.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    tint.fill({ color: 0x050d18, alpha: 0.55 });
    this.bgLayer.addChild(tint);

    const titleText = this.shopMode === 'tpc' ? hI18n.tpcTitle : hI18n.fleetTitle;

    const header = new Text({
      text: titleText,
      style: new TextStyle({
        fill: this.shopMode === 'tpc' ? 0xff8c28 : 0x00f0ff,
        fontSize: 14,
        fontFamily: 'Segoe UI, Microsoft YaHei',
        lineHeight: 22
      })
    });
    header.position.set(40, 30);
    this.uiLayer.addChild(header);

    const fundsBox = new Graphics();
    fundsBox.roundRect(CANVAS_WIDTH - 210, 28, 170, 44, 6);
    fundsBox.fill({ color: 0x141e2d, alpha: 0.9 });
    fundsBox.stroke({ color: 0xffc828, width: 1.5 });
    this.uiLayer.addChild(fundsBox);

    const fundsLabel = new Text({
      text: hI18n.funds(this.saveManager.profile.amount),
      style: new TextStyle({ fill: 0xffd232, fontSize: 13, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    fundsLabel.position.set(CANVAS_WIDTH - 200, 40);
    this.uiLayer.addChild(fundsLabel);

    const tipLabel = new Text({
      text: lang === 'en' ? 'ℹ Click card to view aircraft dossier' : 'ℹ 点击战机卡片可查阅原著绝密档案',
      style: new TextStyle({ fill: 0x88a2bc, fontSize: 11, fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    tipLabel.position.set(40, 68);
    this.uiLayer.addChild(tipLabel);

    if (this.shopMode === 'tpc') {
      await this.renderTpcTechTree(canSwitchTpc);
      return;
    }

    // STANDARD FLEET SHOP (Fighters 0, 1, 2, 3)
    const fightersToShow = [0, 1, 2, 3];
    const cols = 2;
    const slotW = 240;
    const slotH = 245;
    const gapX = 30;
    const gapY = 25;
    const totalW = cols * slotW + (cols - 1) * gapX;
    const startX = Math.floor((CANVAS_WIDTH - totalW) / 2);
    const startY = 130;

    for (let i = 0; i < fightersToShow.length; i++) {
      const fId = fightersToShow[i];
      const spec = FIGHTERS[fId];
      if (!spec) continue;

      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (slotW + gapX);
      const y = startY + row * (slotH + gapY);

      const isOwned = this.saveManager.profile.fighters_owned[fId] === true;
      const isEquipped = this.currentFighterId === fId;

      const card = new Graphics();
      card.roundRect(x, y, slotW, slotH, 8);
      card.fill({ color: isEquipped ? 0x0d283c : 0x0d1522, alpha: 0.92 });
      const borderCol = isEquipped ? 0x00f0ff : isOwned ? 0x28dc78 : 0x3c5068;
      card.stroke({ color: borderCol, width: isEquipped ? 2.5 : 1.5 });
      card.eventMode = 'static';
      card.cursor = 'pointer';
      const openDetail = () => this.showFighterDetailModal(fId);
      card.on('pointerdown', openDetail);
      this.uiLayer.addChild(card);

      try {
        const fTex = await Assets.load(spec.sprite.replace(/^\//, ''));
        const fSp = new Sprite(fTex);
        fSp.anchor.set(0.5);
        fSp.width = 95;
        fSp.height = 85;
        fSp.position.set(x + slotW / 2, y + 65);
        fSp.eventMode = 'static';
        fSp.cursor = 'pointer';
        fSp.on('pointerdown', openDetail);
        this.uiLayer.addChild(fSp);
      } catch (err) {}

      const fI18n = (I18N[lang].fighters as any)[fId];
      const fighterName = fI18n ? fI18n.name : spec.name;
      const fighterRole = fI18n ? fI18n.role : spec.role;

      const nameText = new Text({
        text: fighterName,
        style: new TextStyle({ fill: 0xffffff, fontSize: 14, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      nameText.position.set(x + 14, y + 125);
      nameText.eventMode = 'static';
      nameText.cursor = 'pointer';
      nameText.on('pointerdown', openDetail);
      this.uiLayer.addChild(nameText);

      const roleText = new Text({
        text: fighterRole,
        style: new TextStyle({ fill: 0x00c8ff, fontSize: 11, fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      roleText.position.set(x + 14, y + 148);
      roleText.eventMode = 'static';
      roleText.cursor = 'pointer';
      roleText.on('pointerdown', openDetail);
      this.uiLayer.addChild(roleText);

      const statsText = new Text({
        text: `HP: ${spec.maxHp}  SPD: ${spec.speed}  ATK: ${spec.damage}`,
        style: new TextStyle({ fill: 0x90a8c0, fontSize: 10, fontFamily: 'Consolas' })
      });
      statsText.position.set(x + 14, y + 170);
      statsText.eventMode = 'static';
      statsText.cursor = 'pointer';
      statsText.on('pointerdown', openDetail);
      this.uiLayer.addChild(statsText);

      const btnH = 36;
      const btnY = y + slotH - btnH - 8;
      const btnW = slotW - 28;
      const btnX = x + 14;

      let btnLabel = '';
      let btnColor = 0x00f0ff;

      if (isEquipped) {
        btnLabel = hI18n.inService;
        btnColor = 0x28dc78;
      } else if (isOwned) {
        btnLabel = hI18n.equip;
        btnColor = 0x00f0ff;
      } else {
        btnLabel = hI18n.reqPrice(spec.price);
        btnColor = 0xffa028;
      }

      this.createButton(btnX, btnY, btnW, btnH, btnLabel, btnColor, () => {
        if (isOwned) {
          this.currentFighterId = fId;
          sounds.playSfx('shoot', 0.8);
          this.showShop();
        } else {
          if (this.saveManager.profile.amount >= spec.price) {
            this.saveManager.addFunds(-spec.price);
            this.saveManager.unlockFighter(fId);
            this.currentFighterId = fId;
            sounds.playSfx('shoot', 0.9);
            this.showShop();
          } else {
            alert(hI18n.insufficientFundsAlert(spec.price, this.saveManager.profile.amount));
          }
        }
      });
    }

    const navY = 810;
    if (canSwitchTpc) {
      this.createButton(40, navY, 200, 42, hI18n.switchToTpc, 0xffa028, () => {
        this.shopMode = 'tpc';
        this.showShop();
      });
    }

    this.createReturnButton(CANVAS_WIDTH - 200, navY, 160, 42, hI18n.returnMenu, () => this.showMainMenu());
  }

  // ==========================================
  // TPC TECH TREE (2 PAGES: TIGA GUTS & DYNA SUPER GUTS)
  // ==========================================
  private async renderTpcTechTree(canSwitchTpc: boolean) {
    const linesGfx = new Graphics();
    this.uiLayer.addChild(linesGfx);

    const lang = getLanguage();
    const hI18n = I18N[lang].hangar;

    // Tech Tree Node Definition
    interface TechTreeNode {
      id: number;
      x: number;
      y: number;
      w: number;
      h: number;
      parentIds: number[];
      isEagleSpecial?: boolean;
    }

    // Top Tabs: Page 1 (Tiga GUTS) vs Page 2 (Dyna SUPER GUTS)
    const tabY = 96;
    const tabW = 300;
    const tabH = 34;

    const tab1Active = this.tpcTechPage === 1;
    const tab2Active = this.tpcTechPage === 2;

    this.createButton(40, tabY, tabW, tabH, hI18n.page1Tab, tab1Active ? 0xffa028 : 0x5a6a7c, () => {
      this.tpcTechPage = 1;
      sounds.playSfx('shoot', 0.5);
      this.showShop();
    });

    this.createButton(360, tabY, tabW, tabH, hI18n.page2Tab, tab2Active ? 0x00f0ff : 0x5a6a7c, () => {
      this.tpcTechPage = 2;
      sounds.playSfx('shoot', 0.5);
      this.showShop();
    });

    // Check GUTS Eagle unlock criteria:
    // (Condition 1: All Tiga GUTS fighters [4, 5, 6, 7, 9, 10, 11] unlocked + >= 1000 G funds)
    // OR (Condition 2: All 12 medals & citations collected)
    const tigaGutsIds = [4, 5, 6, 7, 9, 10, 11];
    const allTigaUnlocked = tigaGutsIds.every((id) => this.saveManager.profile.fighters_owned[id] === true);
    const hasEnoughFunds = this.saveManager.profile.amount >= 1000;
    const cond1Met = allTigaUnlocked && hasEnoughFunds;

    const medalsList = this.saveManager.profile.medals || new Array(12).fill(false);
    const allMedalsEarned = medalsList.length >= 12 && medalsList.slice(0, 12).every(Boolean);
    const cond2Met = allMedalsEarned;

    const eaglePermitted = cond1Met || cond2Met;

    // Branches definition by page
    let branches: { title: string; subtitle?: string; y: number; nodes: TechTreeNode[] }[] = [];

    if (this.tpcTechPage === 1) {
      // PAGE 1: TIGA ERA (GUTS)
      branches = [
        {
          title: hI18n.branch1,
          subtitle: '马赫5.5高速多用途主力机 ➔ 麦格斯动力激进特装型',
          y: 142,
          nodes: [
            { id: 4, x: 40, y: 172, w: 290, h: 160, parentIds: [] },
            { id: 6, x: 370, y: 172, w: 290, h: 160, parentIds: [4] }
          ]
        },
        {
          title: hI18n.branch2,
          subtitle: '四人座重型强击机 ➔ 德克萨斯攻坚全开形态',
          y: 350,
          nodes: [
            { id: 5, x: 40, y: 380, w: 290, h: 160, parentIds: [] },
            { id: 9, x: 370, y: 380, w: 290, h: 160, parentIds: [5] }
          ]
        },
        {
          title: hI18n.branch3,
          subtitle: 'α高速突击机 + β重装母机 ➔ 双机空中精准对接终极合体',
          y: 558,
          nodes: [
            { id: 7, x: 40, y: 588, w: 190, h: 165, parentIds: [] },
            { id: 10, x: 255, y: 588, w: 190, h: 165, parentIds: [] },
            { id: 11, x: 470, y: 588, w: 190, h: 165, parentIds: [7, 10] }
          ]
        }
      ];
    } else {
      // PAGE 2: DYNA ERA (SUPER GUTS & BLACK BUSTER)
      branches = [
        {
          title: hI18n.branchDyna1,
          subtitle: '权藤参谋绝密黑色风暴队特务隐形截击机',
          y: 142,
          nodes: [
            { id: 8, x: 40, y: 175, w: 320, h: 220, parentIds: [] }
          ]
        },
        {
          title: hI18n.branchDyna2,
          subtitle: 'α·β·γ三机三位一体合体 · 新领域时代无敌守护旗舰',
          y: 415,
          nodes: [
            { id: 12, x: 40, y: 448, w: 620, h: 235, parentIds: [], isEagleSpecial: true }
          ]
        }
      ];

      // Draw Eagle unlock criteria banner in Page 2
      const infoBox = new Graphics();
      infoBox.roundRect(40, 695, 620, 52, 6);
      infoBox.fill({ color: eaglePermitted ? 0x0c2538 : 0x1a1215, alpha: 0.9 });
      infoBox.stroke({ color: eaglePermitted ? 0x28dc78 : 0xff3b30, width: 1.5 });
      this.uiLayer.addChild(infoBox);

      const statusIcon = eaglePermitted ? '✅' : '🔒';
      const condText = new Text({
        text: `${statusIcon} ${hI18n.eagleUnlockCond}\n${
          cond2Met
            ? '★ [荣誉达标] 已集齐全部荣誉勋章奖牌，已授予研发许可！'
            : cond1Met
            ? '★ [科技达标] TPC战机已全解锁且军费达标，已授予研发许可！'
            : `[当前进度] TPC解锁: ${tigaGutsIds.filter(id => this.saveManager.profile.fighters_owned[id]).length}/${tigaGutsIds.length} | 军费: ${this.saveManager.profile.amount}/1000 G | 勋章: ${medalsList.filter(Boolean).length}/12`
        }`,
        style: new TextStyle({
          fill: eaglePermitted ? 0x28dc78 : 0xffc83c,
          fontSize: 11,
          fontFamily: 'Segoe UI, Microsoft YaHei',
          lineHeight: 18
        })
      });
      condText.position.set(52, 702);
      this.uiLayer.addChild(condText);
    }

    // 1. Draw Branch Labels & Conduit Evolution Connecting Lines
    for (const br of branches) {
      // Branch header tag
      const tag = new Graphics();
      tag.roundRect(br.nodes[0].x, br.y, Math.min(620, br.nodes[0].w * br.nodes.length + 30), 22, 4);
      tag.fill({ color: 0x142032, alpha: 0.85 });
      tag.stroke({ color: this.tpcTechPage === 1 ? 0xffa028 : 0x00f0ff, width: 1 });
      this.uiLayer.addChild(tag);

      const tagText = new Text({
        text: br.title,
        style: new TextStyle({ fill: this.tpcTechPage === 1 ? 0xffa028 : 0x00f0ff, fontSize: 11, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      tagText.position.set(br.nodes[0].x + 10, br.y + 4);
      this.uiLayer.addChild(tagText);

      // Connecting evolution lines & arrows
      for (const node of br.nodes) {
        for (const pId of node.parentIds) {
          const parent = br.nodes.find((n) => n.id === pId);
          if (parent) {
            const startX = parent.x + parent.w;
            const startY = parent.y + parent.h / 2;
            const endX = node.x;
            const endY = node.y + node.h / 2;

            const isParentOwned = this.saveManager.profile.fighters_owned[pId] === true;
            const lineColor = isParentOwned ? 0x00f0ff : 0x3a4c62;

            linesGfx.moveTo(startX, startY);
            linesGfx.lineTo(endX, endY);
            linesGfx.stroke({ color: lineColor, width: 3 });

            // Arrow head
            linesGfx.poly([
              { x: endX, y: endY },
              { x: endX - 8, y: endY - 6 },
              { x: endX - 8, y: endY + 6 }
            ]);
            linesGfx.fill({ color: lineColor });
          }
        }
      }
    }

    // 2. Render Evolution Cards
    for (const br of branches) {
      for (const node of br.nodes) {
        const spec = FIGHTERS[node.id];
        if (!spec) continue;

        const isOwned = this.saveManager.profile.fighters_owned[node.id] === true;
        const isEquipped = this.currentFighterId === node.id;
        const prereqMet = node.isEagleSpecial
          ? eaglePermitted
          : node.parentIds.every((pid) => this.saveManager.profile.fighters_owned[pid] === true);

        const card = new Graphics();
        card.roundRect(node.x, node.y, node.w, node.h, 6);
        const cardBg = isEquipped ? 0x0e283e : isOwned ? 0x0d1c2b : prereqMet ? 0x121824 : 0x0a0f16;
        card.fill({ color: cardBg, alpha: 0.94 });

        const borderCol = isEquipped ? 0x00f0ff : isOwned ? 0x28dc78 : prereqMet ? 0xffa028 : 0x2d3a48;
        card.stroke({ color: borderCol, width: isEquipped ? 2.5 : 1.5 });
        card.eventMode = 'static';
        card.cursor = 'pointer';
        const openDetail = () => this.showFighterDetailModal(node.id);
        card.on('pointerdown', openDetail);
        this.uiLayer.addChild(card);

        // Fighter Sprite
        try {
          const fTex = await Assets.load(spec.sprite.replace(/^\//, ''));
          const fSp = new Sprite(fTex);
          fSp.anchor.set(0.5);
          if (node.isEagleSpecial) {
            fSp.width = 115;
            fSp.height = 150;
            fSp.position.set(node.x + 100, node.y + node.h / 2);
          } else if (node.id === 8) {
            fSp.width = 95;
            fSp.height = 76;
            fSp.position.set(node.x + node.w / 2, node.y + 55);
          } else {
            fSp.width = 75;
            fSp.height = 60;
            fSp.position.set(node.x + node.w / 2, node.y + 42);
          }
          if (!prereqMet && !isOwned) fSp.tint = 0x556677;
          fSp.eventMode = 'static';
          fSp.cursor = 'pointer';
          fSp.on('pointerdown', openDetail);
          this.uiLayer.addChild(fSp);
        } catch (err) {}

        const fI18n = (I18N[lang].fighters as any)[node.id];
        const fighterName = fI18n ? fI18n.name : spec.name;
        const fighterRole = fI18n ? fI18n.role : spec.role;

        const contentX = node.isEagleSpecial ? node.x + 210 : node.x + 8;
        const nameY = node.isEagleSpecial ? node.y + 16 : node.id === 8 ? node.y + 102 : node.y + 74;

        // Name
        const nameText = new Text({
          text: fighterName,
          style: new TextStyle({
            fill: 0xffffff,
            fontSize: node.isEagleSpecial ? 15 : 11,
            fontWeight: 'bold',
            fontFamily: 'Segoe UI, Microsoft YaHei',
            wordWrap: true,
            wordWrapWidth: node.isEagleSpecial ? node.w - 225 : node.w - 16
          })
        });
        nameText.position.set(contentX, nameY);
        nameText.eventMode = 'static';
        nameText.cursor = 'pointer';
        nameText.on('pointerdown', openDetail);
        this.uiLayer.addChild(nameText);

        // Role
        const roleText = new Text({
          text: fighterRole,
          style: new TextStyle({
            fill: isOwned ? 0x00f0ff : 0x8aa4be,
            fontSize: node.isEagleSpecial ? 11 : 9,
            fontFamily: 'Segoe UI, Microsoft YaHei',
            wordWrap: true,
            wordWrapWidth: node.isEagleSpecial ? node.w - 225 : node.w - 16
          })
        });
        roleText.position.set(contentX, nameY + (node.isEagleSpecial ? 24 : 18));
        roleText.eventMode = 'static';
        roleText.cursor = 'pointer';
        roleText.on('pointerdown', openDetail);
        this.uiLayer.addChild(roleText);

        // Stats
        const statsText = new Text({
          text: `HP:${spec.maxHp}  SPD:${spec.speed}  ATK:${spec.damage}  CD:${(spec.rollCooldown / 60).toFixed(1)}s`,
          style: new TextStyle({ fill: 0x90a8c0, fontSize: node.isEagleSpecial ? 11 : 9, fontFamily: 'Consolas' })
        });
        statsText.position.set(contentX, nameY + (node.isEagleSpecial ? 48 : 36));
        statsText.eventMode = 'static';
        statsText.cursor = 'pointer';
        statsText.on('pointerdown', openDetail);
        this.uiLayer.addChild(statsText);

        // Extra description for GUTS Eagle in its large card
        if (node.isEagleSpecial) {
          const descSnippet = new Text({
            text: lang === 'zh'
              ? '终极武器：新麦格斯·龙卷加农炮 (Tornado Thunder)\n三位一体空中合体 · 全机性能凌驾于EX-J之上的新领域时代神鹰！'
              : 'Ultimate Weapon: Neo-Maxima Tornado Thunder Cannon\nTri-docking aerial synthesis surpassing EX-J in all tactical specs.',
            style: new TextStyle({ fill: 0x7694b0, fontSize: 10, fontFamily: 'Segoe UI, Microsoft YaHei', lineHeight: 16 })
          });
          descSnippet.position.set(contentX, nameY + 70);
          this.uiLayer.addChild(descSnippet);
        }

        // Action Button
        const btnH = node.isEagleSpecial ? 36 : 26;
        const btnY = node.y + node.h - btnH - (node.isEagleSpecial ? 16 : 6);
        const btnW = node.isEagleSpecial ? 380 : node.w - 16;
        const btnX = node.isEagleSpecial ? contentX : node.x + 8;

        let btnLabel = '';
        let btnColor = 0x00f0ff;

        if (isEquipped) {
          btnLabel = hI18n.inService;
          btnColor = 0x28dc78;
        } else if (isOwned) {
          btnLabel = hI18n.equip;
          btnColor = 0x00f0ff;
        } else if (!prereqMet) {
          btnLabel = hI18n.lockedPrereq;
          btnColor = 0x556677;
        } else {
          btnLabel = hI18n.reqTpc(spec.price);
          btnColor = 0xffa028;
        }

        this.createButton(btnX, btnY, btnW, btnH, btnLabel, btnColor, () => {
          if (isOwned) {
            this.currentFighterId = node.id;
            sounds.playSfx('shoot', 0.8);
            this.showShop();
          } else if (!prereqMet) {
            if (node.isEagleSpecial) {
              alert(hI18n.eagleReqNotMet);
            } else {
              alert(hI18n.needPrereqAlert);
            }
          } else {
            if (this.saveManager.profile.amount >= spec.price) {
              this.saveManager.addFunds(-spec.price);
              this.saveManager.unlockFighter(node.id);
              if (node.id === 11) {
                if (this.saveManager.unlockMedal(7)) {
                  this.showMedalUnlockedToast(7);
                }
              }
              this.currentFighterId = node.id;
              sounds.playSfx('shoot', 0.9);
              this.showShop();
            } else {
              alert(hI18n.insufficientFundsAlert(spec.price, this.saveManager.profile.amount));
            }
          }
        });
      }
    }

    // Bottom Navigation Bar
    const navY = 810;
    if (canSwitchTpc) {
      this.createButton(40, navY, 200, 42, hI18n.switchToFleet, 0x00f0ff, () => {
        this.shopMode = 'default';
        this.showShop();
      });
    }

    this.createReturnButton(CANVAS_WIDTH - 200, navY, 160, 42, hI18n.returnMenu, () => this.showMainMenu());
  }

  // Fighter Technical Dossier Modal (Official Lore & Specs)
  private async showFighterDetailModal(fId: number) {
    const spec = FIGHTERS[fId];
    if (!spec) return;

    sounds.playMenu();
    this.modalLayer.removeChildren();

    const lang = getLanguage();
    const fI18n = (I18N[lang].fighters as any)[fId];
    const fighterName = fI18n ? fI18n.name : spec.name;
    const fighterRole = fI18n ? fI18n.role : spec.role;
    const fighterDesc = fI18n ? fI18n.desc : spec.desc;

    // Dark backdrop overlay
    const overlay = new Graphics();
    overlay.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    overlay.fill({ color: 0x000000, alpha: 0.78 });
    overlay.eventMode = 'static';
    overlay.cursor = 'pointer';
    overlay.on('pointerdown', () => this.modalLayer.removeChildren());
    this.modalLayer.addChild(overlay);

    // Modal Card (Enlarged to 620 x 560 to completely prevent text truncation or overflow)
    const modalW = 620;
    const modalH = 560;
    const modalX = Math.floor((CANVAS_WIDTH - modalW) / 2);
    const modalY = Math.floor((CANVAS_HEIGHT - modalH) / 2);

    const dialog = new Graphics();
    dialog.roundRect(modalX, modalY, modalW, modalH, 12);
    dialog.fill({ color: 0x0c1726, alpha: 0.98 });
    dialog.stroke({ color: spec.isGuts ? 0xff8c28 : 0x00c8ff, width: 2.2 });
    this.modalLayer.addChild(dialog);

    // Header Badge
    const headerTitle = lang === 'en' ? 'AIRCRAFT TECHNICAL DOSSIER' : '【TPC 机体绝密技术档案】';
    const header = new Text({
      text: headerTitle,
      style: new TextStyle({ fill: spec.isGuts ? 0xff8c28 : 0x00c8ff, fontSize: 13, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    header.position.set(modalX + 26, modalY + 22);
    this.modalLayer.addChild(header);

    // Fighter Sprite (Larger Preview)
    try {
      const fTex = await Assets.load(spec.sprite.replace(/^\//, ''));
      const fSp = new Sprite(fTex);
      fSp.anchor.set(0.5);
      fSp.width = 135;
      fSp.height = 105;
      fSp.position.set(modalX + 90, modalY + 105);
      this.modalLayer.addChild(fSp);
    } catch (e) {}

    // Name & Designation
    const nameText = new Text({
      text: fighterName,
      style: new TextStyle({ fill: 0xffffff, fontSize: 17, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    nameText.position.set(modalX + 175, modalY + 62);
    this.modalLayer.addChild(nameText);

    const roleText = new Text({
      text: fighterRole,
      style: new TextStyle({
        fill: spec.isGuts ? 0xffa028 : 0x00f0ff,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Segoe UI, Microsoft YaHei',
        wordWrap: true,
        wordWrapWidth: modalW - 200
      })
    });
    roleText.position.set(modalX + 175, modalY + 88);
    this.modalLayer.addChild(roleText);

    // Combat Performance Specs
    const rollSec = (spec.rollCooldown / 60).toFixed(1);
    const statsGrid = new Text({
      text: `${lang === 'en' ? 'Armored HP' : '装甲耐久'}: ${spec.maxHp}   |   ${lang === 'en' ? 'Speed' : '巡航极速'}: ${spec.speed}   |   ${lang === 'en' ? 'Attack' : '战力输出'}: ${spec.damage}\n${lang === 'en' ? 'Roll Cooldown' : '翻滚机动冷却'}: ${rollSec}s   |   ${lang === 'en' ? 'Weapon Code' : '火控代号'}: ${spec.code}`,
      style: new TextStyle({
        fill: 0x88a2bc,
        fontSize: 11,
        fontFamily: 'Consolas, Segoe UI',
        lineHeight: 20,
        wordWrap: true,
        wordWrapWidth: modalW - 200
      })
    });
    statsGrid.position.set(modalX + 175, modalY + 115);
    this.modalLayer.addChild(statsGrid);

    // Divider Line
    const div = new Graphics();
    div.moveTo(modalX + 26, modalY + 175);
    div.lineTo(modalX + modalW - 26, modalY + 175);
    div.stroke({ color: 0x22354c, width: 1.5 });
    this.modalLayer.addChild(div);

    // Lore Title
    const loreTitle = new Text({
      text: lang === 'en' ? 'CANONICAL ULTRA SERIES LORE & ARMAMENT:' : '【原著官方设定与技术履历】',
      style: new TextStyle({ fill: 0xffd232, fontSize: 12, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    loreTitle.position.set(modalX + 26, modalY + 192);
    this.modalLayer.addChild(loreTitle);

    // Detailed Lore Content
    const descText = new Text({
      text: fighterDesc,
      style: new TextStyle({
        fill: 0xdde8f5,
        fontSize: 13,
        fontFamily: 'Segoe UI, Microsoft YaHei',
        lineHeight: 25,
        wordWrap: true,
        wordWrapWidth: modalW - 60,
        breakWords: true
      })
    });
    descText.position.set(modalX + 30, modalY + 224);
    this.modalLayer.addChild(descText);

    // Close Button
    const closeBtnText = lang === 'en' ? 'CLOSE DOSSIER [ESC]' : '关闭档案 [ESC]';
    this.createModalButton(modalX + (modalW - 200) / 2, modalY + modalH - 58, 200, 42, closeBtnText, 0x00f0ff, () => {
      this.modalLayer.removeChildren();
    });
  }

  // ==========================================
  // SCENE 5: ZEN DAZUO / MUYU CLICKER
  // ==========================================
  public async showMuyu() {
    this.state = GameState.MUYU;
    sounds.playLian(); // Plays lian.mp3 reliably!
    this.clearAllLayers();

    const lang = getLanguage();
    const muyuI18n = I18N[lang].muyu;

    const bgTex = await Assets.load('assets/sprites/ui/muyu_zen_bg.jpg');
    const bgSprite = new Sprite(bgTex);
    bgSprite.width = CANVAS_WIDTH;
    bgSprite.height = CANVAS_HEIGHT;
    this.bgLayer.addChild(bgSprite);

    const header = new Text({
      text: muyuI18n.title,
      style: new TextStyle({ fill: 0xf0dcb4, fontSize: 14, fontFamily: 'Segoe UI, Microsoft YaHei', lineHeight: 22 })
    });
    header.position.set(40, 32);
    this.uiLayer.addChild(header);

    const fundsBox = new Graphics();
    fundsBox.roundRect(CANVAS_WIDTH - 220, 26, 180, 48, 6);
    fundsBox.fill({ color: 0x191612, alpha: 0.9 });
    fundsBox.stroke({ color: 0xe6be64, width: 1.5 });
    this.uiLayer.addChild(fundsBox);

    const fundsText = new Text({
      text: muyuI18n.funds(this.saveManager.profile.amount),
      style: new TextStyle({ fill: 0xffe696, fontSize: 13, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    fundsText.position.set(CANVAS_WIDTH - 210, 40);
    this.uiLayer.addChild(fundsText);

    const tip = new Text({
      text: muyuI18n.tip,
      style: new TextStyle({ fill: 0xc8bea8, fontSize: 13, fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    tip.position.set(CANVAS_WIDTH / 2 - tip.width / 2, 780);
    this.uiLayer.addChild(tip);

    const clickArea = new Graphics();
    clickArea.ellipse(CANVAS_WIDTH / 2, 700, 150, 75);
    clickArea.fill({ color: 0xffffff, alpha: 0.001 });
    clickArea.eventMode = 'static';
    clickArea.cursor = 'pointer';

    clickArea.on('pointerdown', (e) => {
      sounds.playMuyu();
      this.saveManager.addFunds(1);
      fundsText.text = muyuI18n.funds(this.saveManager.profile.amount);

      // Track Muyu clicks for Medal #10 (index 9)
      if (!this.saveManager.profile.stats) {
        this.saveManager.profile.stats = { totalRolls: 0, muyuClicks: 0, flankSquadronsKilled: 0 };
      }
      this.saveManager.profile.stats.muyuClicks = (this.saveManager.profile.stats.muyuClicks || 0) + 1;
      if (this.saveManager.profile.stats.muyuClicks >= 108) {
        if (this.saveManager.unlockMedal(9)) {
          this.showMedalUnlockedToast(9);
        }
      }
      // Check Treasury funds for Medal #11 (index 10)
      if (this.saveManager.profile.amount >= 10000) {
        if (this.saveManager.unlockMedal(10)) {
          this.showMedalUnlockedToast(10);
        }
      }
      this.saveManager.save();

      const clickX = e.global.x || CANVAS_WIDTH / 2;
      const clickY = e.global.y || 700;

      this.spawnGoldenRipple(CANVAS_WIDTH / 2, 690);
      this.spawnFloatingGongde(clickX, clickY - 40);
    });
    this.uiLayer.addChild(clickArea);

    this.createReturnButton(CANVAS_WIDTH / 2 - 90, 825, 180, 42, muyuI18n.returnMenu, () => this.showMainMenu());
  }

  private spawnGoldenRipple(centerX: number, centerY: number) {
    const rippleContainer = new Container();
    this.modalLayer.addChild(rippleContainer);

    const numRings = 4;
    const particles: { g: Graphics; x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[] = [];

    // Sparkle golden lotus dust particles
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.4;
      const speed = 2.0 + Math.random() * 4.5;
      const pg = new Graphics();
      const pSize = 2.5 + Math.random() * 2.5;
      pg.circle(0, 0, pSize);
      pg.fill({ color: Math.random() > 0.4 ? 0xffdf60 : 0xfffae0 });
      pg.position.set(centerX, centerY);
      rippleContainer.addChild(pg);

      particles.push({
        g: pg,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.7 - 0.8,
        life: 0,
        maxLife: 42 + Math.random() * 18,
        size: pSize
      });
    }

    const ringG = new Graphics();
    rippleContainer.addChild(ringG);

    let frame = 0;
    const maxFrames = 52;

    const rippleTicker = () => {
      frame++;
      const progress = frame / maxFrames;

      ringG.clear();

      // Soft central golden flash that fades quickly
      if (progress < 0.35) {
        const flashAlpha = (1 - progress / 0.35) * 0.5;
        ringG.ellipse(centerX, centerY, 50 * (1 + progress), 32 * (1 + progress));
        ringG.fill({ color: 0xffe888, alpha: flashAlpha });
      }

      // Multi-tier harmonic golden shockwave rings
      for (let r = 0; r < numRings; r++) {
        const ringOffset = r * 0.14;
        const ringProg = Math.max(0, Math.min(1, (progress - ringOffset) / (1 - ringOffset)));
        if (ringProg > 0 && ringProg < 1) {
          const radius = 20 + Math.pow(ringProg, 0.75) * 190;
          const alpha = Math.sin(ringProg * Math.PI) * 0.85;
          const strokeW = Math.max(1, 4.5 * (1 - ringProg));

          // Outer luminous halo
          ringG.ellipse(centerX, centerY, radius + 2, (radius + 2) * 0.62);
          ringG.stroke({ color: 0xffe680, width: strokeW + 2, alpha: alpha * 0.4 });

          // Crisp core ripple
          ringG.ellipse(centerX, centerY, radius, radius * 0.62);
          ringG.stroke({ color: 0xfff6c0, width: strokeW, alpha: alpha });
        }
      }

      particles.forEach(p => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.g.position.set(p.x, p.y);
        const pAlpha = Math.max(0, 1 - p.life / p.maxLife);
        p.g.alpha = pAlpha;
        p.g.scale.set(0.6 + pAlpha * 0.6);
      });

      if (frame >= maxFrames) {
        this.app.ticker.remove(rippleTicker);
        this.modalLayer.removeChild(rippleContainer);
        rippleContainer.destroy({ children: true });
      }
    };

    this.app.ticker.add(rippleTicker);
  }

  private spawnFloatingGongde(x: number, y: number) {
    const lang = getLanguage();
    const muyuI18n = I18N[lang].muyu;

    const text = new Text({
      text: muyuI18n.gongdePlus,
      style: new TextStyle({
        fill: 0xfffae0,
        fontSize: 27,
        fontWeight: 'bold',
        fontFamily: 'Segoe UI, Microsoft YaHei',
        stroke: { color: 0x8a5a00, width: 3 },
        dropShadow: { alpha: 0.9, blur: 8, color: 0xffc400, distance: 0 }
      })
    });
    text.anchor.set(0.5);
    text.position.set(x, y);
    text.scale.set(0.75); // Pop-in start
    this.modalLayer.addChild(text);

    let frame = 0;
    const startX = x;
    const wobbleOffset = (Math.random() - 0.5) * 2;

    const tickerFn = () => {
      frame++;
      // Pop-in scale bounce in first 8 frames
      if (frame <= 8) {
        const s = 0.75 + (frame / 8) * 0.45;
        text.scale.set(s);
      } else if (frame <= 14) {
        const s = 1.20 - ((frame - 8) / 6) * 0.20;
        text.scale.set(s);
      }

      // Elegant gentle upward float with sinusoidal drift
      text.y -= 1.95;
      text.x = startX + Math.sin(frame * 0.12 + wobbleOffset) * 6;
      text.alpha = Math.max(0, 1 - Math.pow(frame / 50, 1.4));

      if (frame >= 50) {
        this.app.ticker.remove(tickerFn);
        this.modalLayer.removeChild(text);
        text.destroy();
      }
    };
    this.app.ticker.add(tickerFn);
  }

  // ==========================================
  // SCENE 5.5: HALL OF VALOR & CITATIONS (MEDALS ROOM)
  // ==========================================
  // ==========================================
  // SCENE 5.5: HALL OF VALOR & CITATIONS (MEDALS ROOM - 2 PAGES)
  // ==========================================
  public async showMedalsRoom(page: number = 1) {
    this.state = GameState.MEDALS;
    sounds.playMenu();
    this.clearAllLayers();

    const lang = getLanguage();
    const medI18n = I18N[lang].medals;
    const curPage = Math.max(1, Math.min(2, page));
    const totalPages = 2;
    const itemsPerPage = 6;
    const startIndex = (curPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // High-tech Deep Blue/Dark Metallic Backdrop
    const bgG = new Graphics();
    bgG.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bgG.fill({ color: 0x080f1a });
    // Sci-fi structural cyber grid lines
    for (let gy = 0; gy < CANVAS_HEIGHT; gy += 40) {
      bgG.moveTo(0, gy);
      bgG.lineTo(CANVAS_WIDTH, gy);
      bgG.stroke({ color: 0x14283c, width: 0.6, alpha: 0.4 });
    }
    for (let gx = 0; gx < CANVAS_WIDTH; gx += 40) {
      bgG.moveTo(gx, 0);
      bgG.lineTo(gx, CANVAS_HEIGHT);
      bgG.stroke({ color: 0x14283c, width: 0.6, alpha: 0.4 });
    }
    this.bgLayer.addChild(bgG);

    // Header Title
    const headerTitle = new Text({
      text: `${medI18n.title}\n${medI18n.subtitle}`,
      style: new TextStyle({ fill: 0xffd700, fontSize: 15, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei', lineHeight: 22 })
    });
    headerTitle.position.set(40, 24);
    this.uiLayer.addChild(headerTitle);

    // Profile Medals Array (defaults to all locked if missing)
    const medalsList = this.saveManager.profile.medals || new Array(12).fill(false);
    const unlockedCount = medalsList.filter(Boolean).length;

    // Overview Status Card with Linear Perk Scaling Description
    const statusCard = new Graphics();
    statusCard.roundRect(40, 75, CANVAS_WIDTH - 80, 52, 6);
    statusCard.fill({ color: 0x0e1c2e, alpha: 0.9 });
    statusCard.stroke({ color: unlockedCount >= 12 ? 0xffd700 : 0x00c8ff, width: 1.5 });
    this.uiLayer.addChild(statusCard);

    const statusText = new Text({
      text: medI18n.overview(unlockedCount, 12),
      style: new TextStyle({ fill: 0xffe680, fontSize: 12, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    statusText.position.set(54, 82);
    this.uiLayer.addChild(statusText);

    const perkText = new Text({
      text: medI18n.buffDesc(unlockedCount),
      style: new TextStyle({ fill: unlockedCount > 0 ? 0x00f0ff : 0x8aa4be, fontSize: 10, fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    perkText.position.set(54, 104);
    this.uiLayer.addChild(perkText);

    // Grid Layout for 6 Medals per Page (3 columns x 2 rows)
    const cols = 3;
    const cardW = 204;
    const cardH = 268;
    const gapX = 12;
    const gapY = 12;
    const startX = Math.floor((CANVAS_WIDTH - (cols * cardW + (cols - 1) * gapX)) / 2);
    const startY = 140;

    // Medal Palette & Emblems (Procedural vector insignia with distinct shapes: round medals vs polygon orders)
    const medalThemes = [
      { color: 0x00e5ff, border: 0x00aacc, symbol: '🥇', rank: 'CLASS-I', shape: 'round' },
      { color: 0x3cd070, border: 0x289950, symbol: '🥉', rank: 'CLASS-V', shape: 'round' },
      { color: 0xffd700, border: 0xcca000, symbol: '🏆', rank: 'MASTER', shape: 'round' },
      { color: 0x80d8ff, border: 0x40a0ff, symbol: '⚡', rank: 'ELITE', shape: 'diamond' }, // Diamond tactical knight order
      { color: 0x00f0ff, border: 0x0088cc, symbol: '🛡️', rank: 'ARMOR', shape: 'shield' },  // Tactical aegis shield order
      { color: 0xff3b10, border: 0xcc2200, symbol: '💥', rank: 'DESTROY', shape: 'cross' },  // Iron cross starburst order
      { color: 0xfffae0, border: 0xffd700, symbol: '✨', rank: 'MYSTIC', shape: 'star' },    // Octagonal Tiga starburst order
      { color: 0xff9900, border: 0xcc6600, symbol: '🛸', rank: 'ULTIMATE', shape: 'hex' },   // Mecha hexagonal bastion order
      { color: 0x00ffcc, border: 0x009988, symbol: '🎯', rank: 'SNIPER', shape: 'round' },
      { color: 0xe6be64, border: 0xaa8833, symbol: '🧘', rank: 'ZEN', shape: 'round' },
      { color: 0xffbb00, border: 0xbb8800, symbol: '💰', rank: 'TREASURE', shape: 'round' },
      { color: 0xff00e5, border: 0xffd700, symbol: '👑', rank: 'SUPREME', shape: 'grand' }   // Supreme winged crown order
    ];

    for (let idx = startIndex; idx < endIndex && idx < 12; idx++) {
      const pageLocalIdx = idx - startIndex;
      const col = pageLocalIdx % cols;
      const row = Math.floor(pageLocalIdx / cols);
      const mx = startX + col * (cardW + gapX);
      const my = startY + row * (cardH + gapY);

      const isUnlocked = medalsList[idx] === true;
      const itemData = medI18n.items[idx];
      const theme = medalThemes[idx];

      const mCard = new Graphics();
      mCard.roundRect(mx, my, cardW, cardH, 8);
      const mBg = isUnlocked ? 0x0e1c2c : 0x070c14;
      mCard.fill({ color: mBg, alpha: 0.95 });
      const borderCol = isUnlocked ? theme.border : 0x223040;
      mCard.stroke({ color: borderCol, width: isUnlocked ? 2 : 1 });
      this.uiLayer.addChild(mCard);

      const openInspect = () => this.openMedalInspect3D(idx);
      mCard.eventMode = 'static';
      mCard.cursor = 'pointer';
      mCard.on('pointerdown', openInspect);

      // Medal Insignia Center Box (Slightly more compact to provide more space for text)
      const iconBox = new Graphics();
      iconBox.roundRect(mx + (cardW - 68) / 2, my + 10, 68, 64, 8);
      iconBox.fill({ color: isUnlocked ? 0x162c44 : 0x0a1018 });
      iconBox.stroke({ color: isUnlocked ? theme.color : 0x1e2b38, width: 1.5 });
      iconBox.eventMode = 'static';
      iconBox.cursor = 'pointer';
      iconBox.on('pointerdown', openInspect);
      this.uiLayer.addChild(iconBox);

      // Radiating soft glow for unlocked medals
      if (isUnlocked) {
        const glow = new Graphics();
        glow.circle(mx + cardW / 2, my + 42, 28);
        glow.fill({ color: theme.color, alpha: 0.18 });
        this.uiLayer.addChild(glow);
      }

      // Symbol
      const symText = new Text({
        text: isUnlocked ? theme.symbol : '🔒',
        style: new TextStyle({ fontSize: 28, align: 'center' })
      });
      symText.anchor.set(0.5);
      symText.position.set(mx + cardW / 2, my + 42);
      symText.eventMode = 'static';
      symText.cursor = 'pointer';
      symText.on('pointerdown', openInspect);
      this.uiLayer.addChild(symText);

      // Rank Tag
      const rankTag = new Text({
        text: isUnlocked ? theme.rank : 'LOCKED',
        style: new TextStyle({
          fill: isUnlocked ? theme.color : 0x506478,
          fontSize: 9,
          fontWeight: 'bold',
          fontFamily: 'Consolas, Segoe UI'
        })
      });
      rankTag.anchor.set(0.5, 0);
      rankTag.position.set(mx + cardW / 2, my + 82);
      this.uiLayer.addChild(rankTag);

      // Medal Name
      const nameText = new Text({
        text: isUnlocked ? itemData.name : medI18n.lockedName,
        style: new TextStyle({
          fill: isUnlocked ? 0xffffff : 0x68788c,
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: 'Segoe UI, Microsoft YaHei',
          wordWrap: true,
          wordWrapWidth: cardW - 14,
          breakWords: true,
          align: 'center'
        })
      });
      nameText.anchor.set(0.5, 0);
      nameText.position.set(mx + cardW / 2, my + 99);
      nameText.eventMode = 'static';
      nameText.cursor = 'pointer';
      nameText.on('pointerdown', openInspect);
      this.uiLayer.addChild(nameText);

      // Divider inside card
      const lineG = new Graphics();
      lineG.moveTo(mx + 16, my + 128);
      lineG.lineTo(mx + cardW - 16, my + 128);
      lineG.stroke({ color: isUnlocked ? 0x1e3650 : 0x141e2a, width: 1 });
      this.uiLayer.addChild(lineG);

      // Medal Description (Spacious area, strictly no overflow, auto-fitted font, breakWords: true)
      const descLen = (isUnlocked ? itemData.desc : medI18n.lockedDesc).length;
      const descFontSize = descLen > 40 ? 9.5 : descLen > 24 ? 10.5 : 11;
      const descLineHeight = descLen > 40 ? 15 : 17;

      const descText = new Text({
        text: isUnlocked ? itemData.desc : medI18n.lockedDesc,
        style: new TextStyle({
          fill: isUnlocked ? 0xa8c2dc : 0x485868,
          fontSize: descFontSize,
          fontFamily: 'Segoe UI, Microsoft YaHei',
          lineHeight: descLineHeight,
          wordWrap: true,
          wordWrapWidth: cardW - 20,
          breakWords: true,
          align: 'center'
        })
      });
      descText.anchor.set(0.5, 0);
      descText.position.set(mx + cardW / 2, my + 138);
      descText.eventMode = 'static';
      descText.cursor = 'pointer';
      descText.on('pointerdown', openInspect);
      this.uiLayer.addChild(descText);
    }

    // Bottom Navigation & Pagination Bar
    const navY = 708;

    // Previous Page Button
    if (curPage > 1) {
      this.createButton(40, navY, 140, 42, medI18n.prevPage, 0x00f0ff, () => {
        this.showMedalsRoom(curPage - 1);
      });
    }

    // Page Indicator Text
    const pageIndicator = new Text({
      text: medI18n.pageText(curPage, totalPages),
      style: new TextStyle({ fill: 0xffe680, fontSize: 13, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    pageIndicator.anchor.set(0.5);
    pageIndicator.position.set(CANVAS_WIDTH / 2, navY + 21);
    this.uiLayer.addChild(pageIndicator);

    // Next Page Button
    if (curPage < totalPages) {
      this.createButton(CANVAS_WIDTH - 180, navY, 140, 42, medI18n.nextPage, 0x00f0ff, () => {
        this.showMedalsRoom(curPage + 1);
      });
    }

    // Return to Menu Button
    this.createReturnButton(CANVAS_WIDTH / 2 - 90, 765, 180, 42, medI18n.returnMenu, () => {
      this.showMainMenu();
    });
  }

  // ==========================================
  // 3D HOLOGRAPHIC MEDAL INSPECTOR SHOWCASE (360-degree Rotational Depth - Orders vs Medals)
  // ==========================================
  private openMedalInspect3D(medalIndex: number) {
    sounds.playMenu();
    this.modalLayer.removeChildren();

    const lang = getLanguage();
    const medI18n = I18N[lang].medals;
    const isUnlocked = (this.saveManager.profile.medals && this.saveManager.profile.medals[medalIndex]) ?? false;
    const itemData = medI18n.items[medalIndex];

    const medalThemes = [
      { color: 0x00e5ff, border: 0x00aacc, symbol: '🥇', rank: 'CLASS-I', shape: 'round' },
      { color: 0x3cd070, border: 0x289950, symbol: '🥉', rank: 'CLASS-V', shape: 'round' },
      { color: 0xffd700, border: 0xcca000, symbol: '🏆', rank: 'MASTER', shape: 'round' },
      { color: 0x80d8ff, border: 0x40a0ff, symbol: '⚡', rank: 'ELITE', shape: 'diamond' },
      { color: 0x00f0ff, border: 0x0088cc, symbol: '🛡️', rank: 'ARMOR', shape: 'shield' },
      { color: 0xff3b10, border: 0xcc2200, symbol: '💥', rank: 'DESTROY', shape: 'cross' },
      { color: 0xfffae0, border: 0xffd700, symbol: '✨', rank: 'MYSTIC', shape: 'star' },
      { color: 0xff9900, border: 0xcc6600, symbol: '🛸', rank: 'ULTIMATE', shape: 'hex' },
      { color: 0x00ffcc, border: 0x009988, symbol: '🎯', rank: 'SNIPER', shape: 'round' },
      { color: 0xe6be64, border: 0xaa8833, symbol: '🧘', rank: 'ZEN', shape: 'round' },
      { color: 0xffbb00, border: 0xbb8800, symbol: '💰', rank: 'TREASURE', shape: 'round' },
      { color: 0xff00e5, border: 0xffd700, symbol: '👑', rank: 'SUPREME', shape: 'grand' }
    ];
    const theme = medalThemes[medalIndex] || medalThemes[0];

    // 1. Semi-transparent Cinema Gray Backdrop
    const backdrop = new Graphics();
    backdrop.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    backdrop.fill({ color: 0x0a0c10, alpha: 0.88 });
    backdrop.eventMode = 'static';
    backdrop.cursor = 'pointer';
    this.modalLayer.addChild(backdrop);

    // 2. Volumetric Central Spotlight Beam
    const spotG = new Graphics();
    spotG.poly([
      { x: CANVAS_WIDTH / 2 - 70, y: 0 },
      { x: CANVAS_WIDTH / 2 + 70, y: 0 },
      { x: CANVAS_WIDTH / 2 + 250, y: CANVAS_HEIGHT },
      { x: CANVAS_WIDTH / 2 - 250, y: CANVAS_HEIGHT }
    ]);
    spotG.fill({ color: theme.color, alpha: 0.05 });
    this.modalLayer.addChild(spotG);

    // 3. Central Stage Container for 3D Medal
    const stageCont = new Container();
    this.modalLayer.addChild(stageCont);

    // 3D Layers
    const medalRimG = new Graphics();
    const medalFrontG = new Graphics();
    const medalBackG = new Graphics();
    stageCont.addChild(medalRimG);
    stageCont.addChild(medalBackG);
    stageCont.addChild(medalFrontG);

    const medalSymbol = new Text({
      text: isUnlocked ? theme.symbol : '🔒',
      style: new TextStyle({ fontSize: 62, align: 'center' })
    });
    medalSymbol.anchor.set(0.5);
    stageCont.addChild(medalSymbol);

    const backText = new Text({
      text: `TPC FAR-EAST\nHONOR MEDAL\n#${medalIndex + 1}`,
      style: new TextStyle({
        fill: 0xffd700,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'Consolas, Segoe UI',
        align: 'center',
        lineHeight: 20
      })
    });
    backText.anchor.set(0.5);
    stageCont.addChild(backText);

    // 4. Modal Info Text & Action Below
    const infoCont = new Container();
    this.modalLayer.addChild(infoCont);

    const titleText = new Text({
      text: isUnlocked ? itemData.name : medI18n.lockedName,
      style: new TextStyle({
        fill: 0xffffff,
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Segoe UI, Microsoft YaHei',
        dropShadow: { alpha: 0.8, color: theme.color, blur: 10, distance: 0 }
      })
    });
    titleText.anchor.set(0.5, 0);
    titleText.position.set(CANVAS_WIDTH / 2, 530);
    infoCont.addChild(titleText);

    const rankBadge = new Text({
      text: `[ ${theme.rank} // CITATION CIT-0${medalIndex + 1} ]`,
      style: new TextStyle({ fill: theme.color, fontSize: 13, fontWeight: 'bold', fontFamily: 'Consolas, Segoe UI' })
    });
    rankBadge.anchor.set(0.5, 0);
    rankBadge.position.set(CANVAS_WIDTH / 2, 565);
    infoCont.addChild(rankBadge);

    const descCard = new Graphics();
    descCard.roundRect(CANVAS_WIDTH / 2 - 250, 592, 500, 96, 8);
    descCard.fill({ color: 0x101a28, alpha: 0.92 });
    descCard.stroke({ color: theme.border, width: 1.5 });
    infoCont.addChild(descCard);

    const fullDescText = new Text({
      text: isUnlocked ? itemData.desc : medI18n.lockedDesc,
      style: new TextStyle({
        fill: 0xd6e5f5,
        fontSize: 12.5,
        fontFamily: 'Segoe UI, Microsoft YaHei',
        lineHeight: 20,
        wordWrap: true,
        wordWrapWidth: 460,
        breakWords: true,
        align: 'center'
      })
    });
    fullDescText.anchor.set(0.5, 0);
    fullDescText.position.set(CANVAS_WIDTH / 2, 606);
    infoCont.addChild(fullDescText);

    const dragTip = new Text({
      text: lang === 'en' ? '◀ DRAG TO INSPECT 360° | CLICK ANYWHERE TO CLOSE ▶' : '◀ 可按住拖拽 360° 旋转检视 | 点击任意处关闭 ▶',
      style: new TextStyle({ fill: 0x88a4c0, fontSize: 11, fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    dragTip.anchor.set(0.5, 0);
    dragTip.position.set(CANVAS_WIDTH / 2, 702);
    infoCont.addChild(dragTip);

    this.createModalButton(CANVAS_WIDTH / 2 - 90, 740, 180, 42, lang === 'en' ? 'CLOSE [ESC]' : '关闭检视 [ESC]', 0x00f0ff, () => {
      cleanup();
    });

    // 5. 3D Extrusion & Rotational Animation State
    let angle = 0;
    let autoRotate = true;
    let isDragging = false;
    let lastPointerX = 0;
    let startPointerX = 0;
    let startPointerY = 0;
    let hasDragged = false;
    const centerY = 330;
    const centerX = CANVAS_WIDTH / 2;
    const medalRadius = 120;
    const thickness = 32; // Enhanced metal extrusion depth!

    backdrop.cursor = 'grab';

    // Interactive Drag to Rotate vs. Click to Close
    const onPointerDown = (e: any) => {
      isDragging = true;
      hasDragged = false;
      autoRotate = false;
      backdrop.cursor = 'grabbing';
      startPointerX = e.global.x;
      startPointerY = e.global.y;
      lastPointerX = e.global.x;
    };

    const onPointerMove = (e: any) => {
      if (isDragging) {
        const dx = e.global.x - lastPointerX;
        lastPointerX = e.global.x;
        const totalDist = Math.hypot(e.global.x - startPointerX, e.global.y - startPointerY);
        if (totalDist > 6) {
          hasDragged = true;
        }
        angle += dx * 0.014;
      }
    };

    const onPointerUp = (e: any) => {
      if (!isDragging) return;
      isDragging = false;
      autoRotate = true;
      backdrop.cursor = 'grab';

      // If released without significant drag, it's a click to close!
      if (!hasDragged) {
        cleanup();
      }
    };

    backdrop.on('pointerdown', onPointerDown);
    backdrop.on('pointermove', onPointerMove);
    backdrop.on('pointerup', onPointerUp);
    backdrop.on('pointerupoutside', onPointerUp);

    // Shape vertex generators based on geometric Order archetype
    const getBasePoints = (shape: string, r: number): Array<{ x: number; y: number }> => {
      const pts: Array<{ x: number; y: number }> = [];
      if (shape === 'diamond') {
        pts.push({ x: 0, y: -r * 1.25 });
        pts.push({ x: r * 0.85, y: 0 });
        pts.push({ x: 0, y: r * 1.25 });
        pts.push({ x: -r * 0.85, y: 0 });
      } else if (shape === 'shield') {
        pts.push({ x: -r * 0.88, y: -r * 0.95 });
        pts.push({ x: r * 0.88, y: -r * 0.95 });
        pts.push({ x: r * 0.85, y: r * 0.25 });
        pts.push({ x: 0, y: r * 1.2 });
        pts.push({ x: -r * 0.85, y: r * 0.25 });
      } else if (shape === 'cross') {
        const w1 = r * 0.38;
        const w2 = r * 0.95;
        pts.push({ x: -w1, y: -w2 }, { x: w1, y: -w2 }, { x: w1, y: -w1 });
        pts.push({ x: w2, y: -w1 }, { x: w2, y: w1 }, { x: w1, y: w1 });
        pts.push({ x: w1, y: w2 }, { x: -w1, y: w2 }, { x: -w1, y: w1 });
        pts.push({ x: -w2, y: w1 }, { x: -w2, y: -w1 }, { x: -w1, y: -w1 });
      } else if (shape === 'star') {
        for (let i = 0; i < 16; i++) {
          const ang = (i * Math.PI) / 8 - Math.PI / 2;
          const rad = i % 2 === 0 ? r * 1.15 : r * 0.62;
          pts.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad });
        }
      } else if (shape === 'hex') {
        for (let i = 0; i < 6; i++) {
          const ang = (i * Math.PI) / 3 - Math.PI / 6;
          pts.push({ x: Math.cos(ang) * r * 1.05, y: Math.sin(ang) * r * 1.05 });
        }
      } else if (shape === 'grand') {
        // Supreme Crown Star Order (12-pointed radiant grand crest)
        for (let i = 0; i < 16; i++) {
          const ang = (i * Math.PI) / 8 - Math.PI / 2;
          const rad = i % 2 === 0 ? r * 1.22 : (i % 4 === 1 ? r * 0.75 : r * 0.55);
          pts.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad });
        }
      }
      return pts;
    };

    const basePts = theme.shape !== 'round' ? getBasePoints(theme.shape, medalRadius) : [];
    const innerPts = theme.shape !== 'round' ? getBasePoints(theme.shape, medalRadius - 16) : [];

    // Render loop for 3D medal/order extrusion
    const tickerFn = () => {
      if (autoRotate) {
        angle += 0.010; // Graceful relaxed 360-degree spin
      }

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const isFacingFront = cosA >= 0;

      // Floating harmonic bobbing
      const floatY = centerY + Math.sin(angle * 1.5) * 6;

      medalRimG.clear();
      medalFrontG.clear();
      medalBackG.clear();

      const isRound = theme.shape === 'round';

      // A. Extruded Depth Slices (Multi-layer 2.5D Rim)
      const depthLayers = 18;
      const rimAlpha = Math.min(1.0, Math.abs(sinA) * 1.5);
      if (rimAlpha > 0.02) {
        for (let i = -depthLayers / 2; i <= depthLayers / 2; i++) {
          const zOffset = (i / (depthLayers / 2)) * (thickness / 2);
          const sliceX = centerX + zOffset * sinA;
          const sliceCol = isUnlocked ? (i % 2 === 0 ? 0x9c7a18 : 0xd2ae36) : 0x222a36;

          if (isRound) {
            medalRimG.ellipse(sliceX, floatY, medalRadius * Math.abs(cosA), medalRadius);
            medalRimG.stroke({ color: sliceCol, width: 2, alpha: rimAlpha * 0.75 });
          } else {
            const projected = basePts.map(p => ({ x: sliceX + p.x * cosA, y: floatY + p.y }));
            medalRimG.poly(projected);
            medalRimG.stroke({ color: sliceCol, width: 2, alpha: rimAlpha * 0.75 });
          }
        }
      }

      // B. Back Face (Visible when cosA < 0)
      if (!isFacingFront) {
        const backScaleX = Math.abs(cosA);
        if (isRound) {
          medalBackG.ellipse(centerX, floatY, medalRadius * backScaleX, medalRadius);
          medalBackG.fill({ color: isUnlocked ? 0x1f190d : 0x0d1219, alpha: 0.98 });
          medalBackG.stroke({ color: isUnlocked ? 0xffc828 : 0x334455, width: 4.5 });

          medalBackG.ellipse(centerX, floatY, (medalRadius - 18) * backScaleX, medalRadius - 18);
          medalBackG.stroke({ color: isUnlocked ? 0xaa8820 : 0x243040, width: 1.5, alpha: 0.8 });
        } else {
          const projected = basePts.map(p => ({ x: centerX + p.x * cosA, y: floatY + p.y }));
          medalBackG.poly(projected);
          medalBackG.fill({ color: isUnlocked ? 0x1f190d : 0x0d1219, alpha: 0.98 });
          medalBackG.stroke({ color: isUnlocked ? 0xffc828 : 0x334455, width: 4.5 });

          const projInner = innerPts.map(p => ({ x: centerX + p.x * cosA, y: floatY + p.y }));
          medalBackG.poly(projInner);
          medalBackG.stroke({ color: isUnlocked ? 0xaa8820 : 0x243040, width: 1.5, alpha: 0.8 });
        }

        backText.visible = true;
        backText.position.set(centerX, floatY);
        backText.scale.set(backScaleX, 1);
        medalSymbol.visible = false;
      } else {
        // C. Front Face (Visible when cosA >= 0)
        const frontScaleX = cosA;
        if (isRound) {
          medalFrontG.ellipse(centerX, floatY, medalRadius * frontScaleX, medalRadius);
          medalFrontG.fill({ color: isUnlocked ? 0x132235 : 0x080f16, alpha: 0.98 });
          medalFrontG.stroke({ color: isUnlocked ? theme.border : 0x28384a, width: 4.5 });

          medalFrontG.ellipse(centerX, floatY, (medalRadius - 16) * frontScaleX, medalRadius - 16);
          medalFrontG.stroke({ color: isUnlocked ? theme.color : 0x3a4c60, width: 2 });
          medalFrontG.fill({ color: isUnlocked ? 0x0f2942 : 0x0c1622, alpha: 0.8 });

          const sweepProgress = (Math.sin(angle * 2) + 1) * 0.5;
          const sweepX = centerX + (sweepProgress - 0.5) * (medalRadius * 1.5) * frontScaleX;
          if (Math.abs(sweepX - centerX) < medalRadius * frontScaleX * 0.85) {
            medalFrontG.ellipse(sweepX, floatY, 22 * frontScaleX, medalRadius * 0.82);
            medalFrontG.fill({ color: 0xffffff, alpha: 0.22 * frontScaleX });
          }
        } else {
          const projected = basePts.map(p => ({ x: centerX + p.x * frontScaleX, y: floatY + p.y }));
          medalFrontG.poly(projected);
          medalFrontG.fill({ color: isUnlocked ? 0x132235 : 0x080f16, alpha: 0.98 });
          medalFrontG.stroke({ color: isUnlocked ? theme.border : 0x28384a, width: 4.5 });

          const projInner = innerPts.map(p => ({ x: centerX + p.x * frontScaleX, y: floatY + p.y }));
          medalFrontG.poly(projInner);
          medalFrontG.stroke({ color: isUnlocked ? theme.color : 0x3a4c60, width: 2 });
          medalFrontG.fill({ color: isUnlocked ? 0x0f2942 : 0x0c1622, alpha: 0.8 });

          const sweepProgress = (Math.sin(angle * 2) + 1) * 0.5;
          const sweepX = centerX + (sweepProgress - 0.5) * (medalRadius * 1.5) * frontScaleX;
          if (Math.abs(sweepX - centerX) < medalRadius * frontScaleX * 0.85) {
            medalFrontG.ellipse(sweepX, floatY, 22 * frontScaleX, medalRadius * 0.82);
            medalFrontG.fill({ color: 0xffffff, alpha: 0.22 * frontScaleX });
          }
        }

        medalSymbol.visible = true;
        medalSymbol.position.set(centerX, floatY);
        medalSymbol.scale.set(frontScaleX, 1);
        backText.visible = false;
      }
    };

    this.app.ticker.add(tickerFn);

    const cleanup = () => {
      this.app.ticker.remove(tickerFn);
      this.modalLayer.removeChildren();
    };
  }

  // ==========================================
  // REAL-TIME ACHIEVEMENT BANNER TOAST (NON-BLOCKING)
  // ==========================================
  public showMedalUnlockedToast(medalIndex: number) {
    const lang = getLanguage();
    const medI18n = I18N[lang].medals;
    const itemData = medI18n.items[medalIndex];
    if (!itemData) return;

    sounds.playSfx('ding', 0.95);

    const medalThemes = [
      { color: 0x00e5ff, border: 0x00aacc, symbol: '🥇' },
      { color: 0x3cd070, border: 0x289950, symbol: '🥉' },
      { color: 0xffd700, border: 0xcca000, symbol: '🏆' },
      { color: 0x80d8ff, border: 0x40a0ff, symbol: '⚡' },
      { color: 0x00f0ff, border: 0x0088cc, symbol: '🛡️' },
      { color: 0xff3b10, border: 0xcc2200, symbol: '💥' },
      { color: 0xfffae0, border: 0xffd700, symbol: '✨' },
      { color: 0xff9900, border: 0xcc6600, symbol: '🛸' },
      { color: 0x00ffcc, border: 0x009988, symbol: '🎯' },
      { color: 0xe6be64, border: 0xaa8833, symbol: '🧘' },
      { color: 0xffbb00, border: 0xbb8800, symbol: '💰' },
      { color: 0xff00e5, border: 0xffd700, symbol: '👑' }
    ];
    const theme = medalThemes[medalIndex] || medalThemes[0];

    const toastCont = new Container();
    this.toastLayer.addChild(toastCont);

    const bannerW = 380;
    const bannerH = 68;
    const bannerX = (CANVAS_WIDTH - bannerW) / 2;
    const targetY = 24;
    const startY = -80;

    toastCont.position.set(0, startY);

    // Banner Background with sci-fi gold/cyan border
    const cardG = new Graphics();
    cardG.roundRect(bannerX, 0, bannerW, bannerH, 8);
    cardG.fill({ color: 0x0b1320, alpha: 0.96 });
    cardG.stroke({ color: theme.color, width: 2 });
    toastCont.addChild(cardG);

    // Left Icon Frame & Symbol
    const iconFrame = new Graphics();
    iconFrame.roundRect(bannerX + 10, 9, 50, 50, 6);
    iconFrame.fill({ color: 0x142338, alpha: 0.95 });
    iconFrame.stroke({ color: theme.color, width: 1.5 });
    toastCont.addChild(iconFrame);

    const sym = new Text({
      text: theme.symbol,
      style: new TextStyle({ fontSize: 26, align: 'center' })
    });
    sym.anchor.set(0.5);
    sym.position.set(bannerX + 35, 34);
    toastCont.addChild(sym);

    // Subtitle & Title Texts
    const subText = new Text({
      text: medI18n.toastTitle,
      style: new TextStyle({ fill: 0xffd700, fontSize: 11, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    subText.position.set(bannerX + 70, 14);
    toastCont.addChild(subText);

    const titleText = new Text({
      text: itemData.name,
      style: new TextStyle({ fill: 0xffffff, fontSize: 14, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    titleText.position.set(bannerX + 70, 36);
    toastCont.addChild(titleText);

    // Gold Sweep & Sparkle particle effects
    const sweepG = new Graphics();
    toastCont.addChild(sweepG);

    // Animation Lifecycle
    let frame = 0;
    const totalFrames = 220; // ~3.6s
    const animTicker = (ticker: { deltaTime: number }) => {
      frame += ticker.deltaTime || 1;

      // 1. Slide in from top with ease-out bounce
      if (frame <= 20) {
        const t = frame / 20;
        // Ease out back
        const c1 = 1.70158;
        const c3 = c1 + 1;
        const ease = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        toastCont.y = startY + (targetY - startY) * Math.min(1.05, ease);
        toastCont.alpha = Math.min(1, t * 1.5);
      } else if (frame <= 190) {
        toastCont.y = targetY;
        toastCont.alpha = 1;

        // Light sweep shimmer across the banner
        sweepG.clear();
        const sweepProg = ((frame - 20) % 90) / 90;
        const sweepX = bannerX + sweepProg * bannerW;
        sweepG.moveTo(sweepX - 20, 2);
        sweepG.lineTo(sweepX + 15, 2);
        sweepG.lineTo(sweepX - 5, bannerH - 2);
        sweepG.lineTo(sweepX - 40, bannerH - 2);
        sweepG.fill({ color: 0xffffff, alpha: 0.15 * Math.sin(sweepProg * Math.PI) });
      } else if (frame <= totalFrames) {
        // 2. Slide up and fade out
        const t = (frame - 190) / (totalFrames - 190);
        toastCont.y = targetY - t * 40;
        toastCont.alpha = Math.max(0, 1 - t);
      } else {
        this.app.ticker.remove(animTicker);
        this.toastLayer.removeChild(toastCont);
        toastCont.destroy({ children: true });
      }
    };

    this.app.ticker.add(animTicker);
  }

  // ==========================================
  // SCENE 6: ACTIVE COMBAT ENGINE
  // ==========================================
  public async startBattle(stageId: number) {
    this.isTransitioning = true;
    this.currentStageId = stageId;
    this.stageTime = 0;
    this.spawnTicker = 0;
    this.score = 0; // Strictly reset score to 0!
    this.stageTookDamage = false;
    this.killedBossDuringBeam = false;
    this.bullets = [];
    this.enemies = [];
    this.boss = null;
    this.bossSpawned = false;
    this.stage5Phase2Triggered = false;
    this.stage8Phase2Triggered = false;
    this.isStageEnding = false;
    this.explosions = [];
    this.isRolling = false;
    this.rollTimer = 0;
    this.rollCooldownTimer = 0;
    this.maxCannonChargeCount = 0;
    this.isWhiteoutActive = false;
    this.whiteoutProgress = 0;
    this.whiteoutHoldTimer = 0;
    this.whiteoutSfxTriggered = false;
    if (this.whiteoutGfx) {
      this.whiteoutGfx.clear();
      this.whiteoutGfx.position.set(0, 0);
    }

    // Music selection: GUTS Eagle (id 12) plays dyna.mp3 (except in Stage 5 Tiga Easter Egg & Stage 8 Finale)
    if (stageId === 5) {
      sounds.playBgm('love_theme_from_tiga.mp3');
    } else if (stageId === 8) {
      sounds.playStageBgm(8);
    } else if (this.currentFighterId === 12) {
      sounds.playBgm('dyna.mp3');
    } else {
      sounds.playStageBgm(stageId);
    }
    this.clearAllLayers();

    const stageSpec = STAGES[stageId] || STAGES[1];
    const fighterSpec = FIGHTERS[this.currentFighterId] || FIGHTERS[0];

    // Linear Medal Buff Scaling: each unlocked medal grants +1.5% max HP and -0.025s roll CD
    const medalsList = this.saveManager.profile.medals || new Array(12).fill(false);
    const medalCount = medalsList.filter(Boolean).length;
    const hpBonusMult = 1.0 + (medalCount * 0.015); // +1.5% HP per medal (up to +18%)

    this.playerHp = Math.round(fighterSpec.maxHp * hpBonusMult);
    this.playerMaxHp = this.playerHp;
    this.playerSpeed = fighterSpec.speed;

    let initialBg = stageSpec.bgSprite;
    const bgTex = await Assets.load(initialBg.replace(/^\//, ''));
    this.bgSprite1 = new Sprite(bgTex);
    this.bgSprite1.width = CANVAS_WIDTH;
    this.bgSprite1.height = CANVAS_HEIGHT;
    this.bgSprite1.position.set(0, 0);

    this.bgSprite2 = new Sprite(bgTex);
    this.bgSprite2.width = CANVAS_WIDTH;
    this.bgSprite2.height = CANVAS_HEIGHT;
    this.bgSprite2.position.set(0, -CANVAS_HEIGHT);

    this.bgLayer.addChild(this.bgSprite1);
    this.bgLayer.addChild(this.bgSprite2);
    this.bgScrollSpeed = stageSpec.scrollSpeed;

    const pTex = await Assets.load(fighterSpec.sprite.replace(/^\//, ''));
    this.playerSprite = new Sprite(pTex);
    this.playerSprite.anchor.set(0.5);
    this.baseScaleX = fighterSpec.width / pTex.width;
    this.baseScaleY = fighterSpec.height / pTex.height;
    this.playerSprite.scale.set(this.baseScaleX, this.baseScaleY);
    this.playerSprite.position.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 120);
    this.gameLayer.addChild(this.playerSprite);

    // Dynamic charging particle effects
    this.chargeEffectGfx = new Graphics();
    this.gameLayer.addChild(this.chargeEffectGfx);
    this.bossChargeEffectGfx = new Graphics();
    this.gameLayer.addChild(this.bossChargeEffectGfx);

    // Dark Mist Particle Layer for Stage 5 Phase 1 (Monte Carlo sampled organic shapes)
    if (stageId === 5) {
      this.darkMistGfx = new Graphics();
      this.gameLayer.addChild(this.darkMistGfx);
      this.darkMistParticles = [];

      // Spawn 9-11 wandering dark mist clouds composed entirely of organic curvilinear puffs
      for (let i = 0; i < 10; i++) {
        // Compose each cloud of 14-18 overlapping circular puffs with Monte Carlo dispersion
        const puffs: Array<{ ox: number; oy: number; r: number; alphaMult: number }> = [];
        const numPuffs = 14 + Math.floor(Math.random() * 5);
        const cloudRadius = 65 + Math.random() * 30;

        for (let j = 0; j < numPuffs; j++) {
          // Monte Carlo distribution: denser towards center, soft falloff outward
          const u = Math.random();
          const dist = Math.sqrt(u) * cloudRadius;
          const theta = Math.random() * Math.PI * 2;
          const puffRadius = 30 + Math.random() * 40;
          // Outer puffs softer, inner puffs darker
          const alphaMult = 0.35 + (1 - dist / (cloudRadius + 1)) * 0.45;

          puffs.push({
            ox: Math.cos(theta) * dist,
            oy: Math.sin(theta) * dist,
            r: puffRadius,
            alphaMult
          });
        }

        this.darkMistParticles.push({
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT,
          vx: (Math.random() - 0.5) * 0.8,
          vy: Math.random() * 1.3 + 0.8,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.006,
          puffs
        });
      }
    } else {
      this.darkMistGfx = null;
      this.darkMistParticles = [];
    }

    // Ground explosion effects layer (below planes, above background)
    this.groundExplosionsGfx = new Graphics();
    this.bgLayer.addChild(this.groundExplosionsGfx);
    this.groundNukeStrikes = [];
    this.groundExplosionSpawnTimer = 0;

    // Barrel roll aerodynamic vapor trails & supersonic cone
    this.rollGfx = new Graphics();
    this.gameLayer.addChild(this.rollGfx);
    this.rollVortices = [];
    this.rollShockwave = null;

    // Victory Light convergence graphics (top layer in gameLayer)
    this.lightConvergenceGfx = new Graphics();
    this.gameLayer.addChild(this.lightConvergenceGfx);
    this.lightRays = [];

    // Damage Vignette & Low HP Warning Graphics (top of gameLayer)
    this.damageVignetteGfx = new Graphics();
    this.gameLayer.addChild(this.damageVignetteGfx);
    this.damageVignetteTimer = 0;

    // Procedural BOSS Mega Beam & Shield Graphics Layer
    this.bossBeamGfx = new Graphics();
    this.gameLayer.addChild(this.bossBeamGfx);
    this.activeBossBeam = null;

    this.bossShieldGfx = new Graphics();
    this.gameLayer.addChild(this.bossShieldGfx);

    // GUTS Eagle Tornado Thunder Beam layer (rendered above planes, below HUD)
    this.tornadoBeamGfx = new Graphics();
    this.gameLayer.addChild(this.tornadoBeamGfx);
    this.activeTornadoBeam = null;

    // GUTS Eagle Magnetic Deflection Shield layer
    this.eagleShieldGfx = new Graphics();
    this.gameLayer.addChild(this.eagleShieldGfx);
    this.eagleShieldActive = this.currentFighterId === 12;
    this.eagleShieldCooldown = 0;

    // Interactive Beam Clash FX Layer (rendered above both beams)
    this.beamClashGfx = new Graphics();
    this.gameLayer.addChild(this.beamClashGfx);
    this.beamClashState = null;
    this.wonBeamClash = false;
    this.spacePressedThisClash = false;

    // Reset victory sequence flags
    this.isVictorySequence = false;
    this.victoryPhaseTimer = 0;
    this.isPlayerFlyingOut = false;
    this.victoryPostFlyoutDelay = 0;

    this.buildCombatHud();
    this.isTransitioning = false;
    this.state = GameState.PLAY;
  }

  private buildCombatHud() {
    this.uiLayer.removeChildren();

    const lang = getLanguage();
    const bI18n = I18N[lang].battle;
    const fI18n = (I18N[lang].fighters as any)[this.currentFighterId];
    const fighterSpec = FIGHTERS[this.currentFighterId] || FIGHTERS[0];
    const stageSpec = STAGES[this.currentStageId];
    const fighterName = fI18n ? fI18n.name : fighterSpec.name;

    const pBox = new Graphics();
    pBox.roundRect(20, 65, 240, 75, 6);
    pBox.fill({ color: 0x0f1928, alpha: 0.85 });
    pBox.stroke({ color: 0x00c8ff, width: 1.5 });
    this.uiLayer.addChild(pBox);

    const pTitle = new Text({
      text: `P1: ${fighterName}`,
      style: new TextStyle({ fill: 0x00f0ff, fontSize: 13, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    pTitle.position.set(30, 72);
    this.uiLayer.addChild(pTitle);

    const hpBar = new Graphics();
    hpBar.label = 'playerHpBar';
    this.uiLayer.addChild(hpBar);

    const rollStatus = new Text({
      text: bI18n.rollReady,
      style: new TextStyle({ fill: 0xffdc3c, fontSize: 11, fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    rollStatus.label = 'rollStatus';
    rollStatus.position.set(30, 118);
    this.uiLayer.addChild(rollStatus);

    const scBox = new Graphics();
    scBox.roundRect(CANVAS_WIDTH - 220, 65, 200, 75, 6);
    scBox.fill({ color: 0x0f1928, alpha: 0.85 });
    scBox.stroke({ color: 0xffc828, width: 1.5 });
    this.uiLayer.addChild(scBox);

    const scText = new Text({
      text: bI18n.scoreText(0, stageSpec.targetScore),
      style: new TextStyle({ fill: 0xffffff, fontSize: 12, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei', lineHeight: 20 })
    });
    scText.label = 'scoreText';
    scText.position.set(CANVAS_WIDTH - 205, 76);
    this.uiLayer.addChild(scText);

    const pauseBtn = new Graphics();
    pauseBtn.roundRect(CANVAS_WIDTH - 55, 18, 35, 32, 4);
    pauseBtn.fill({ color: 0x141e2d, alpha: 0.9 });
    pauseBtn.stroke({ color: 0x00c8ff, width: 1 });
    pauseBtn.rect(CANVAS_WIDTH - 44, 25, 4, 18).fill(0xffffff);
    pauseBtn.rect(CANVAS_WIDTH - 35, 25, 4, 18).fill(0xffffff);
    pauseBtn.eventMode = 'static';
    pauseBtn.cursor = 'pointer';
    pauseBtn.on('pointerdown', () => this.togglePause());
    this.uiLayer.addChild(pauseBtn);

    // Beam Clash Interactive HUD Capsule & Struggle Meter (Option B)
    this.beamClashHudContainer = new Container();
    this.beamClashHudContainer.visible = false;
    this.beamClashHudContainer.position.set(0, CANVAS_HEIGHT * 0.58);
    this.uiLayer.addChild(this.beamClashHudContainer);

    this.beamClashGaugeGfx = new Graphics();
    this.beamClashHudContainer.addChild(this.beamClashGaugeGfx);

    this.beamClashPromptText = new Text({
      text: "⚡ 连按 [SPACE] / [J] 蓄能顶推! ⚡",
      style: new TextStyle({
        fill: 0xffea00,
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Segoe UI, Microsoft YaHei',
        stroke: { color: 0x000000, width: 4 },
        align: 'center'
      })
    });
    this.beamClashPromptText.anchor.set(0.5, 0.5);
    this.beamClashPromptText.position.set(CANVAS_WIDTH / 2, 14);
    this.beamClashHudContainer.addChild(this.beamClashPromptText);

    this.beamClashSubText = new Text({
      text: "BEAM CLASH // MASH TO OVERPOWER BOSS BEAM!",
      style: new TextStyle({
        fill: 0x00f0ff,
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Segoe UI, Microsoft YaHei',
        stroke: { color: 0x000000, width: 3 },
        align: 'center'
      })
    });
    this.beamClashSubText.anchor.set(0.5, 0.5);
    this.beamClashSubText.position.set(CANVAS_WIDTH / 2, 32);
    this.beamClashHudContainer.addChild(this.beamClashSubText);
  }

  private updateCombatHud() {
    const lang = getLanguage();
    const bI18n = I18N[lang].battle;

    const hpBar = this.uiLayer.getChildByLabel('playerHpBar') as Graphics;
    if (hpBar) {
      hpBar.clear();
      const pct = Math.max(0, this.playerHp / this.playerMaxHp);
      hpBar.roundRect(30, 96, 170, 10, 2);
      hpBar.fill({ color: 0x142832, alpha: 0.9 });
      hpBar.roundRect(30, 96, 170 * pct, 10, 2);
      hpBar.fill({ color: pct > 0.3 ? 0x28dc8c : 0xff3232 });
    }

    const rollStatus = this.uiLayer.getChildByLabel('rollStatus') as Text;
    if (rollStatus) {
      if (this.isRolling) {
        rollStatus.text = bI18n.rollInvincible;
        rollStatus.style.fill = 0x00f0ff;
      } else if (this.rollCooldownTimer > 0) {
        const sec = (this.rollCooldownTimer / 60).toFixed(1);
        rollStatus.text = bI18n.rollCooldown(sec);
        rollStatus.style.fill = 0x8899aa;
      } else {
        rollStatus.text = bI18n.rollReady;
        rollStatus.style.fill = 0xffdc3c;
      }
    }

    const scText = this.uiLayer.getChildByLabel('scoreText') as Text;
    const stageSpec = STAGES[this.currentStageId];
    if (scText && stageSpec) {
      scText.text = bI18n.scoreText(this.score, stageSpec.targetScore);
    }

    let bossBar = this.uiLayer.getChildByLabel('bossBar') as Container;
    if (this.boss && !bossBar) {
      bossBar = new Container();
      bossBar.label = 'bossBar';

      const bbW = 540;
      const bbH = 26;
      const bbX = Math.floor((CANVAS_WIDTH - bbW) / 2);
      const bbY = 22;

      const bg = new Graphics();
      bg.roundRect(bbX, bbY, bbW, bbH, 4);
      bg.fill({ color: 0x0f141e, alpha: 0.95 });
      bg.stroke({ color: 0xff3c3c, width: 1.5 });
      bossBar.addChild(bg);

      const bossName = this.boss.type === 4
        ? bI18n.bossCarrier
        : this.currentStageId === 5
        ? bI18n.bossGatanothor
        : bI18n.bossFlagship;

      const title = new Text({
        text: bossName,
        style: new TextStyle({ fill: 0xff5050, fontSize: 11, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      title.position.set(bbX + 8, bbY - 16);
      bossBar.addChild(title);

      const fillG = new Graphics();
      fillG.label = 'bossFill';
      bossBar.addChild(fillG);
      this.uiLayer.addChild(bossBar);
    } else if (!this.boss && bossBar) {
      this.uiLayer.removeChild(bossBar);
      bossBar.destroy({ children: true });
    }

    if (this.boss && bossBar) {
      const fillG = bossBar.getChildByLabel('bossFill') as Graphics;
      if (fillG) {
        fillG.clear();
        const bbW = 540;
        const bbX = Math.floor((CANVAS_WIDTH - bbW) / 2);
        const bbY = 22;
        const pct = Math.max(0, this.boss.hp / this.boss.maxHp);
        fillG.roundRect(bbX + 3, bbY + 3, (bbW - 6) * pct, 20, 2);
        fillG.fill({ color: 0xeb2d2d });
      }
    }
  }

  // ==========================================
  // GAME LOOP UPDATE (60 FPS FIXED TIMESTEP)
  // ==========================================
  private update(delta: number) {
    if (this.state !== GameState.PLAY || this.isTransitioning) return;

    this.stageTime++;

    // 0. Local Screen Shake / Vibration
    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer -= delta;
      const sx = (Math.random() - 0.5) * 2 * this.screenShakeIntensity;
      const sy = (Math.random() - 0.5) * 2 * this.screenShakeIntensity;
      this.gameLayer.position.set(sx, sy);
      this.bgLayer.position.set(sx * 0.4, sy * 0.4);
      if (this.isWhiteoutActive) {
        this.uiLayer.position.set(sx * 0.6, sy * 0.6);
      }
    } else {
      this.gameLayer.position.set(0, 0);
      this.bgLayer.position.set(0, 0);
      this.uiLayer.position.set(0, 0);
    }

    // 1. Scroll Background (with dynamic throttle acceleration on W / Up)
    const stageSpec = STAGES[this.currentStageId];
    const baseScrollSpeed = stageSpec ? stageSpec.scrollSpeed : 1.5;
    const isAccelerating = (this.keys['w'] || this.keys['arrowup']) ? true : false;
    const targetScrollSpeed = isAccelerating ? baseScrollSpeed * 1.75 : baseScrollSpeed;
    this.bgScrollSpeed += (targetScrollSpeed - this.bgScrollSpeed) * 0.08 * delta;

    if (this.bgSprite1 && this.bgSprite2) {
      this.bgSprite1.y += this.bgScrollSpeed * delta;
      this.bgSprite2.y += this.bgScrollSpeed * delta;

      if (this.bgSprite1.y >= CANVAS_HEIGHT) {
        this.bgSprite1.y = this.bgSprite2.y - CANVAS_HEIGHT;
      }
      if (this.bgSprite2.y >= CANVAS_HEIGHT) {
        this.bgSprite2.y = this.bgSprite1.y - CANVAS_HEIGHT;
      }
    }

    // Roll cooldown timer countdown
    if (this.rollCooldownTimer > 0) {
      this.rollCooldownTimer = Math.max(0, this.rollCooldownTimer - delta);
    }

    // 2. Player Controls & Movement
    if (this.playerSprite) {
      if (this.isPlayerFlyingOut) {
        // Automatic high-speed exit: 1.5x speed straight up!
        this.playerSprite.y -= this.playerSpeed * 1.5 * delta;
        // Keep horizontally centered or stabilized
        this.playerSprite.rotation = 0;

        // Check if fully exited the top of screen
        if (this.playerSprite.y < -120) {
          this.victoryPostFlyoutDelay += delta;
          if (this.victoryPostFlyoutDelay >= 30) { // 0.5s after exiting screen (30 frames @ 60fps)
            if (this.currentStageId === 8 && this.stage8Phase2Triggered) {
              if (!this.isWhiteoutActive && this.whiteoutHoldTimer === 0) {
                this.isWhiteoutActive = true;
                this.whiteoutProgress = 0;
                this.whiteoutHoldTimer = 0;
                this.whiteoutSfxTriggered = false;
              }
            } else if (!this.isWhiteoutActive) {
              this.handleStageWin();
            }
          }
        }
      } else if (!this.beamClashState) {
        let dx = 0;
        let dy = 0;
        if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;

        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        this.playerSprite.x = Math.max(50, Math.min(CANVAS_WIDTH - 50, this.playerSprite.x + dx * this.playerSpeed * delta));
        this.playerSprite.y = Math.max(80, Math.min(CANVAS_HEIGHT - 60, this.playerSprite.y + dy * this.playerSpeed * delta));
      }

      if (this.isRolling) {
        this.rollTimer++;
        const isEagle = this.currentFighterId === 12;
        const totalRollFrames = isEagle ? 32 : 22; // GUTS Eagle prolonged roll time (32 frames / 0.53s)
        const progress = this.rollTimer / totalRollFrames;
        const anglePhase = progress * Math.PI * 2;
        
        // True 3D projection: cosine width compression + vertical sinusoidal banking shift
        const projectedScaleX = Math.cos(anglePhase);
        this.playerSprite.scale.x = this.baseScaleX * projectedScaleX * this.rollDirection;
        this.playerSprite.scale.y = this.baseScaleY * (1.0 + Math.sin(anglePhase) * 0.12);
        this.playerSprite.rotation = Math.sin(anglePhase) * 0.45 * this.rollDirection;

        const spec = FIGHTERS[this.currentFighterId] || FIGHTERS[0];
        const isGuts = spec.isGuts;
        const mainColor = isEagle ? 0x00f0ff : isGuts ? 0xffb030 : 0x00f0ff;

        // Peak flank highlight: flash white at edge inversion (knife-edge passes)
        if (Math.abs(projectedScaleX) < 0.28) {
          this.playerSprite.tint = 0xffffff;
        } else {
          this.playerSprite.tint = mainColor;
        }

        // Spawn realistic aerodynamic helical wingtip vortices & GUTS Eagle Neo-Maxima rainbow trail
        const px = this.playerSprite.x;
        const py = this.playerSprite.y;
        const halfSpan = (isEagle ? 48 : 32) * Math.abs(projectedScaleX);
        const zDepth = Math.sin(anglePhase);

        const leftX = px - halfSpan + Math.sin(anglePhase) * 12 * this.rollDirection;
        const leftY = py + 8 + zDepth * 8;
        const rightX = px + halfSpan - Math.sin(anglePhase) * 12 * this.rollDirection;
        const rightY = py + 8 - zDepth * 8;

        // Eagle uses Neo-Maxima rainbow particles (cyan / yellow / magenta)
        const eagleColors = [0x00f0ff, 0xffd700, 0xff0055];
        const vColor = isEagle
          ? eagleColors[Math.floor((this.rollTimer % 3))]
          : isGuts
          ? 0xffdf88
          : 0xd8ffff;

        this.rollVortices.push({
          leftX,
          leftY,
          rightX,
          rightY,
          alpha: 0.95,
          r: isEagle ? 5.5 : 3.5,
          color: vColor
        });

        // GUTS Eagle Trait 1: Evaporate all enemy bullets touching its Neo-Maxima wingtip wake
        if (isEagle) {
          for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
            const eb = this.bullets[bIdx];
            if (eb.isEnemy && !eb.isUnstoppableBeam) {
              const dLeft = Math.hypot(eb.sprite.x - leftX, eb.sprite.y - leftY);
              const dRight = Math.hypot(eb.sprite.x - rightX, eb.sprite.y - rightY);
              const dCenter = Math.hypot(eb.sprite.x - px, eb.sprite.y - py);
              if (dLeft < 38 || dRight < 38 || dCenter < 42) {
                this.gameLayer.removeChild(eb.sprite);
                eb.sprite.destroy();
                this.bullets.splice(bIdx, 1);
              }
            }
          }
        }

        if (this.rollTimer >= totalRollFrames) {
          this.isRolling = false;
          this.playerSprite.scale.x = this.baseScaleX;
          this.playerSprite.scale.y = this.baseScaleY;
          this.playerSprite.rotation = 0;
          this.playerSprite.tint = 0xffffff;
        }
      } else if (this.playerInvincibleTimer > 0) {
        this.playerInvincibleTimer -= delta;
        this.playerSprite.rotation = 0;
        // High-frequency blinking during i-frames: alternate alpha between 0.35 and 0.95 every 4 frames
        this.playerSprite.alpha = Math.floor(this.playerInvincibleTimer / 4) % 2 === 0 ? 0.35 : 0.95;
        this.playerSprite.tint = 0xffffff;
      } else {
        this.playerSprite.rotation = 0;
        this.playerSprite.alpha = 1.0;
        this.playerSprite.tint = 0xffffff;
      }

      this.fireCooldownTimer++;
      const fighterSpec = FIGHTERS[this.currentFighterId] || FIGHTERS[0];
      // Only fire if not in automatic fly-out and not currently in Beam Clash struggle!
      if (!this.isPlayerFlyingOut && !this.beamClashState && (this.keys[' '] || this.keys['j']) && this.fireCooldownTimer >= fighterSpec.fireCooldown) {
        this.fireCooldownTimer = 0;
        this.firePlayerBullet();
      }
    }

    // Update charging weapon particle effects
    this.updateChargeParticleEffects(delta);

    // 3. Update Bullets & Collisions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.sprite.x += b.vx * delta;
      b.sprite.y += b.vy * delta;

      if (b.sprite.y < -40 || b.sprite.y > CANVAS_HEIGHT + 40 || b.sprite.x < -40 || b.sprite.x > CANVAS_WIDTH + 40) {
        this.gameLayer.removeChild(b.sprite);
        b.sprite.destroy();
        this.bullets.splice(i, 1);
        continue;
      }

      if (!b.isEnemy) {
        // 3a. Bullet vs Bullet Cancellation (Player shot cancels enemy projectile)
        let cancelled = false;
        for (let ebIdx = this.bullets.length - 1; ebIdx >= 0; ebIdx--) {
          const eb = this.bullets[ebIdx];
          if (eb.isEnemy) {
            if (this.checkCollision(b.sprite, eb.sprite, 24)) {
              // If enemy projectile is an unstoppable boss beam, player bullet is destroyed but beam pierces through!
              if (!eb.isUnstoppableBeam) {
                this.gameLayer.removeChild(eb.sprite);
                eb.sprite.destroy();
                this.bullets.splice(ebIdx, 1);
                if (ebIdx < i) i--;
              }

              // Destroy player bullet
              this.gameLayer.removeChild(b.sprite);
              b.sprite.destroy();
              this.bullets.splice(i, 1);
              cancelled = true;
              break;
            }
          }
        }
        if (cancelled) continue;

        // 3b. Hit Boss (Hitbox scaled to match 1.5x body size: radius 95)
        if (this.boss && this.checkCollision(b.sprite, this.boss.sprite, 95)) {
          // If Boss shield is active, Boss is COMPLETELY INVULNERABLE!
          if (this.boss.isShieldActive) {
            // Deflected off shield with spark sound and shield flare
            sounds.playSfx('shoot', 0.2);
            this.gameLayer.removeChild(b.sprite);
            b.sprite.destroy();
            this.bullets.splice(i, 1);
            continue;
          }

          this.boss.hp -= b.damage;
          this.boss.hitFlashTimer = 4;
          this.gameLayer.removeChild(b.sprite);
          b.sprite.destroy();
          this.bullets.splice(i, 1);

          if (this.boss.hp <= 0) {
            if (this.activeBossBeam && this.activeBossBeam.timer > 0) {
              this.killedBossDuringBeam = true;
            }
            this.handleBossDefeat();
          }
          continue;
        }

        // 3c. Hit Enemies
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const em = this.enemies[j];
          if (this.checkCollision(b.sprite, em.sprite, 32)) {
            em.hp -= b.damage;
            em.hitFlashTimer = 4;
            this.gameLayer.removeChild(b.sprite);
            b.sprite.destroy();
            this.bullets.splice(i, 1);

            if (em.hp <= 0) {
              // Score calculation matching original C++ code:
              // Meteorite gives 0 score. Levels 1-5 give +1, Levels 6-8 give +2.
              if (em.type !== 9) {
                if (this.currentStageId >= 6) {
                  this.score += 2;
                } else {
                  this.score += 1;
                }
              }

              // Check if killed a flank slash enemy for Medal #9 (index 8)
              if (em.movementMode === 'flank_slash') {
                if (!this.saveManager.profile.stats) {
                  this.saveManager.profile.stats = { totalRolls: 0, muyuClicks: 0, flankSquadronsKilled: 0 };
                }
                this.saveManager.profile.stats.flankSquadronsKilled = (this.saveManager.profile.stats.flankSquadronsKilled || 0) + 1;
                if (this.saveManager.profile.stats.flankSquadronsKilled >= 3) {
                  if (this.saveManager.unlockMedal(8)) {
                    this.showMedalUnlockedToast(8);
                  }
                }
                this.saveManager.save();
              }

              this.spawnEnemyExplosion(em.sprite.x, em.sprite.y, em.type);
              this.gameLayer.removeChild(em.sprite);
              em.sprite.destroy();
              this.enemies.splice(j, 1);
            }
            break;
          }
        }
      } else {
        // Enemy bullet hitting player (Ignored during Barrel Roll, i-frames, Victory Sequence, or Beam Clash struggle)
        if (!this.isVictorySequence && !this.isRolling && !this.beamClashState && this.playerInvincibleTimer <= 0 && this.playerSprite && this.checkCollision(b.sprite, this.playerSprite, 18)) {
          // GUTS Eagle Trait 2: Magnetic Deflection Shield absorbs 1 lethal projectile every 15s!
          if (this.currentFighterId === 12 && this.eagleShieldActive) {
            this.eagleShieldActive = false;
            this.eagleShieldCooldown = 900; // 15 seconds recharge (900 frames @ 60fps)
            this.playerInvincibleTimer = 30; // 0.5s buffer
            sounds.playSfx('laser', 0.8);
            this.triggerScreenShake(3.0, 8);

            // Destroy incoming enemy projectile without damaging player
            this.gameLayer.removeChild(b.sprite);
            b.sprite.destroy();
            this.bullets.splice(i, 1);
            continue;
          }

          this.stageTookDamage = true;
          this.playerHp -= b.damage;
          this.playerInvincibleTimer = 48; // ~0.8s i-frames
          this.damageVignetteTimer = 20;   // Trigger screen edge red flash
          sounds.playSfx('boom', 0.4);
          this.triggerScreenShake(4.5, 9);
          this.gameLayer.removeChild(b.sprite);
          b.sprite.destroy();
          this.bullets.splice(i, 1);

          if (this.playerHp <= 0) {
            this.handlePlayerDefeat();
          }
        }
      }
    }

    // 4. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const em = this.enemies[i];
      em.timeAlive++;

      // Hit Flash tint visual feedback
      if (em.hitFlashTimer && em.hitFlashTimer > 0) {
        em.hitFlashTimer -= delta;
        em.sprite.tint = 0xff6666;
      } else {
        em.sprite.tint = 0xffffff;
      }

      // Tactical formation and dynamic movement update
      if (em.movementMode === 'flank_slash') {
        em.sprite.x += em.vx * delta;
        em.sprite.y += em.vy * delta;
        // Keep banked angle
        em.sprite.rotation = em.flankSide === 'left' ? -0.32 : 0.32;
      } else if (em.movementMode === 'v_formation') {
        // High-speed aggressive dive with subtle lateral drift
        em.sprite.x += em.vx * delta;
        em.sprite.y += em.vy * delta;
        em.sprite.rotation = em.vx * 0.08;
      } else if (em.type === 7 || em.type === 8 || em.type >= 11) {
        // Elite interceptors: smooth weaving glide
        const sineOffset = Math.sin(em.timeAlive * 0.045) * 3.0;
        em.sprite.x = Math.max(50, Math.min(CANVAS_WIDTH - 50, em.baseX + Math.sin(em.timeAlive * 0.035) * 85));
        em.sprite.y += em.vy * delta;
        em.sprite.rotation = Math.cos(em.timeAlive * 0.035) * 0.25;
      } else {
        em.sprite.x += em.vx * delta;
        em.sprite.y += em.vy * delta;
        em.sprite.rotation = 0;
      }

      em.cd++;
      const fireInterval = this.currentStageId >= 5 ? 80 : 55;
      if (em.type !== 9 && em.cd >= fireInterval) {
        em.cd = 0;
        this.fireEnemyBulletsForType(em);
      }

      // Despawn when out of screen bounds
      if (em.sprite.y > CANVAS_HEIGHT + 70 || em.sprite.x < -120 || em.sprite.x > CANVAS_WIDTH + 120) {
        this.gameLayer.removeChild(em.sprite);
        em.sprite.destroy();
        this.enemies.splice(i, 1);
      }
    }

    // 5. Update Boss
    if (this.boss) {
      // Hit Flash tint visual feedback
      if (this.boss.hitFlashTimer && this.boss.hitFlashTimer > 0) {
        this.boss.hitFlashTimer -= delta;
        this.boss.sprite.tint = 0xff7777;
      } else {
        this.boss.sprite.tint = 0xffffff;
      }

      // Smooth patrol movement (frozen during Beam Clash!)
      if (!this.beamClashState) {
        this.boss.sprite.x += this.boss.vx * delta;
        const minX = 160;
        const maxX = CANVAS_WIDTH - 160;
        if (this.boss.sprite.x <= minX) {
          this.boss.sprite.x = minX;
          this.boss.vx = Math.abs(this.boss.vx);
        } else if (this.boss.sprite.x >= maxX) {
          this.boss.sprite.x = maxX;
          this.boss.vx = -Math.abs(this.boss.vx);
        }
      }

      this.boss.laserCooldown++;

      // Regular artillery salvo (suppressed during Beam Clash)
      if (!this.boss.isShieldActive && !this.beamClashState && this.stageTime % 65 === 0) {
        const bType = this.boss.type;
        const bx = this.boss.sprite.x;
        const by = this.boss.sprite.y + 70;

        if (bType === 4) {
          // Boss 1 Carrier: Attack * 1.25
          this.spawnBulletEntity(bx - 45, by, 0, 5.2, 19, true, 'Ebullet_2.png');
          this.spawnBulletEntity(bx + 45, by, 0, 5.2, 19, true, 'Ebullet_3.png');
        } else {
          // Boss 2 Flagship: Attack * 1.25
          this.spawnBulletEntity(bx, by, 0, 5.5, 25, true, 'Ebullet_5.png');
          this.spawnBulletEntity(bx - 55, by, -1.2, 5.0, 19, true, 'Ebullet_4.png');
          this.spawnBulletEntity(bx + 55, by, 1.2, 5.0, 19, true, 'Ebullet_4.png');
        }
      }

      // Check Mega Laser Phase Trigger (HP < 75%)
      if (this.boss.hp < this.boss.maxHp * 0.75) {
        // 2 seconds (120 frames) before firing: ACTIVATE INVINCIBLE ENERGY SHIELD!
        // Laser cycle length: 260 frames. Shield starts at 140 frames (lasts 120 frames / 2.0s)
        if (this.boss.laserCooldown >= 140 && this.boss.laserCooldown < 260) {
          if (!this.boss.isShieldActive) {
            this.boss.isShieldActive = true;
            this.boss.shieldTimer = 0;
            sounds.playSfx('alarm', 0.5);
          }
          this.boss.shieldTimer = (this.boss.shieldTimer || 0) + delta;
        }

        // Firing moment (260 frames): Shield drops & FIRES UNSTOPPABLE MEGA BEAM!
        if (this.boss.laserCooldown >= 260) {
          this.boss.laserCooldown = 0;
          this.boss.isShieldActive = false; // Shield drops as main cannon fires!

          sounds.playSfx('laser', 1.0);
          this.triggerScreenShake(8.0, 24);

          // Activate procedural high-energy beam (extended to 96 frames / 1.6s for generous beam clash connection)
          const isBoss1 = this.boss.type === 4;
          this.activeBossBeam = {
            originX: this.boss.sprite.x,
            originY: this.boss.sprite.y + (isBoss1 ? 140 : 120),
            timer: 0,
            duration: 96, // ~1.6s continuous beam window (sufficient for player to align and clash!)
            beamWidth: isBoss1 ? 58 : 74,
            coreColor: 0xffffff,
            bloomColor: isBoss1 ? 0x00d8ff : 0xff3b10, // Boss 1: Cyan-Blue Particle Beam; Boss 2: Magma-Crimson Plasma
            damage: isBoss1 ? 38 : 50
          };
        }
      } else {
        this.boss.isShieldActive = false;
      }
    }

    // 6. Update Explosions
    this.updateExplosions(delta);

    // 7. Check Stage 5 Phase 2 Trigger (Map switch & BGM switch)
    if (this.currentStageId === 5 && this.score >= 55 && !this.stage5Phase2Triggered) {
      this.stage5Phase2Triggered = true;
      this.switchStage5Phase2();
    }

    // 8. Spawn Enemy Waves & Check Boss Trigger
    this.handleSpawns();

    // 9. Update HUD
    this.updateCombatHud();

    // 10. Update Damage Vignette & Low HP Alert Pulse (P1)
    this.updateDamageVignette(delta);

    // 11. Update Dark Mist Particles (Stage 5 Phase 1 Tiga atmosphere)
    this.updateDarkMist(delta);

    // 12. Update Barrel Roll FX & Afterimages
    this.updateRollEffects(delta);

    // 13. Update Cinematic Victory Phase & FX (Light convergence & ground explosions)
    this.updateVictorySequence(delta);

    // 14. Update Beam Clash State & Struggle Physics (Option B)
    this.updateBeamClashState(delta);

    // 15. Update Procedural Boss Energy Shield & Mega Beam
    this.updateBossShieldAndBeam(delta);

    // 16. Update GUTS Eagle Magnetic Deflection Shield & Neo-Maxima Tornado Thunder Beam
    this.updateEagleShieldAndTornadoBeam(delta);

    // 17. Render Beam Clash Spectacle Visuals & Interactive HUD
    this.renderBeamClashVisuals(delta);

    // 18. Update Stage 8 Phase 2 Finale Blinding Whiteout & Tinnitus
    this.updateStage8Whiteout(delta);
  }

  private updateDamageVignette(delta: number) {
    if (!this.damageVignetteGfx) return;
    this.damageVignetteGfx.clear();

    const isLowHp = this.playerHp > 0 && this.playerHp <= this.playerMaxHp * 0.3;

    if (this.damageVignetteTimer > 0) {
      this.damageVignetteTimer -= delta;
      const alpha = Math.min(0.65, (this.damageVignetteTimer / 20) * 0.65);
      // Red border vignette
      this.damageVignetteGfx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this.damageVignetteGfx.stroke({ color: 0xff1122, width: 14, alpha });
      this.damageVignetteGfx.rect(8, 8, CANVAS_WIDTH - 16, CANVAS_HEIGHT - 16);
      this.damageVignetteGfx.stroke({ color: 0xff3344, width: 8, alpha: alpha * 0.5 });
    } else if (isLowHp) {
      // Pulsing heartbeat red alert
      const pulse = 0.2 + 0.2 * Math.sin(this.stageTime * 0.12);
      this.damageVignetteGfx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this.damageVignetteGfx.stroke({ color: 0xff0022, width: 8, alpha: pulse });
    }
  }

  private updateDarkMist(delta: number) {
    if (!this.darkMistGfx || this.currentStageId !== 5 || this.stage5Phase2Triggered) {
      if (this.darkMistGfx) this.darkMistGfx.clear();
      return;
    }

    this.darkMistGfx.clear();

    for (const cloud of this.darkMistParticles) {
      cloud.x += cloud.vx * delta;
      cloud.y += cloud.vy * delta;
      cloud.rot += cloud.vRot * delta;

      // Wrap around screen boundaries
      if (cloud.y > CANVAS_HEIGHT + 140) {
        cloud.y = -140;
        cloud.x = Math.random() * CANVAS_WIDTH;
      } else if (cloud.y < -140) {
        cloud.y = CANVAS_HEIGHT + 140;
      }
      if (cloud.x > CANVAS_WIDTH + 140) {
        cloud.x = -140;
      } else if (cloud.x < -140) {
        cloud.x = CANVAS_WIDTH + 140;
      }

      const cosR = Math.cos(cloud.rot);
      const sinR = Math.sin(cloud.rot);

      for (const puff of cloud.puffs) {
        const px = cloud.x + (puff.ox * cosR - puff.oy * sinR);
        const py = cloud.y + (puff.ox * sinR + puff.oy * cosR);

        // Soft organic curvilinear smoke puff (never polygon/straight lines)
        this.darkMistGfx.circle(px, py, puff.r);
        this.darkMistGfx.fill({ color: 0x050409, alpha: 0.12 * puff.alphaMult });
      }
    }
  }

  // ==========================================
  // PROCEDURAL BOSS ENERGY SHIELD & MEGA BEAM
  // ==========================================
  private updateBossShieldAndBeam(delta: number) {
    // 1. Render Invincible Hexagonal Barrier & Lightning Arc Overload (No plain circle!)
    if (this.bossShieldGfx) {
      this.bossShieldGfx.clear();
      if (this.boss && this.boss.isShieldActive) {
        const bx = this.boss.sprite.x;
        const by = this.boss.sprite.y;
        const isBoss1 = this.boss.type === 4;
        const shieldR = isBoss1 ? 190 : 210;
        const shieldColor = isBoss1 ? 0x00f0ff : 0xff3b20;
        const t = (this.boss.shieldTimer || 0) * 0.12;

        const pulse = 0.8 + 0.2 * Math.sin(t * 2.5);

        // A. True Hexagonal Forcefield Perimeter (6-vertex polygon)
        const hexPoints: Array<{ x: number; y: number }> = [];
        for (let i = 0; i < 6; i++) {
          const ang = (i * Math.PI) / 3 + Math.PI / 6;
          hexPoints.push({
            x: bx + Math.cos(ang) * (shieldR * 1.05 + Math.sin(t * 3 + i) * 3),
            y: by + Math.sin(ang) * (shieldR * 0.88 + Math.cos(t * 3 + i) * 3)
          });
        }
        this.bossShieldGfx.poly(hexPoints);
        this.bossShieldGfx.stroke({ color: shieldColor, width: 3.5, alpha: 0.9 * pulse });
        this.bossShieldGfx.fill({ color: shieldColor, alpha: 0.14 * pulse });

        // B. Concentric Inner Hexagon
        const innerHex: Array<{ x: number; y: number }> = [];
        for (let i = 0; i < 6; i++) {
          const ang = (i * Math.PI) / 3 + Math.PI / 6;
          innerHex.push({
            x: bx + Math.cos(ang) * (shieldR * 0.65),
            y: by + Math.sin(ang) * (shieldR * 0.55)
          });
        }
        this.bossShieldGfx.poly(innerHex);
        this.bossShieldGfx.stroke({ color: 0xffffff, width: 1.5, alpha: 0.45 * pulse });

        // C. Crackling Tesla Lightning Arcs across shield surface (Fractured jagged electric discharge)
        for (let arc = 0; arc < 4; arc++) {
          const startAngle = Math.random() * Math.PI * 2;
          let lx = bx + Math.cos(startAngle) * (shieldR * 0.4);
          let ly = by + Math.sin(startAngle) * (shieldR * 0.35);
          this.bossShieldGfx.moveTo(lx, ly);

          const segments = 4 + Math.floor(Math.random() * 3);
          for (let s = 0; s < segments; s++) {
            const stepAng = startAngle + (Math.random() - 0.5) * 1.2;
            const stepDist = 18 + Math.random() * 22;
            lx += Math.cos(stepAng) * stepDist;
            ly += Math.sin(stepAng) * stepDist;
            this.bossShieldGfx.lineTo(lx, ly);
          }
          this.bossShieldGfx.stroke({ color: 0xffffff, width: 1.8, alpha: 0.75 + Math.random() * 0.25 });
        }

        // D. Inward High-Energy Particle Convergent Stream (Charging suction effect towards cannon muzzle)
        const muzzleY = by + (isBoss1 ? 130 : 110);
        for (let cp = 0; cp < 8; cp++) {
          const cAng = (cp * Math.PI * 2) / 8 + t * 0.6;
          const cDist = 55 + ((Math.sin(t * 3 + cp) + 1) * 35);
          const px = bx + Math.cos(cAng) * cDist;
          const py = muzzleY + Math.sin(cAng) * (cDist * 0.6);
          this.bossShieldGfx.moveTo(px, py);
          this.bossShieldGfx.lineTo(bx + (px - bx) * 0.3, muzzleY + (py - muzzleY) * 0.3);
          this.bossShieldGfx.stroke({ color: shieldColor, width: 2, alpha: 0.8 });
        }
      }
    }

    // 2. Render Procedural Super Laser Beam (No ugly textures, No plain circle flare!)
    if (this.bossBeamGfx) {
      this.bossBeamGfx.clear();

      if (this.activeBossBeam) {
        const beam = this.activeBossBeam;
        if (this.beamClashState && !this.beamClashState.breakthroughTriggered) {
          beam.timer = beam.duration * 0.45; // Hold at full sustain during beam clash
        } else {
          beam.timer += delta;
        }

        if (beam.timer >= beam.duration || !this.boss) {
          this.activeBossBeam = null;
          return;
        }

        // Anchor origin to boss cannon muzzle
        if (this.boss) {
          beam.originX = this.boss.sprite.x;
          beam.originY = this.boss.sprite.y + (this.boss.type === 4 ? 130 : 110);
        }

        const prog = beam.timer / beam.duration;
        // Natural beam envelope: quick surge in 15%, sustained 70%, taper out 15%
        let envelope = 1.0;
        if (prog < 0.15) {
          envelope = prog / 0.15;
        } else if (prog > 0.85) {
          envelope = (1.0 - prog) / 0.15;
        }

        const curWidth = beam.beamWidth * envelope;
        const bx = beam.originX;
        const by = beam.originY;
        const beamBottom = this.beamClashState ? this.beamClashState.clashY : CANVAS_HEIGHT + 20;

        // Layer A: Outer Expansive Chromatic Energy Bloom (Flickers organically)
        const jitter = (Math.sin(beam.timer * 0.8) + Math.cos(beam.timer * 1.3)) * 3;
        const bloomW = (curWidth * 1.9 + jitter);
        this.bossBeamGfx.rect(bx - bloomW / 2, by, bloomW, Math.max(0, beamBottom - by));
        this.bossBeamGfx.fill({ color: beam.bloomColor, alpha: 0.35 * envelope });

        // Layer B: Intense High-Density Plasma Beam Column
        this.bossBeamGfx.rect(bx - curWidth / 2, by, curWidth, Math.max(0, beamBottom - by));
        this.bossBeamGfx.fill({ color: beam.bloomColor, alpha: 0.85 * envelope });

        // Layer C: Pure Incandescent White Fusion Core
        const coreW = Math.max(4, curWidth * 0.38);
        this.bossBeamGfx.rect(bx - coreW / 2, by, coreW, Math.max(0, beamBottom - by));
        this.bossBeamGfx.fill({ color: 0xffffff, alpha: 0.98 * envelope });

        // Layer D: Shock Diamonds (Mach-ring high pressure diamond facets down the core)
        const diamondSpacings = [30, 75, 130, 200];
        for (const dist of diamondSpacings) {
          if (by + dist < beamBottom - 15) {
            const dy = by + dist;
            const dw = curWidth * 0.42;
            const dh = 14;
            this.bossBeamGfx.poly([
              { x: bx, y: dy - dh },
              { x: bx + dw, y: dy },
              { x: bx, y: dy + dh },
              { x: bx - dw, y: dy }
            ]);
            this.bossBeamGfx.fill({ color: 0xffffff, alpha: 0.85 * envelope });
          }
        }

        // Layer E: Cannon Muzzle Anamorphic Starburst Flare (NOT a circle: cinema anamorphic lens horizontal & cross glare spikes)
        const flareSpanH = curWidth * 2.8 + (Math.sin(beam.timer * 1.5) * 12);
        const flareSpanV = curWidth * 0.55;

        // 1. Horizontal anamorphic glare beam
        this.bossBeamGfx.poly([
          { x: bx - flareSpanH, y: by },
          { x: bx, y: by - 4 },
          { x: bx + flareSpanH, y: by },
          { x: bx, y: by + 4 }
        ]);
        this.bossBeamGfx.fill({ color: 0xffffff, alpha: 0.95 * envelope });

        // 2. Wide chromatic horizontal glow
        this.bossBeamGfx.poly([
          { x: bx - flareSpanH * 1.35, y: by },
          { x: bx, y: by - 9 },
          { x: bx + flareSpanH * 1.35, y: by },
          { x: bx, y: by + 9 }
        ]);
        this.bossBeamGfx.fill({ color: beam.bloomColor, alpha: 0.55 * envelope });

        // 3. Diagonal 45-degree starburst diffraction spikes
        const diagLen = curWidth * 1.2;
        this.bossBeamGfx.moveTo(bx - diagLen, by - diagLen * 0.6);
        this.bossBeamGfx.lineTo(bx + diagLen, by + diagLen * 0.6);
        this.bossBeamGfx.stroke({ color: 0xffffff, width: 2, alpha: 0.85 * envelope });

        this.bossBeamGfx.moveTo(bx + diagLen, by - diagLen * 0.6);
        this.bossBeamGfx.lineTo(bx - diagLen, by + diagLen * 0.6);
        this.bossBeamGfx.stroke({ color: 0xffffff, width: 2, alpha: 0.85 * envelope });

        // 4. Muzzle high-velocity plasma sparks spraying outward
        for (let sp = 0; sp < 6; sp++) {
          const spAng = Math.PI * 0.2 + (sp * Math.PI * 0.6) / 5 + (Math.sin(beam.timer + sp) * 0.2);
          const spDist = curWidth * (0.8 + Math.random() * 0.6);
          const sx = bx + Math.cos(spAng) * spDist;
          const sy = by + Math.sin(spAng) * spDist;
          this.bossBeamGfx.moveTo(bx, by);
          this.bossBeamGfx.lineTo(sx, sy);
          this.bossBeamGfx.stroke({ color: beam.bloomColor, width: 1.5, alpha: 0.8 * envelope });
        }

        // Layer F: Continuous Lethal Damage & Evaporate Player Bullets
        // 1. Evaporate all player bullets in beam cylinder
        for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
          const pb = this.bullets[bIdx];
          if (!pb.isEnemy) {
            if (Math.abs(pb.sprite.x - bx) < (curWidth * 0.6) && pb.sprite.y >= by && pb.sprite.y <= beamBottom) {
              this.gameLayer.removeChild(pb.sprite);
              pb.sprite.destroy();
              this.bullets.splice(bIdx, 1);
            }
          }
        }

        // 2. Continuous damage to player if caught in beam column (Protected below clash point; Ignored during Barrel Roll)
        if (this.playerSprite && !this.isRolling && !this.isVictorySequence && this.playerInvincibleTimer <= 0) {
          const isProtectedByClash = this.beamClashState && this.playerSprite.y >= this.beamClashState.clashY;
          if (!isProtectedByClash && Math.abs(this.playerSprite.x - bx) < (curWidth * 0.5) && this.playerSprite.y >= by && this.playerSprite.y <= beamBottom) {
            this.stageTookDamage = true;
            this.playerHp -= beam.damage;
            this.playerInvincibleTimer = 45; // ~0.75s i-frame buffer
            this.damageVignetteTimer = 22;
            sounds.playSfx('boom', 0.6);
            this.triggerScreenShake(7.0, 14);

            if (this.playerHp <= 0) {
              this.handlePlayerDefeat();
            }
          }
        }
      }
    }
  }

  // ==========================================
  // GUTS EAGLE: MAGNETIC DEFLECTION SHIELD & TORNADO THUNDER BEAM
  // ==========================================
  private updateEagleShieldAndTornadoBeam(delta: number) {
    // 1. Update Magnetic Deflection Shield (Visual & Cooldown)
    if (this.eagleShieldGfx) {
      this.eagleShieldGfx.clear();
      if (this.currentFighterId === 12 && this.playerSprite) {
        if (!this.eagleShieldActive) {
          if (this.eagleShieldCooldown > 0) {
            this.eagleShieldCooldown -= delta;
            if (this.eagleShieldCooldown <= 0) {
              this.eagleShieldActive = true;
              sounds.playSfx('laser', 0.4);
            }
          }
        }

        // Render rotating magnetic hexagon shield aura when active
        if (this.eagleShieldActive && !this.isPlayerFlyingOut) {
          const px = this.playerSprite.x;
          const py = this.playerSprite.y;
          const shieldRadius = 56 + Math.sin(this.stageTime * 0.18) * 3;
          const pulse = 0.5 + 0.3 * Math.sin(this.stageTime * 0.12);

          // Outer energy field ring
          this.eagleShieldGfx.circle(px, py, shieldRadius);
          this.eagleShieldGfx.stroke({ color: 0x00f0ff, width: 2, alpha: pulse });

          // Hexagonal magnetic flux harmonics
          const sides = 6;
          const angleOffset = this.stageTime * 0.03;
          const pts: { x: number; y: number }[] = [];
          for (let s = 0; s < sides; s++) {
            const a = angleOffset + (s * Math.PI * 2) / sides;
            pts.push({
              x: px + Math.cos(a) * shieldRadius * 0.88,
              y: py + Math.sin(a) * shieldRadius * 0.88
            });
          }
          this.eagleShieldGfx.poly(pts);
          this.eagleShieldGfx.stroke({ color: 0xffd700, width: 1.5, alpha: pulse * 0.8 });
          this.eagleShieldGfx.fill({ color: 0x00d8ff, alpha: 0.12 * pulse });
        }
      }
    }

    // 2. Update Neo-Maxima Tornado Thunder Beam (Full-screen continuous particle vortex)
    if (this.tornadoBeamGfx) {
      this.tornadoBeamGfx.clear();
      if (this.activeTornadoBeam) {
        const beam = this.activeTornadoBeam;
        if (this.beamClashState && !this.beamClashState.breakthroughTriggered) {
          beam.timer = beam.duration * 0.45; // Hold at full sustain during beam clash
        } else {
          beam.timer += delta;
        }

        // Keep beam anchored to current fighter x position for tracking!
        if (this.playerSprite) {
          beam.x = this.playerSprite.x;
          beam.y = this.playerSprite.y - 45;
        }

        if (beam.timer >= beam.duration) {
          this.activeTornadoBeam = null;
          return;
        }

        const progress = beam.timer / beam.duration;
        // Bell-curve envelope
        const envelope = Math.sin(progress * Math.PI);
        const curWidth = beam.beamWidth * (0.8 + 0.25 * envelope);
        const bx = beam.x;
        const by = beam.y;
        const topY = this.beamClashState ? this.beamClashState.clashY : 0;
        const beamSpan = Math.max(10, by - topY);

        // --- Neo-Maxima Tornado Thunder: Tri-helical Particle Vortex & Plasma Arc ---
        // 1. Aero-Plasma Shockwave Rings (High-speed upward propagating shockwave rings)
        const ringCount = 8;
        for (let r = 0; r < ringCount; r++) {
          const ringY = by - (((this.stageTime * 28 + r * 110) % beamSpan + beamSpan) % beamSpan);
          if (ringY < topY) continue;
          const ringProgress = (by - ringY) / beamSpan;
          const ringW = curWidth * (0.6 + 0.5 * ringProgress);
          const ringH = 12 + 8 * ringProgress;
          const tilt = Math.sin(this.stageTime * 0.2 + r) * 6;
          this.tornadoBeamGfx.ellipse(bx + tilt, ringY, ringW, ringH);
          this.tornadoBeamGfx.stroke({ color: 0x38bdf8, width: 1.5, alpha: 0.45 * envelope * (1 - ringProgress * 0.4) });
        }

        // 2. Tri-helical Braided Plasma Ribbons (Alpha Flame Red, Beta Sky Blue, Gamma Radiant Gold)
        const helixSteps = 45;
        const stepH = beamSpan / helixSteps;
        const alphaPts: number[] = [];
        const betaPts: number[] = [];
        const gammaPts: number[] = [];

        for (let s = 0; s <= helixSteps; s++) {
          const hy = by - s * stepH;
          if (hy < topY) break;
          // Upward high-speed rotation
          const phase = this.stageTime * 0.45 - s * 0.28;
          // Flare outwards slightly as it pierces through the clouds
          const expandFactor = 0.8 + 0.35 * (s / helixSteps);
          const rad = (curWidth * 0.45) * expandFactor;

          const ax = bx + Math.sin(phase) * rad;
          const bx_p = bx + Math.sin(phase + (Math.PI * 2 / 3)) * rad;
          const gx = bx + Math.sin(phase + (Math.PI * 4 / 3)) * rad;

          alphaPts.push(ax, hy);
          betaPts.push(bx_p, hy);
          gammaPts.push(gx, hy);

          // Small vortex sparkles along ribbons
          if (s % 3 === 0) {
            this.tornadoBeamGfx.circle(ax, hy, 2.5);
            this.tornadoBeamGfx.fill({ color: 0xff3366, alpha: 0.8 * envelope });
            this.tornadoBeamGfx.circle(bx_p, hy, 2.5);
            this.tornadoBeamGfx.fill({ color: 0x38bdf8, alpha: 0.8 * envelope });
            this.tornadoBeamGfx.circle(gx, hy, 2.5);
            this.tornadoBeamGfx.fill({ color: 0xfacc15, alpha: 0.8 * envelope });
          }
        }

        // Draw outer glow and core strokes for the 3 ribbons
        // Alpha (Crimson)
        this.tornadoBeamGfx.poly(alphaPts);
        this.tornadoBeamGfx.stroke({ color: 0xff1744, width: 4.5, alpha: 0.7 * envelope });
        this.tornadoBeamGfx.poly(alphaPts);
        this.tornadoBeamGfx.stroke({ color: 0xff80ab, width: 1.8, alpha: 0.95 * envelope });

        // Beta (Cyan)
        this.tornadoBeamGfx.poly(betaPts);
        this.tornadoBeamGfx.stroke({ color: 0x00e5ff, width: 4.5, alpha: 0.7 * envelope });
        this.tornadoBeamGfx.poly(betaPts);
        this.tornadoBeamGfx.stroke({ color: 0xe0f7fa, width: 1.8, alpha: 0.95 * envelope });

        // Gamma (Gold)
        this.tornadoBeamGfx.poly(gammaPts);
        this.tornadoBeamGfx.stroke({ color: 0xffab00, width: 4.5, alpha: 0.7 * envelope });
        this.tornadoBeamGfx.poly(gammaPts);
        this.tornadoBeamGfx.stroke({ color: 0xfff9c4, width: 1.8, alpha: 0.95 * envelope });

        // 3. Central Ion Lightning Network (High-frequency violent electric arc)
        const boltCount = 3;
        for (let b = 0; b < boltCount; b++) {
          const lPts: number[] = [];
          let curLx = bx + (b - 1) * 8;
          let curLy = by;
          lPts.push(curLx, curLy);

          const segments = 18;
          const lStepY = beamSpan / segments;
          for (let seg = 1; seg <= segments; seg++) {
            curLy = by - seg * lStepY;
            if (curLy < topY) break;
            // High-frequency jitter
            const jitter = (Math.sin(this.stageTime * 1.5 + seg * 4.3 + b * 7) * 0.5 + (Math.random() - 0.5)) * (curWidth * 0.28);
            curLx = bx + jitter;
            lPts.push(curLx, curLy);

            // Occasional lightning fork branch
            if (seg % 5 === 0 && Math.random() < 0.6) {
              const forkX = curLx + (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 20);
              const forkY = curLy - lStepY * 0.6;
              this.tornadoBeamGfx.poly([curLx, curLy, forkX, forkY]);
              this.tornadoBeamGfx.stroke({ color: 0x80d8ff, width: 1.2, alpha: 0.85 * envelope });
            }
          }

          this.tornadoBeamGfx.poly(lPts);
          this.tornadoBeamGfx.stroke({ color: 0x00e5ff, width: 3.0, alpha: 0.6 * envelope });
          this.tornadoBeamGfx.poly(lPts);
          this.tornadoBeamGfx.stroke({ color: 0xffffff, width: 1.2, alpha: 0.95 * envelope });
        }

        // 4. Prismatic Crystal Flare & Diamond Muzzle Emitter (Prismatic focus core)
        const prismR = curWidth * 0.42;
        const prismPts = [
          bx, by - prismR * 1.3,
          bx + prismR * 0.9, by - prismR * 0.3,
          bx + prismR * 0.7, by + prismR * 0.6,
          bx, by + prismR * 1.0,
          bx - prismR * 0.7, by + prismR * 0.6,
          bx - prismR * 0.9, by - prismR * 0.3
        ];
        this.tornadoBeamGfx.poly(prismPts);
        this.tornadoBeamGfx.fill({ color: 0x00e5ff, alpha: 0.35 * envelope });
        this.tornadoBeamGfx.stroke({ color: 0xffffff, width: 2.2, alpha: 0.9 * envelope });

        // Inner glowing golden-red diamond
        const innerDiamond = [
          bx, by - prismR * 0.7,
          bx + prismR * 0.5, by,
          bx, by + prismR * 0.7,
          bx - prismR * 0.5, by
        ];
        this.tornadoBeamGfx.poly(innerDiamond);
        this.tornadoBeamGfx.fill({ color: 0xffd700, alpha: 0.75 * envelope });
        this.tornadoBeamGfx.stroke({ color: 0xff1744, width: 1.5, alpha: 0.85 * envelope });

        // Sharp Anamorphic Diamond Spikes
        const spikeLenX = curWidth * 2.2;
        const spikeW = 4.5 * envelope;
        this.tornadoBeamGfx.poly([
          bx - spikeLenX, by,
          bx, by - spikeW,
          bx + spikeLenX, by,
          bx, by + spikeW
        ]);
        this.tornadoBeamGfx.fill({ color: 0xffffff, alpha: 0.95 * envelope });

        const spikeLenY = curWidth * 1.2;
        this.tornadoBeamGfx.poly([
          bx, by - spikeLenY,
          bx + spikeW, by,
          bx, by + spikeLenY,
          bx - spikeW, by
        ]);
        this.tornadoBeamGfx.fill({ color: 0x00e5ff, alpha: 0.9 * envelope });

        // Inward suction converging particles at muzzle
        for (let cp = 0; cp < 8; cp++) {
          const cAngle = this.stageTime * 0.6 + (cp * Math.PI / 4);
          const cDist = (1 - ((this.stageTime * 0.15 + cp * 0.12) % 1)) * (curWidth * 0.8);
          const cpx = bx + Math.cos(cAngle) * cDist;
          const cpy = by + Math.sin(cAngle) * (cDist * 0.6);
          this.tornadoBeamGfx.circle(cpx, cpy, 2);
          this.tornadoBeamGfx.fill({ color: 0xffffff, alpha: 0.85 * envelope });
        }

        // Tactical Effect: Vaporize all enemy bullets in full column (between player and topY)
        for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
          const eb = this.bullets[bIdx];
          if (eb.isEnemy) {
            if (Math.abs(eb.sprite.x - bx) < (curWidth * 0.7) && eb.sprite.y <= by && eb.sprite.y >= topY) {
              this.gameLayer.removeChild(eb.sprite);
              eb.sprite.destroy();
              this.bullets.splice(bIdx, 1);
            }
          }
        }

        // Tactical Effect: Continuous tearing damage to all enemies in column
        for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
          const em = this.enemies[eIdx];
          if (Math.abs(em.sprite.x - bx) < (curWidth * 0.65) && em.sprite.y <= by && em.sprite.y >= topY) {
            em.hp -= beam.damage * 0.28 * delta;
            em.hitFlashTimer = 4;
            if (em.hp <= 0) {
              if (this.currentStageId >= 6) {
                this.score += 2;
              } else {
                this.score += 1;
              }
              this.spawnEnemyExplosion(em.sprite.x, em.sprite.y, em.type);
              this.gameLayer.removeChild(em.sprite);
              em.sprite.destroy();
              this.enemies.splice(eIdx, 1);
            }
          }
        }

        // Tactical Effect: Single-hit damage to Boss if caught in beam (Only once per beam activation!)
        if (this.boss && !this.boss.isShieldActive && !this.beamClashState && !this.activeBossBeam && this.beamClashDamageCooldown <= 0 && !beam.hasHitBoss) {
          if (Math.abs(this.boss.sprite.x - bx) < (curWidth * 0.75) && this.boss.sprite.y <= by) {
            beam.hasHitBoss = true;
            this.boss.hp -= beam.damage; // Deals single instance of beam damage (325)
            this.boss.hitFlashTimer = 12;
            sounds.playSfx('hit', 0.8);
            this.triggerScreenShake(5.0, 10);
            this.spawnExplosion(this.boss.sprite.x, this.boss.sprite.y + 60, 'boom3_1', 110, 110);
            if (this.boss.hp <= 0) {
              if (this.activeBossBeam && this.activeBossBeam.timer > 0) {
                this.killedBossDuringBeam = true;
              }
              this.handleBossDefeat();
            }
          }
        }
      }
    }

    if (this.beamClashDamageCooldown > 0) {
      this.beamClashDamageCooldown -= delta;
    }
  }

  // ==========================================
  // INTERACTIVE BEAM CLASH SYSTEM (OPTION B)
  // ==========================================
  private handleBeamClashMash() {
    if (!this.beamClashState || this.beamClashState.breakthroughTriggered) return;
    const clash = this.beamClashState;
    // Each deliberate tap gives +0.045 forward push. With boss counter-push at 0.0013/frame (~0.078/sec),
    // a player actively mashing (4~5 taps/sec) gains ~0.10~0.15 net progress per second, reaching breakthrough in ~3-4 seconds!
    clash.pushProgress = Math.min(1.0, clash.pushProgress + 0.045);
    clash.mashCount++;
    clash.flashTimer = 8;
    this.triggerScreenShake(3.5, 6);
    sounds.playSfx('hit', 0.35);

    // Instant trigger when pushed to Boss cannon muzzle threshold (>= 0.92)
    if (clash.pushProgress >= 0.92) {
      this.triggerClashPlayerBreakthrough(clash);
    }
  }

  private triggerClashPlayerBreakthrough(clash: {
    active: boolean;
    clashX: number;
    clashY: number;
    bossOriginY: number;
    playerMuzzleY: number;
    pushProgress: number;
    mashCount: number;
    flashTimer: number;
    breakthroughTriggered: boolean;
  }) {
    if (clash.breakthroughTriggered) return;
    clash.breakthroughTriggered = true;

    const bBeam = this.activeBossBeam;
    const pBeam = this.activeTornadoBeam;
    const bX = bBeam ? bBeam.originX : (this.boss ? this.boss.sprite.x : clash.clashX);

    // Boss mega beam is completely shattered!
    this.activeBossBeam = null;
    if (this.beamClashHudContainer) this.beamClashHudContainer.visible = false;

    sounds.playSfx('boom', 1.0);
    sounds.playSfx('tornado', 1.0);
    this.triggerScreenShake(14.0, 36);

    // Devastating breakthrough explosion at Boss cannon muzzle
    this.spawnExplosion(bX, clash.bossOriginY, 'boom4', 360, 240);
    this.spawnExplosion(bX - 50, clash.bossOriginY + 20, 'boom3_1', 130, 130);
    this.spawnExplosion(bX + 50, clash.bossOriginY + 20, 'boom3_1', 130, 130);

    // Scheme A * 1.5 damage to Boss (Neo-Maxima Cannon power 325 * 1.5 = 488)
    const pDmg = pBeam ? pBeam.damage : 325;
    const bossBreakthroughDamage = Math.round(pDmg * 1.5);
    // Immediately terminate the active Tornado beam so it doesn't continue dealing tick damage
    this.activeTornadoBeam = null;
    this.beamClashDamageCooldown = 90; // 1.5s grace cooldown

    if (this.boss) {
      this.boss.hp -= bossBreakthroughDamage;
      this.boss.hitFlashTimer = 18;
      this.wonBeamClash = true;
      this.killedBossDuringBeam = true;
      // Award Medal #6 (index 5: Ultimate Beam Clash)
      if (this.saveManager.unlockMedal(5)) {
        this.showMedalUnlockedToast(5);
      }
      this.saveManager.save();

      if (this.boss.hp <= 0) {
        this.handleBossDefeat();
      }
    }

    this.beamClashState = null;
  }

  private triggerClashBossBreakthrough(clash: {
    active: boolean;
    clashX: number;
    clashY: number;
    bossOriginY: number;
    playerMuzzleY: number;
    pushProgress: number;
    mashCount: number;
    flashTimer: number;
    breakthroughTriggered: boolean;
  }) {
    if (clash.breakthroughTriggered) return;
    clash.breakthroughTriggered = true;

    const bBeam = this.activeBossBeam;
    const pX = this.playerSprite ? this.playerSprite.x : clash.clashX;

    // Player Tornado beam is shattered!
    this.activeTornadoBeam = null;
    if (this.beamClashHudContainer) this.beamClashHudContainer.visible = false;

    sounds.playSfx('boom', 1.0);
    this.triggerScreenShake(12.0, 30);
    this.spawnExplosion(pX, clash.playerMuzzleY, 'boom3_1', 140, 140);

    // Scheme A * 1.5 damage to Player (Boss base laser damage * 1.5)
    const bossBaseDmg = bBeam ? bBeam.damage : 40;
    const playerBreakthroughDamage = Math.round(bossBaseDmg * 1.5);
    if (this.playerSprite) {
      this.stageTookDamage = true;
      this.playerHp -= playerBreakthroughDamage;
      this.playerInvincibleTimer = 60; // 1.0s i-frame buffer
      this.damageVignetteTimer = 30;
      if (this.playerHp <= 0) {
        this.handlePlayerDefeat();
      }
    }

    this.beamClashState = null;
  }

  private updateBeamClashState(delta: number) {
    const isBossBeamActive = this.activeBossBeam && this.boss;
    const isTornadoActive = this.activeTornadoBeam && this.playerSprite;

    if (!isBossBeamActive || !isTornadoActive) {
      if (this.beamClashState && !this.beamClashState.breakthroughTriggered) {
        this.beamClashState = null;
        if (this.beamClashHudContainer) this.beamClashHudContainer.visible = false;
      }
      return;
    }

    const bBeam = this.activeBossBeam!;
    const pBeam = this.activeTornadoBeam!;
    const bX = bBeam.originX;
    const pX = pBeam.x;
    const bW = bBeam.beamWidth;
    const pW = pBeam.beamWidth;

    const isFacing = pBeam.y > bBeam.originY;
    // Generous alignment tolerance: beams clash as long as horizontal distance is within (bW + pW) * 0.9 (~130px)
    const isOverlapping = Math.abs(bX - pX) < (bW + pW) * 0.9;

    // Once locked into clash, maintain struggle even if slight horizontal offset occurs
    if (!this.beamClashState && (!isFacing || !isOverlapping)) {
      return;
    }

    // 1. Initialize or Maintain Clash State
    if (!this.beamClashState) {
      if (this.activeTornadoBeam) {
        this.activeTornadoBeam.hasHitBoss = true; // Zero damage during struggle: only the final push deals damage!
      }
      this.beamClashState = {
        active: true,
        clashX: (bX + pX) / 2,
        clashY: (bBeam.originY + pBeam.y) * 0.5,
        bossOriginY: bBeam.originY,
        playerMuzzleY: pBeam.y,
        pushProgress: 0.50, // Starts dead center (50%)
        mashCount: 0,
        flashTimer: 0,
        breakthroughTriggered: false
      };

      // If player was ALREADY holding down Space/J when clash triggered, mark as pressed!
      // This guarantees holding Space gives ZERO free push - player MUST release and tap!
      this.spacePressedThisClash = !!(this.keys[' '] || this.keys['j']);

      sounds.playSfx('laser', 1.0);
      this.triggerScreenShake(8.0, 24);
    }

    const clash = this.beamClashState;
    if (clash.breakthroughTriggered) return;

    // Check breakthrough BEFORE applying frame counter-push
    if (clash.pushProgress >= 0.92) {
      this.triggerClashPlayerBreakthrough(clash);
      return;
    }

    // 2. Dynamic Struggle Physics (Boss steadily advances unless player actively taps/mashes!)
    // Boss steady push forward: -0.0013 * delta (~0.078/sec, requires ~6.4s of complete player inactivity to lose from 0.50)
    // Holding Space gives ZERO free push: player MUST physically release and tap down!
    clash.pushProgress -= 0.0013 * delta;

    // Check again after frame push
    if (clash.pushProgress >= 0.92) {
      this.triggerClashPlayerBreakthrough(clash);
      return;
    }

    if (clash.pushProgress <= 0.08) {
      this.triggerClashBossBreakthrough(clash);
      return;
    }

    // Calculate clash coordinates linearly between Boss muzzle and Player nose
    const totalDist = clash.playerMuzzleY - (clash.bossOriginY + 35);
    const targetY = clash.playerMuzzleY - totalDist * clash.pushProgress;
    // Dynamic high-frequency vibration
    const jitterY = (Math.sin(this.stageTime * 2.2) * 3 + (Math.random() - 0.5) * 5);
    const jitterX = Math.sin(this.stageTime * 1.8) * 3;
    clash.clashY = targetY + jitterY;
    clash.clashX = (bX + pX) / 2 + jitterX;

    if (clash.flashTimer > 0) {
      clash.flashTimer -= delta;
    }

    // High frequency screen shake during struggle
    if (Math.floor(this.stageTime) % 6 === 0) {
      this.triggerScreenShake(3.0, 6);
    }
  }

  private renderBeamClashVisuals(delta: number) {
    if (!this.beamClashGfx) return;
    this.beamClashGfx.clear();

    if (!this.beamClashState || this.beamClashState.breakthroughTriggered) {
      if (this.beamClashHudContainer) this.beamClashHudContainer.visible = false;
      return;
    }

    const clash = this.beamClashState;
    const cx = clash.clashX;
    const cy = clash.clashY;
    const isBoss1 = this.boss?.type === 4;
    const bossColor = isBoss1 ? 0x00d8ff : 0xff3b10;

    // 1. Dual-Energy Shockwave Rings (Impact shockwave rings)
    const ringR = 26 + (Math.sin(this.stageTime * 0.6) * 6) + (clash.flashTimer * 3);
    this.beamClashGfx.ellipse(cx, cy, ringR * 1.8, ringR * 0.9);
    this.beamClashGfx.stroke({ color: bossColor, width: 2.5, alpha: 0.8 });
    this.beamClashGfx.ellipse(cx, cy, ringR * 2.3, ringR * 1.15);
    this.beamClashGfx.stroke({ color: 0xffd700, width: 2.0, alpha: 0.75 });

    // 2. Translucent Fusion Halo
    this.beamClashGfx.circle(cx, cy, ringR * 1.2);
    this.beamClashGfx.fill({ color: 0x00f0ff, alpha: 0.35 });

    // 3. Incandescent Pure White Clash Core
    this.beamClashGfx.circle(cx, cy, ringR * 0.6);
    this.beamClashGfx.fill({ color: 0xffffff, alpha: 0.95 });

    // 4. Anamorphic Glare Spikes (Horizontal white and cyan starburst glare)
    const spikeLen = 130 + (Math.sin(this.stageTime * 1.2) * 20) + (clash.flashTimer * 6);
    const spikeH = 5 + clash.flashTimer * 0.5;
    this.beamClashGfx.poly([
      { x: cx - spikeLen, y: cy },
      { x: cx, y: cy - spikeH },
      { x: cx + spikeLen, y: cy },
      { x: cx, y: cy + spikeH }
    ]);
    this.beamClashGfx.fill({ color: 0xffffff, alpha: 0.95 });

    this.beamClashGfx.poly([
      { x: cx - spikeLen * 1.4, y: cy },
      { x: cx, y: cy - spikeH * 1.8 },
      { x: cx + spikeLen * 1.4, y: cy },
      { x: cx, y: cy + spikeH * 1.8 }
    ]);
    this.beamClashGfx.fill({ color: 0x00e5ff, alpha: 0.45 });

    // 5. Lateral Violent Ion Lightning Discharge (Bilateral electric arcs)
    const boltSides = [-1, 1];
    for (const side of boltSides) {
      for (let b = 0; b < 3; b++) {
        const pts: number[] = [cx, cy];
        let lx = cx;
        let ly = cy;
        const totalLen = 65 + Math.random() * 80;
        const segments = 5;
        for (let seg = 1; seg <= segments; seg++) {
          lx += side * (totalLen / segments);
          ly = cy + (Math.sin(this.stageTime * 2.5 + seg * 3 + b * 2) * 12 + (Math.random() - 0.5) * 16);
          pts.push(lx, ly);
        }
        this.beamClashGfx.poly(pts);
        this.beamClashGfx.stroke({ color: b % 2 === 0 ? 0xffffff : 0xffd700, width: 2.0, alpha: 0.9 });
      }
    }

    // 6. Flying High-speed Plasma Sparks
    for (let sp = 0; sp < 8; sp++) {
      const spAng = Math.random() * Math.PI * 2;
      const spDist = ringR * (1.1 + Math.random() * 1.2);
      const sx = cx + Math.cos(spAng) * spDist;
      const sy = cy + Math.sin(spAng) * (spDist * 0.5);
      this.beamClashGfx.circle(sx, sy, 2 + Math.random() * 2);
      this.beamClashGfx.fill({ color: sp % 2 === 0 ? 0xffea00 : 0x00ffff, alpha: 0.85 });
    }

    // 7. Update Interactive HUD Bar (Option B)
    if (this.beamClashHudContainer && this.beamClashGaugeGfx) {
      this.beamClashHudContainer.visible = true;

      const hudW = 340;
      const hudH = 50;
      const hudX = (CANVAS_WIDTH - hudW) / 2;
      const hudY = 0;

      this.beamClashGaugeGfx.clear();

      // Outer sci-fi container box
      this.beamClashGaugeGfx.roundRect(hudX, hudY, hudW, hudH, 8);
      this.beamClashGaugeGfx.fill({ color: 0x0a1420, alpha: 0.88 });
      this.beamClashGaugeGfx.stroke({ color: 0x00f0ff, width: 1.8, alpha: 0.9 });

      // Power Struggle Track background
      const barX = hudX + 20;
      const barY = hudY + 28;
      const barW = hudW - 40;
      const barH = 12;
      this.beamClashGaugeGfx.roundRect(barX, barY, barW, barH, 4);
      this.beamClashGaugeGfx.fill({ color: 0x182436, alpha: 0.95 });
      this.beamClashGaugeGfx.stroke({ color: 0x334460, width: 1 });

      // Player push fill (Blazing Gold / Cyan)
      const fillW = Math.max(6, barW * clash.pushProgress);
      this.beamClashGaugeGfx.roundRect(barX, barY, fillW, barH, 4);
      const barColor = clash.pushProgress > 0.70 ? 0xffea00 : (clash.pushProgress > 0.35 ? 0x00f0ff : 0xff3344);
      this.beamClashGaugeGfx.fill({ color: barColor, alpha: 0.95 });

      // Midpoint 50% struggle equilibrium marker
      this.beamClashGaugeGfx.rect(barX + barW * 0.5 - 1, barY - 3, 2, barH + 6);
      this.beamClashGaugeGfx.fill({ color: 0xffffff, alpha: 0.65 });

      // Glowing tip on progress bar
      this.beamClashGaugeGfx.rect(barX + fillW - 4, barY - 2, 6, barH + 4);
      this.beamClashGaugeGfx.fill({ color: 0xffffff, alpha: 1.0 });

      // Dynamic prompt text based on struggle balance and holding status
      if (this.beamClashPromptText) {
        const pulse = 1.0 + (clash.flashTimer > 0 ? 0.15 : Math.sin(this.stageTime * 0.4) * 0.05);
        this.beamClashPromptText.scale.set(pulse, pulse);
        if (this.spacePressedThisClash && (this.keys[' '] || this.keys['j'])) {
          this.beamClashPromptText.text = "⚠️ 松开按键！松手后快速连拍 [SPACE]！⚠️";
          this.beamClashPromptText.style.fill = 0xff9900;
        } else if (clash.pushProgress < 0.35) {
          this.beamClashPromptText.text = "🚨 激光逼近！极速连按 [SPACE] 顶推！🚨";
          this.beamClashPromptText.style.fill = 0xff3344;
        } else if (clash.pushProgress >= 0.70) {
          this.beamClashPromptText.text = "🔥 优势压制！全功率输出即将顶爆！🔥";
          this.beamClashPromptText.style.fill = 0x00f0ff;
        } else {
          this.beamClashPromptText.text = "⚡ 连按 [SPACE] / [J] 蓄能顶推! ⚡";
          this.beamClashPromptText.style.fill = clash.flashTimer > 0 ? 0xffffff : 0xffea00;
        }
      }
    }
  }

  private updateRollEffects(delta: number) {
    if (!this.rollGfx) return;
    this.rollGfx.clear();

    // 1. Supersonic Prandtl-Glauert Vapor Cone Shockwave
    if (this.rollShockwave) {
      this.rollShockwave.r += 6.5 * delta;
      this.rollShockwave.alpha -= 0.065 * delta;

      if (this.rollShockwave.alpha <= 0 || this.rollShockwave.r >= this.rollShockwave.maxR) {
        this.rollShockwave = null;
      } else {
        const sw = this.rollShockwave;
        // Outer vapor ring
        this.rollGfx.ellipse(sw.x, sw.y, sw.r * 1.15, sw.r * 0.7);
        this.rollGfx.stroke({ color: 0xffffff, width: 2.5, alpha: sw.alpha * 0.75 });
        // Inner crisp pressure core
        this.rollGfx.ellipse(sw.x, sw.y, sw.r * 0.85, sw.r * 0.5);
        this.rollGfx.stroke({ color: 0x88e8ff, width: 1.5, alpha: sw.alpha * 0.9 });
      }
    }

    // 2. High-speed dual helical wingtip vortices drifting backward
    for (let i = this.rollVortices.length - 1; i >= 0; i--) {
      const v = this.rollVortices[i];
      v.leftY += 3.2 * delta;
      v.rightY += 3.2 * delta;
      v.r += 0.35 * delta;
      v.alpha -= 0.052 * delta;

      if (v.alpha <= 0) {
        this.rollVortices.splice(i, 1);
        continue;
      }

      // Left wingtip helical vortex droplet
      this.rollGfx.circle(v.leftX, v.leftY, v.r);
      this.rollGfx.fill({ color: v.color, alpha: v.alpha * 0.65 });
      this.rollGfx.circle(v.leftX, v.leftY, v.r + 1.5);
      this.rollGfx.stroke({ color: 0xffffff, width: 1, alpha: v.alpha * 0.4 });

      // Right wingtip helical vortex droplet
      this.rollGfx.circle(v.rightX, v.rightY, v.r);
      this.rollGfx.fill({ color: v.color, alpha: v.alpha * 0.65 });
      this.rollGfx.circle(v.rightX, v.rightY, v.r + 1.5);
      this.rollGfx.stroke({ color: 0xffffff, width: 1, alpha: v.alpha * 0.4 });
    }
  }

  private startVictorySequence(durationSeconds: number) {
    if (this.isVictorySequence || this.isStageEnding) return;
    this.isVictorySequence = true;
    this.victoryPhaseDuration = durationSeconds * 60; // Convert to frames (60fps)
    this.victoryPhaseTimer = 0;
    this.isPlayerFlyingOut = false;
    this.victoryPostFlyoutDelay = 0;
    this.groundExplosionSpawnTimer = 0;

    // Stage 5 clear: switch BGM to "You are always my hero" as golden light converges
    if (this.currentStageId === 5) {
      sounds.playBgm('you_are_always_my_hero.mp3');
    }

    // Stage 8 clear: duck BGM volume when victory explosions begin (soften rather than stopping)
    if (this.currentStageId === 8 && this.stage8Phase2Triggered) {
      const baseBgm = this.saveManager.profile.bgmVolume ?? 0.7;
      sounds.fadeBgm(baseBgm * 0.25, 1.5);
    }
  }

  private updateVictorySequence(delta: number) {
    if (!this.isVictorySequence || this.isStageEnding) return;

    this.victoryPhaseTimer += delta;

    // A. Stage 5 Phase 2 FX: Golden Light Streams Converging Towards Offscreen Far Upper Sky (Shining Tiga Omens)
    if (this.currentStageId === 5 && this.lightConvergenceGfx) {
      this.lightConvergenceGfx.clear();

      // Virtual singularity point far beyond upper screen edge (representing distant upper atmosphere)
      const targetX = CANVAS_WIDTH / 2;
      const targetY = -280;

      // Spawn incoming golden light streaks from 4 directions
      if (Math.random() < 0.65) {
        let spawnX = 0;
        let spawnY = 0;
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) { // Bottom edge
          spawnX = Math.random() * CANVAS_WIDTH;
          spawnY = CANVAS_HEIGHT + 30;
        } else if (edge === 1) { // Left edge
          spawnX = -30;
          spawnY = Math.random() * CANVAS_HEIGHT;
        } else if (edge === 2) { // Right edge
          spawnX = CANVAS_WIDTH + 30;
          spawnY = Math.random() * CANVAS_HEIGHT;
        } else { // Lower quadrants
          spawnX = Math.random() * CANVAS_WIDTH;
          spawnY = CANVAS_HEIGHT * 0.4 + Math.random() * (CANVAS_HEIGHT * 0.6);
        }

        this.lightRays.push({
          x: spawnX,
          y: spawnY,
          targetX,
          targetY,
          length: 35 + Math.random() * 55,
          speed: 8 + Math.random() * 10,
          alpha: 0.6 + Math.random() * 0.4,
          width: 2 + Math.random() * 3
        });
      }

      // Render & move light rays
      for (let i = this.lightRays.length - 1; i >= 0; i--) {
        const ray = this.lightRays[i];
        const dx = ray.targetX - ray.x;
        const dy = ray.targetY - ray.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 30 || ray.y < -350) {
          this.lightRays.splice(i, 1);
          continue;
        }

        const angle = Math.atan2(dy, dx);
        ray.x += Math.cos(angle) * ray.speed * delta;
        ray.y += Math.sin(angle) * ray.speed * delta;
        ray.speed += 0.25 * delta; // Accelerate towards the distant golden singularity!

        const tailX = ray.x - Math.cos(angle) * ray.length;
        const tailY = ray.y - Math.sin(angle) * ray.length;

        // Outer soft golden ray
        this.lightConvergenceGfx.moveTo(tailX, tailY);
        this.lightConvergenceGfx.lineTo(ray.x, ray.y);
        this.lightConvergenceGfx.stroke({ color: 0xffd700, width: ray.width + 2, alpha: ray.alpha * 0.35 });

        // Core bright white-gold light streak
        this.lightConvergenceGfx.moveTo(tailX, tailY);
        this.lightConvergenceGfx.lineTo(ray.x, ray.y);
        this.lightConvergenceGfx.stroke({ color: 0xfffae0, width: ray.width, alpha: ray.alpha });
      }

      // Upper horizon ambient golden bloom glow
      const bloomProgress = Math.min(1.0, this.victoryPhaseTimer / this.victoryPhaseDuration);
      this.lightConvergenceGfx.ellipse(CANVAS_WIDTH / 2, 0, CANVAS_WIDTH * 0.8, 90);
      this.lightConvergenceGfx.fill({ color: 0xffd700, alpha: 0.12 + 0.18 * bloomProgress });
    }

    // B. Stage 8 Phase 2 FX: High-Impact Ground Base Chain Explosions (Strictly rendered below planes on ground)
    if (this.currentStageId === 8 && this.stage8Phase2Triggered && this.groundExplosionsGfx) {
      this.groundExplosionsGfx.clear();

      // Trigger heavy surface facility chain detonations (Paced organically: ~2.5 - 3 major shockwave detonations per second)
      this.groundExplosionSpawnTimer += delta;
      if (this.groundExplosionSpawnTimer >= 22) {
        this.groundExplosionSpawnTimer = Math.random() * 6; // Reset with slight random variation (16-22 frame cadence)
        const gx = 80 + Math.random() * (CANVAS_WIDTH - 160);
        const gy = 100 + Math.random() * (CANVAS_HEIGHT - 220);
        const maxR = 45 + Math.random() * 40;

        // Organic Fireball Puffs (Monte Carlo dispersion like Stage 5 dark mist)
        const firePuffs: Array<{ ox: number; oy: number; r: number; color: number; alphaMult: number }> = [];
        const numFirePuffs = 16 + Math.floor(Math.random() * 8);
        for (let p = 0; p < numFirePuffs; p++) {
          const u = Math.random();
          const dist = Math.sqrt(u) * (maxR * 0.85);
          const theta = Math.random() * Math.PI * 2;
          const distRatio = dist / (maxR * 0.85);
          // Core is white-hot/yellow, mid is bright orange, outer is deep flame crimson/smoke
          let pColor = 0xff3b10;
          if (distRatio < 0.28) {
            pColor = 0xffffff;
          } else if (distRatio < 0.55) {
            pColor = 0xffaa00;
          } else if (distRatio < 0.82) {
            pColor = 0xff4b10;
          } else {
            pColor = 0xcc2200;
          }

          firePuffs.push({
            ox: Math.cos(theta) * dist,
            oy: Math.sin(theta) * dist * 0.85,
            r: (14 + Math.random() * 18) * (1.2 - distRatio * 0.4),
            color: pColor,
            alphaMult: 0.6 + (1 - distRatio) * 0.4
          });
        }

        // Billowing irregular smoke clusters (each billow composed of multiple micro-puffs to avoid circular shape)
        const smokeBillows: Array<{ ox: number; oy: number; r: number; vx: number; vy: number; alpha: number; subPuffs: Array<{ ox: number; oy: number; r: number }> }> = [];
        const numPuffs = 10 + Math.floor(Math.random() * 6);
        for (let p = 0; p < numPuffs; p++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * (maxR * 0.85);
          const baseR = 16 + Math.random() * 22;
          const subPuffs: Array<{ ox: number; oy: number; r: number }> = [];
          for (let sp = 0; sp < 4; sp++) {
            const sAng = Math.random() * Math.PI * 2;
            const sDist = Math.random() * (baseR * 0.55);
            subPuffs.push({
              ox: Math.cos(sAng) * sDist,
              oy: Math.sin(sAng) * sDist,
              r: baseR * (0.6 + Math.random() * 0.45)
            });
          }

          smokeBillows.push({
            ox: Math.cos(angle) * dist,
            oy: Math.sin(angle) * dist * 0.75,
            r: baseR,
            vx: (Math.random() - 0.5) * 1.0,
            vy: -0.6 - Math.random() * 1.5,
            alpha: 0.88,
            subPuffs
          });
        }

        // Irregular Scorched Crater Puffs (Fractured charring clusters, NOT a single round circle)
        const craterPuffs: Array<{ ox: number; oy: number; r: number; alphaMult: number }> = [];
        const numCraterPuffs = 14 + Math.floor(Math.random() * 6);
        for (let cp = 0; cp < numCraterPuffs; cp++) {
          const u = Math.random();
          const dist = Math.sqrt(u) * (maxR * 0.9);
          const cTheta = Math.random() * Math.PI * 2;
          craterPuffs.push({
            ox: Math.cos(cTheta) * dist,
            oy: Math.sin(cTheta) * dist * 0.7,
            r: 12 + Math.random() * 18,
            alphaMult: 0.5 + Math.random() * 0.5
          });
        }

        // Shrapnel & debris flying outward
        const debris: Array<{ x: number; y: number; vx: number; vy: number; r: number; alpha: number }> = [];
        for (let d = 0; d < 14; d++) {
          const dAngle = Math.random() * Math.PI * 2;
          const spd = 2.0 + Math.random() * 5.0;
          debris.push({
            x: gx,
            y: gy,
            vx: Math.cos(dAngle) * spd,
            vy: Math.sin(dAngle) * spd * 0.7,
            r: 1.5 + Math.random() * 3.0,
            alpha: 1.0
          });
        }

        this.groundNukeStrikes.push({
          x: gx,
          y: gy,
          age: 0,
          maxAge: 70,
          maxRadius: maxR,
          shockwaveRadius: 10,
          firePuffs,
          craterPuffs,
          smokeBillows,
          debris
        });

        // Heavy cinematic ground impact sound with shockwave diffusion & tactical screen shake
        const pitchMod = 0.90 + Math.random() * 0.22; // Natural pitch and acoustic variation
        sounds.playCinematicBoom(0.85 + Math.random() * 0.15, pitchMod);
        this.triggerScreenShake(4.0 + Math.random() * 2.0, 10);
      }

      // Render & update ground nuke detonations
      for (let i = this.groundNukeStrikes.length - 1; i >= 0; i--) {
        const strike = this.groundNukeStrikes[i];
        strike.age += delta;
        strike.y += this.bgScrollSpeed * delta; // Scroll with earth terrain!
        strike.shockwaveRadius += 4.5 * delta;

        if (strike.age >= strike.maxAge || strike.y > CANVAS_HEIGHT + 120) {
          this.groundNukeStrikes.splice(i, 1);
          continue;
        }

        const progress = strike.age / strike.maxAge;

        // 1. Permanent ground scorched crater: Render fractured charring puffs (No single solid circle!)
        for (const cp of strike.craterPuffs) {
          const px = strike.x + cp.ox;
          const py = strike.y + cp.oy;
          this.groundExplosionsGfx.circle(px, py, cp.r);
          this.groundExplosionsGfx.fill({ color: 0x0f0502, alpha: 0.65 * cp.alphaMult * (1 - progress * 0.45) });
        }

        // 2. Initial Organic Fireball Dome (Monte Carlo circular puffs cluster, fading smoothly)
        if (progress < 0.5) {
          const fireballProg = progress / 0.5;
          const scaleMult = 0.4 + 0.6 * Math.sin(fireballProg * Math.PI * 0.5);
          const fireAlpha = 1.0 - fireballProg;

          for (const puff of strike.firePuffs) {
            const px = strike.x + puff.ox * scaleMult;
            const py = strike.y + puff.oy * scaleMult;
            const pr = puff.r * scaleMult;

            this.groundExplosionsGfx.circle(px, py, pr);
            this.groundExplosionsGfx.fill({ color: puff.color, alpha: fireAlpha * puff.alphaMult });
          }
        }

        // 3. Ground Shockwave Dust Arcs (fractured dust fragments instead of a single perfect geometric circle)
        if (strike.shockwaveRadius < strike.maxRadius * 2.8) {
          const swAlpha = Math.max(0, 1 - (strike.shockwaveRadius / (strike.maxRadius * 2.8)));
          const numArcs = 7;
          for (let a = 0; a < numArcs; a++) {
            const arcStart = (a * Math.PI * 2) / numArcs + (a * 0.2);
            const arcEnd = arcStart + (Math.PI / numArcs) * 0.75;
            this.groundExplosionsGfx.arc(strike.x, strike.y, strike.shockwaveRadius, arcStart, arcEnd);
            this.groundExplosionsGfx.stroke({ color: 0xffcaa0, width: 2.5 * swAlpha, alpha: swAlpha * 0.65 });
          }
        }

        // 4. Volumetric Irregular Smoke Clouds (composed of sub-puffs like Stage 5 dark mist)
        for (const smoke of strike.smokeBillows) {
          smoke.ox += smoke.vx * delta;
          smoke.oy += smoke.vy * delta;
          smoke.r += 0.35 * delta;
          smoke.alpha -= 0.014 * delta;

          if (smoke.alpha > 0) {
            const sx = strike.x + smoke.ox;
            const sy = strike.y + smoke.oy;
            for (const sp of smoke.subPuffs) {
              this.groundExplosionsGfx.circle(sx + sp.ox, sy + sp.oy, sp.r + (smoke.r - 18) * 0.4);
              this.groundExplosionsGfx.fill({ color: 0x141013, alpha: smoke.alpha * 0.45 });
            }
          }
        }

        // 5. Burning Ground Debris flying
        for (const d of strike.debris) {
          d.x += d.vx * delta;
          d.y += (d.vy + this.bgScrollSpeed) * delta;
          d.alpha -= 0.02 * delta;
          if (d.alpha > 0) {
            this.groundExplosionsGfx.circle(d.x, d.y, d.r);
            this.groundExplosionsGfx.fill({ color: 0xffaa20, alpha: d.alpha });
          }
        }
      }
    }

    // C. When victory countdown completes (3s or 5s): Lock input and fly upward at 1.5x speed!
    if (this.victoryPhaseTimer >= this.victoryPhaseDuration && !this.isPlayerFlyingOut) {
      this.isPlayerFlyingOut = true;
      // Play afterburner thruster sound
      sounds.playSfx('laser', 0.4);
    }
  }

  // Stage 8 Phase 2 Finale Cinematic Blinding Whiteout & Tinnitus Ring-out
  private updateStage8Whiteout(delta: number) {
    if (!this.isWhiteoutActive || !this.whiteoutGfx) return;

    // 1. Initial Moment: Trigger Rising Tinnitus Tone and Whole-screen Earthquake Shake
    if (!this.whiteoutSfxTriggered) {
      this.whiteoutSfxTriggered = true;
      sounds.playTinnitus(3.8); // 3.8s procedural rising binaural resonance
      // Music continues playing softly in the background (ducked to ~25%)
      this.triggerScreenShake(16.0, 48); // Heavy full-screen shockwave rumble (amplitude 16, 48 frames)
    }

    // 2. Phase 1: Whiteout alpha ramps from 0.0 to 1.0 over ~0.8s (48 frames)
    if (this.whiteoutProgress < 1.0) {
      this.whiteoutProgress = Math.min(1.0, this.whiteoutProgress + (1.0 / 48) * delta);
    } else {
      // 3. Phase 2: Sustain solid blinding white for 2.0s (120 frames @ 60fps)
      this.whiteoutHoldTimer += delta;
      if (this.whiteoutHoldTimer >= 120) {
        this.isWhiteoutActive = false;
        this.handleStageWin();
        return;
      }
    }

    // 4. Render pure blinding white across entire viewport
    this.whiteoutGfx.clear();
    this.whiteoutGfx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.whiteoutGfx.fill({ color: 0xffffff, alpha: this.whiteoutProgress });
  }

  private triggerBarrelRoll(direction: number) {
    if (this.isPlayerFlyingOut) return;
    this.isRolling = true;
    this.rollTimer = 0;
    this.rollDirection = direction;
    sounds.playSfx('laser', 0.5);

    if (this.playerSprite) {
      this.rollShockwave = {
        x: this.playerSprite.x,
        y: this.playerSprite.y,
        r: 12,
        maxR: 90,
        alpha: 0.95
      };
    }
  }

  // Update Charging Particle Effects (Gradient, non-static)
  private updateChargeParticleEffects(_delta: number) {
    // 1. Player charged weapon effect (Fighter 11 MAX Cannon or Fighter 12 Tornado Thunder)
    if (this.chargeEffectGfx) {
      this.chargeEffectGfx.clear();
      const isChargingFighter = this.currentFighterId === 11 || this.currentFighterId === 12;
      const chargeThresh = this.currentFighterId === 12 ? 15 : 18;
      const chargeMax = this.currentFighterId === 12 ? 32 : 38;

      if (this.playerSprite && isChargingFighter && this.maxCannonChargeCount >= chargeThresh) {
        const px = this.playerSprite.x;
        const py = this.playerSprite.y - (this.currentFighterId === 12 ? 46 : 38);
        const progress = Math.min(1.0, (this.maxCannonChargeCount - chargeThresh) / (chargeMax - chargeThresh));
        const radius = (this.currentFighterId === 12 ? 28 : 24) * (1 - progress * 0.4) + Math.sin(this.stageTime * 0.3) * 3;
        const alpha = 0.25 + 0.65 * progress;

        const coreColor = this.currentFighterId === 12 ? 0x00f0ff : 0xffe600;
        const ringColor = this.currentFighterId === 12 ? 0xff0055 : 0x00f0ff;

        this.chargeEffectGfx.circle(px, py, radius * 0.5);
        this.chargeEffectGfx.fill({ color: coreColor, alpha: alpha * 0.8 });
        this.chargeEffectGfx.circle(px, py, radius);
        this.chargeEffectGfx.stroke({ color: ringColor, width: 2, alpha });

        const particleCount = Math.floor(6 + progress * 8);
        for (let i = 0; i < particleCount; i++) {
          const angle = (this.stageTime * 0.15) + (i * (Math.PI * 2 / particleCount));
          const dist = radius * (1.2 + 0.6 * Math.sin(this.stageTime * 0.2 + i));
          const pX = px + Math.cos(angle) * dist;
          const pY = py + Math.sin(angle) * dist;
          this.chargeEffectGfx.circle(pX, pY, 2 + progress * 2);
          this.chargeEffectGfx.fill({ color: i % 2 === 0 ? 0xffea00 : 0x00f0ff, alpha: alpha * 0.9 });
        }
      }
    }

    // 2. Boss charged laser beam effect (Boss 1 & Boss 2 when laserCooldown >= 100 out of 160)
    if (this.bossChargeEffectGfx) {
      this.bossChargeEffectGfx.clear();
      if (this.boss && (this.boss.hp < this.boss.maxHp * 0.6) && this.boss.laserCooldown >= 100) {
        const bx = this.boss.sprite.x;
        const by = this.boss.sprite.y + (this.boss.type === 4 ? 120 : 100);
        const progress = Math.min(1.0, (this.boss.laserCooldown - 100) / 60);
        const radius = 32 * (1 - progress * 0.3) + Math.sin(this.stageTime * 0.35) * 4;
        const alpha = 0.2 + 0.8 * progress;
        const color = this.boss.type === 4 ? 0x00ffff : 0xff3b30;

        this.bossChargeEffectGfx.circle(bx, by, radius * 0.6);
        this.bossChargeEffectGfx.fill({ color: 0xffffff, alpha: alpha * 0.9 });
        this.bossChargeEffectGfx.circle(bx, by, radius);
        this.bossChargeEffectGfx.stroke({ color, width: 3, alpha });

        const sparkCount = Math.floor(8 + progress * 10);
        for (let i = 0; i < sparkCount; i++) {
          const angle = (-this.stageTime * 0.2) + (i * (Math.PI * 2 / sparkCount));
          const dist = radius * (1.4 + 0.8 * Math.cos(this.stageTime * 0.25 + i));
          const sX = bx + Math.cos(angle) * dist;
          const sY = by + Math.sin(angle) * dist;
          this.bossChargeEffectGfx.circle(sX, sY, 2 + progress * 2.5);
          this.bossChargeEffectGfx.fill({ color: i % 2 === 0 ? 0xffffff : color, alpha: alpha });
        }
      }
    }
  }

  // ==========================================
  // BULLET FIRING SYSTEM
  // ==========================================
  private firePlayerBullet() {
    if (!this.playerSprite) return;
    const spec = FIGHTERS[this.currentFighterId] || FIGHTERS[0];
    const px = this.playerSprite.x;
    const py = this.playerSprite.y;

    if (spec.id === 0) {
      this.spawnBulletEntity(px, py - 30, 0, -14, spec.damage, false, 'bullet_0.png');
    } else if (spec.id === 1) {
      this.spawnBulletEntity(px - 15, py - 25, 0, -14, spec.damage, false, 'bullet_1.png');
      this.spawnBulletEntity(px + 15, py - 25, 0, -14, spec.damage, false, 'bullet_1.png');
    } else if (spec.id === 2) {
      this.spawnBulletEntity(px - 18, py - 25, 0, -15, spec.damage, false, 'bullet_2.png');
      this.spawnBulletEntity(px + 18, py - 25, 0, -15, spec.damage, false, 'bullet_2.png');
    } else if (spec.id === 3) {
      this.spawnBulletEntity(px - 22, py - 20, -1, -16, spec.damage, false, 'bullet_3.png');
      this.spawnBulletEntity(px, py - 30, 0, -17, spec.damage, false, 'bullet_3.png');
      this.spawnBulletEntity(px + 22, py - 20, 1, -16, spec.damage, false, 'bullet_3.png');
    } else if (spec.id === 4) {
      this.spawnBulletEntity(px - 20, py - 25, 0, -16, spec.damage, false, 'bullet_6.png');
      this.spawnBulletEntity(px + 20, py - 25, 0, -16, spec.damage, false, 'bullet_6.png');
    } else if (spec.id === 5) {
      this.spawnBulletEntity(px - 22, py - 25, 0, -15, spec.damage, false, 'bullet_7.png');
      this.spawnBulletEntity(px + 22, py - 25, 0, -15, spec.damage, false, 'bullet_7.png');
    } else if (spec.id === 6) {
      this.spawnBulletEntity(px - 25, py - 20, 0, -16, spec.damage, false, 'bullet_6.png');
      this.spawnBulletEntity(px, py - 30, 0, -17, spec.damage, false, 'bullet_1.png');
      this.spawnBulletEntity(px + 25, py - 20, 0, -16, spec.damage, false, 'bullet_6.png');
    } else if (spec.id === 7) {
      this.spawnBulletEntity(px - 25, py - 20, 0, -16, spec.damage, false, 'bullet_8.png');
      this.spawnBulletEntity(px, py - 35, 0, -18, spec.damage * 1.5, false, 'b1.png');
      this.spawnBulletEntity(px + 25, py - 20, 0, -16, spec.damage, false, 'bullet_8.png');
    } else if (spec.id === 8) {
      this.spawnBulletEntity(px - 26, py - 20, 0, -17, spec.damage, false, 'bullet_9.png');
      this.spawnBulletEntity(px, py - 35, 0, -18, spec.damage * 2, false, 'bullet_9.png');
      this.spawnBulletEntity(px + 26, py - 20, 0, -17, spec.damage, false, 'bullet_9.png');
    } else if (spec.id === 9) {
      this.spawnBulletEntity(px - 28, py - 20, -1.2, -15, spec.damage, false, 'bullet_7.png');
      this.spawnBulletEntity(px, py - 30, 0, -16, spec.damage, false, 'bullet_7.png');
      this.spawnBulletEntity(px + 28, py - 20, 1.2, -15, spec.damage, false, 'bullet_7.png');
    } else if (spec.id === 10) {
      this.spawnBulletEntity(px - 32, py - 18, 0, -15, spec.damage, false, 'bullet_8.png');
      this.spawnBulletEntity(px, py - 30, 0, -16, spec.damage, false, 'bullet_7.png');
      this.spawnBulletEntity(px + 32, py - 18, 0, -15, spec.damage, false, 'bullet_8.png');
    } else if (spec.id === 11) {
      this.maxCannonChargeCount++;
      const isMaxReady = this.maxCannonChargeCount >= 38;

      this.spawnBulletEntity(px - 38, py - 15, -1, -16, spec.damage, false, 'bullet_8.png');
      this.spawnBulletEntity(px - 18, py - 25, 0, -17, spec.damage, false, 'bullet_6.png');
      if (isMaxReady) {
        this.spawnBulletEntity(px, py - 40, 0, -18, spec.damage * 3.5, false, 'MAX.png');
        this.maxCannonChargeCount = 0;
        sounds.playSfx('laser', 0.7);
      } else {
        this.spawnBulletEntity(px, py - 32, 0, -17, spec.damage, false, 'b1.png');
      }
      this.spawnBulletEntity(px + 18, py - 25, 0, -17, spec.damage, false, 'bullet_6.png');
      this.spawnBulletEntity(px + 38, py - 15, 1, -16, spec.damage, false, 'bullet_8.png');
    } else if (spec.id === 12) {
      // Fighter 12: SUPER GUTS GUTS Eagle Tri-Docking Flagship
      this.maxCannonChargeCount++;
      const isThunderReady = this.maxCannonChargeCount >= 32;

      // Alpha Unit: Twin nose lasers
      this.spawnBulletEntity(px - 14, py - 35, 0, -18, spec.damage, false, 'bullet_8.png');
      this.spawnBulletEntity(px + 14, py - 35, 0, -18, spec.damage, false, 'bullet_8.png');

      // Beta Unit: Heavy broadside wing cannons
      this.spawnBulletEntity(px - 45, py - 20, -0.8, -17, spec.damage * 1.1, false, 'bullet_9.png');
      this.spawnBulletEntity(px + 45, py - 20, 0.8, -17, spec.damage * 1.1, false, 'bullet_9.png');

      // Gamma Unit & Central Core: Neo-Maxima Tornado Thunder Cannon
      if (isThunderReady) {
        this.maxCannonChargeCount = 0;
        this.activeTornadoBeam = {
          x: px,
          y: py - 40,
          timer: 0,
          duration: 90, // ~1.5s continuous full-screen tornado beam (ample window for beam clash!)
          beamWidth: 88,
          damage: spec.damage * 6.5,
          hasHitBoss: false
        };
        sounds.playSfx('tornado', 1.0);
        this.triggerScreenShake(7.5, 18);
      } else {
        this.spawnBulletEntity(px, py - 30, 0, -18, spec.damage, false, 'bullet_2.png');
      }
    }

    sounds.playSfx('shoot', 0.35);
  }

  private fireEnemyBulletsForType(em: ActiveEnemy) {
    const ex = em.sprite.x;
    const ey = em.sprite.y + 20;

    // Check if enemy is in angled flanking slash
    const isFlank = em.movementMode === 'flank_slash';
    const flankAngX = isFlank ? (em.flankSide === 'left' ? 2.8 : -2.8) : 0;

    if (em.type === 1) {
      // Stage 1 scout bullet: fast & crisp (vy: 7.8 instead of slow 4.2)
      this.spawnBulletEntity(ex, ey, flankAngX, 7.8, 10, true, 'e1_bullet.png');
    } else if (em.type === 2) {
      this.spawnBulletEntity(ex - 15, ey, flankAngX, 7.2, 14, true, 'e2_bullet.png');
      this.spawnBulletEntity(ex + 15, ey, flankAngX, 7.2, 14, true, 'e2_bullet.png');
    } else if (em.type === 3) {
      this.spawnBulletEntity(ex - 20, ey, flankAngX - 1.2, 7.5, 18, true, 'Ebullet_1.png');
      this.spawnBulletEntity(ex, ey, flankAngX, 8.0, 18, true, 'Ebullet_1.png');
      this.spawnBulletEntity(ex + 20, ey, flankAngX + 1.2, 7.5, 18, true, 'Ebullet_1.png');
    } else if (em.type === 4 || em.type === 7) {
      this.spawnBulletEntity(ex - 15, ey, flankAngX, 7.6, 20, true, 'Ebullet_2.png');
      this.spawnBulletEntity(ex + 15, ey, flankAngX, 7.6, 20, true, 'Ebullet_2.png');
    } else if (em.type === 5 || em.type === 6) {
      // Zoiger dark fireballs (Exclusive to Stage 5 Tiga ancient beasts)
      this.spawnBulletEntity(ex - 25, ey, flankAngX - 0.8, 6.2, 26, true, 'Ebullet_3.png');
      this.spawnBulletEntity(ex + 25, ey, flankAngX + 0.8, 6.2, 26, true, 'Ebullet_3.png');
    } else if (em.type === 8) {
      this.spawnBulletEntity(ex - 25, ey, flankAngX - 1.4, 7.2, 24, true, 'Ebullet_4.png');
      this.spawnBulletEntity(ex, ey, flankAngX, 7.8, 26, true, 'Ebullet_4.png');
      this.spawnBulletEntity(ex + 25, ey, flankAngX + 1.4, 7.2, 24, true, 'Ebullet_4.png');
    } else if (em.type === 11) {
      // Enemy F1-J Falcon: dual high-velocity interceptor burst cannons
      this.spawnBulletEntity(ex - 16, ey, flankAngX, 8.2, 20, true, 'e2_bullet.png');
      this.spawnBulletEntity(ex + 16, ey, flankAngX, 8.2, 20, true, 'e2_bullet.png');
    } else if (em.type === 12) {
      // Enemy F2-S Striker: heavy 3-way armor-piercing shells
      this.spawnBulletEntity(ex - 22, ey, flankAngX - 1.0, 7.8, 24, true, 'Ebullet_1.png');
      this.spawnBulletEntity(ex, ey + 4, flankAngX, 8.5, 28, true, 'b1.png'); // Heavy AP penetrator
      this.spawnBulletEntity(ex + 22, ey, flankAngX + 1.0, 7.8, 24, true, 'Ebullet_1.png');
    } else if (em.type === 13) {
      // Enemy F3-V Viper: high-frequency pulse spread lasers (Authentic fighter laser bullet_2.png, NO MONSTER FIREBALLS)
      this.spawnBulletEntity(ex - 20, ey, flankAngX - 1.2, 8.4, 26, true, 'bullet_2.png');
      this.spawnBulletEntity(ex + 20, ey, flankAngX + 1.2, 8.4, 26, true, 'bullet_2.png');
    }
  }

  private spawnBulletEntity(x: number, y: number, vx: number, vy: number, damage: number, isEnemy: boolean, texName: string, isUnstoppableBeam: boolean = false) {
    let tex = Assets.get(`assets/sprites/common/${texName}`);
    if (!tex) tex = Texture.WHITE;

    const bSp = new Sprite(tex);
    bSp.anchor.set(0.5);

    if (texName === 'MAX.png' || texName === 'bullet_MAX.png') {
      bSp.width = 44; bSp.height = 88;
      bSp.blendMode = 'add';
    } else if (texName === 'bullet_7.png') {
      bSp.width = 36; bSp.height = 72;
    } else if (texName === 'bullet_6.png') {
      bSp.width = 20; bSp.height = 60;
    } else if (texName === 'b1.png') {
      bSp.width = 12; bSp.height = 30;
    } else if (texName === 'Ebullet_1.png' || texName === 'Ebullet_2.png') {
      bSp.width = 10; bSp.height = 22;
    } else if (texName === 'Ebullet_3.png') {
      bSp.width = 44; bSp.height = 44;
    } else if (texName === 'Ebullet_4.png') {
      bSp.width = 15; bSp.height = 30;
    } else if (texName === 'Ebullet_5.png') {
      bSp.width = 50; bSp.height = 50;
    } else if (texName === 'Elight.png') {
      bSp.width = 32; bSp.height = 650;
      bSp.blendMode = 'add';
    } else if (texName === 'Efire.png') {
      bSp.width = 160; bSp.height = 720;
      bSp.blendMode = 'add';
    } else if (texName === 'e1_bullet.png' || texName === 'e2_bullet.png') {
      bSp.width = 24; bSp.height = 56;
    } else if (texName === 'bullet_0.png') {
      bSp.width = 32; bSp.height = 55;
    } else if (texName === 'bullet_1.png' || texName === 'bullet_8.png') {
      bSp.width = 18; bSp.height = 50;
    } else {
      bSp.width = 20; bSp.height = 45;
    }

    bSp.position.set(x, y);
    // Align bullet sprite orientation to actual velocity direction
    if (vx !== 0) {
      bSp.rotation = Math.atan2(vy, vx) - Math.PI / 2;
    }
    this.gameLayer.addChild(bSp);
    this.bullets.push({ sprite: bSp, vx, vy, damage, isEnemy, isUnstoppableBeam });
  }

  // ==========================================
  // EXPLOSIONS
  // ==========================================
  private triggerScreenShake(intensity: number, duration: number) {
    this.screenShakeIntensity = intensity;
    this.screenShakeTimer = duration;
  }

  private spawnEnemyExplosion(x: number, y: number, type: number) {
    this.triggerScreenShake(3.5, 6);
    if (type === 1) {
      // Enemy 1 (Scout): 4 frames boom1
      this.spawnExplosion(x, y, 'boom1', 57, 51);
    } else if (type === 5 || type === 6) {
      // Enemy 5 & 6 (Zoiger 1 & 2): 8 frames boom2
      this.spawnExplosion(x, y, 'boom2', 99, 100);
    } else if (type === 7 || type === 9) {
      // Enemy 7 & 9 (Interceptor & Meteorite): 4 frames boom3_2
      this.spawnExplosion(x, y, 'boom3_2', 48, 48);
    } else {
      // Enemy 2, 3, 8, 11, 12, 13 (Medium/heavy & rebel fighters): 7 frames boom3_1
      this.spawnExplosion(x, y, 'boom3_1', 72, 72);
    }
  }

  private spawnExplosion(x: number, y: number, type: 'boom1' | 'boom2' | 'boom3_1' | 'boom3_2' | 'boom4', w: number, h: number) {
    let totalFrames = 4;
    let delay = 5;
    if (type === 'boom1') { totalFrames = 4; delay = 6; }
    else if (type === 'boom2') { totalFrames = 8; delay = 6; }
    else if (type === 'boom3_1') { totalFrames = 7; delay = 5; }
    else if (type === 'boom3_2') { totalFrames = 4; delay = 5; }
    else if (type === 'boom4') { totalFrames = 29; delay = 3; }

    const firstTex = Assets.get(`assets/sprites/booms/${type}_0.png`) || Texture.WHITE;
    const sp = new Sprite(firstTex);
    sp.anchor.set(0.5);
    sp.width = w;
    sp.height = h;
    sp.position.set(x, y);
    if (type === 'boom4') {
      sp.blendMode = 'add';
    }
    this.gameLayer.addChild(sp);

    this.explosions.push({
      sprite: sp,
      type,
      frame: 0,
      timer: 0,
      delay,
      totalFrames
    });

    sounds.playSfx('boom', type === 'boom4' ? 1.0 : 0.45);
  }

  private updateExplosions(delta: number) {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const ex = this.explosions[i];
      ex.timer += delta;
      if (ex.timer >= ex.delay) {
        ex.timer = 0;
        ex.frame++;
        if (ex.frame >= ex.totalFrames) {
          this.gameLayer.removeChild(ex.sprite);
          ex.sprite.destroy();
          this.explosions.splice(i, 1);
          continue;
        }
        const tex = Assets.get(`assets/sprites/booms/${ex.type}_${ex.frame}.png`);
        if (tex) ex.sprite.texture = tex;
      }
    }
  }

  // ==========================================
  // STAGE SPAWN LOGIC & BOSS ENTRANCES
  // ==========================================
  private handleSpawns() {
    if (this.isStageEnding || this.isVictorySequence) return;
    const stage = STAGES[this.currentStageId];
    if (!stage) return;

    const maxEnemies = this.currentStageId >= 6 ? 7 : 5;
    const spawnInterval = this.currentStageId >= 6 ? 20 : 30;

    this.spawnTicker++;
    if (this.spawnTicker % spawnInterval === 0 && this.enemies.length < maxEnemies) {
      let enemyType = 0;

      if (this.currentStageId <= 3) {
        enemyType = this.currentStageId;
      } else if (this.currentStageId === 4) {
        if (this.score < 50) {
          enemyType = Math.floor(Math.random() * 3) + 1;
        } else if (this.boss && this.enemies.length < 2) {
          // Boss escort harasser (Enemy 2 or 3)
          enemyType = Math.random() < 0.6 ? 2 : 3;
        }
      } else if (this.currentStageId === 5) {
        enemyType = Math.random() < 0.5 ? 5 : 6;
      } else if (this.currentStageId === 6) {
        enemyType = Math.random() < 0.5 ? 7 : 9;
      } else if (this.currentStageId === 7) {
        enemyType = 8;
      } else if (this.currentStageId === 8) {
        if (this.score <= 215 && !this.stage8Phase2Triggered) {
          enemyType = Math.random() < 0.5 ? 7 : 8;
        } else if (this.stage8Phase2Triggered) {
          // In Phase 2: enemies 11, 12, 13 (Conventional fleet: F1-J Falcon, F2-S Striker, F3-V Viper - strictly NO trainer plane and NO Tiga planes!)
          enemyType = Math.floor(Math.random() * 3) + 11;
        }
        if (this.boss && this.enemies.length < 2) {
          // Boss 2 escort harasser
          enemyType = Math.random() < 0.5 ? 7 : 8;
        }
      }

      if (enemyType > 0) {
        // Decide formation vs flank slash
        const isFlankEligible = (this.currentStageId === 4 || this.currentStageId === 8) && Math.random() < 0.45;
        if (isFlankEligible) {
          const side = Math.random() < 0.5 ? 'left' : 'right';
          this.spawnEnemy(enemyType, 'flank_slash', side);
        } else if (Math.random() < 0.35 && this.currentStageId >= 2) {
          // V-formation: 1 leader + 1 wingman
          this.spawnEnemy(enemyType, 'v_formation');
        } else {
          this.spawnEnemy(enemyType, 'dive');
        }
      }
    }

    // Boss 1 entrance: Stage 4, score >= 50, screen clear
    if (this.currentStageId === 4 && this.score >= 50 && this.enemies.length === 0 && !this.bossSpawned && !this.boss) {
      this.bossSpawned = true;
      this.triggerBossEntrance(4);
    }

    // Boss 2 entrance: Stage 8, score >= 215, screen clear, pre-return phase
    if (this.currentStageId === 8 && this.score >= 215 && this.enemies.length === 0 && !this.bossSpawned && !this.boss && !this.stage8Phase2Triggered) {
      this.bossSpawned = true;
      this.triggerBossEntrance(10);
    }

    // Check Stage Wins -> Trigger Cinematic Victory Phase
    if (this.currentStageId <= 3 && this.score >= 50) {
      this.startVictorySequence(3); // 3 seconds for stages 1-3
    } else if (this.currentStageId === 5 && this.score >= 100) {
      this.startVictorySequence(5); // 5 seconds for Stage 5 (Shining Tiga light convergence)
    } else if ((this.currentStageId === 6 || this.currentStageId === 7) && this.score >= 100) {
      this.startVictorySequence(3); // 3 seconds for stages 6-7
    } else if (this.currentStageId === 8 && this.stage8Phase2Triggered && this.score >= 465) {
      this.startVictorySequence(5); // 5 seconds for Stage 8 Phase 2 (ground base chain explosions)
    }
  }

  private async spawnEnemy(type: number, movementMode: 'dive' | 'v_formation' | 'flank_slash' | 'sine_weave' = 'dive', flankSide?: 'left' | 'right') {
    let spriteFile = 'enemy_1_hd.png';
    let w = 57; let h = 51; let hp = 20; let speed = 2.4; // Controlled cruise speed, bullets fly fast!

    if (type === 2) {
      spriteFile = 'enemy_2_hd.png'; w = 90; h = 65; hp = 45; speed = 2.2;
    } else if (type === 3) {
      spriteFile = 'enemy_3_hd.png'; w = 100; h = 80; hp = 70; speed = 2.5;
    } else if (type === 4 || type === 7) {
      spriteFile = 'enemy_4_hd.png'; w = 60; h = 52; hp = 55; speed = 3.2;
    } else if (type === 5) {
      spriteFile = 'Zoiger1_hd.png'; w = 150; h = 75; hp = 110; speed = 2.8;
    } else if (type === 6) {
      spriteFile = 'Zoiger2_hd.png'; w = 150; h = 75; hp = 110; speed = 2.8;
    } else if (type === 8) {
      spriteFile = 'enemy_5_hd.png'; w = 100; h = 88; hp = 85; speed = 2.6;
    } else if (type === 9) {
      spriteFile = 'meteorite.png'; w = 40; h = 40; hp = 150; speed = 2.4;
    } else if (type === 11) {
      spriteFile = 'ef1.png'; w = 85; h = 90; hp = 105; speed = 3.2;
    } else if (type === 12) {
      spriteFile = 'e1.png'; w = 115; h = 88; hp = 145; speed = 2.5;
    } else if (type === 13) {
      spriteFile = 'e2.png'; w = 110; h = 85; hp = 125; speed = 3.0;
    }

    const tex = Assets.get(`assets/sprites/common/${spriteFile}`) || await Assets.load(`assets/sprites/common/${spriteFile}`);
    const eSp = new Sprite(tex);
    eSp.anchor.set(0.5);
    eSp.width = w;
    eSp.height = h;

    let spawnX = 0;
    let spawnY = 0;
    let vx = 0;
    let vy = speed;

    if (movementMode === 'flank_slash') {
      const side = flankSide || (Math.random() < 0.5 ? 'left' : 'right');
      spawnY = 80 + Math.random() * 260; // Upper half of screen [80..340]
      if (side === 'left') {
        spawnX = -w / 2;
        vx = 3.2 + Math.random() * 1.5; // Cut diagonally right
        vy = 1.6 + Math.random() * 1.2;
        eSp.rotation = -0.35; // Bank into flight path
      } else {
        spawnX = CANVAS_WIDTH + w / 2;
        vx = -(3.2 + Math.random() * 1.5); // Cut diagonally left
        vy = 1.6 + Math.random() * 1.2;
        eSp.rotation = 0.35;
      }
    } else if (movementMode === 'v_formation') {
      // High speed tactical dive
      spawnX = Math.floor(Math.random() * (CANVAS_WIDTH - w - 160)) + 80 + w / 2;
      spawnY = -h / 2;
      vx = (Math.random() - 0.5) * 1.6;
      vy = speed * 1.35;
    } else {
      spawnX = Math.floor(Math.random() * (CANVAS_WIDTH - w - 80)) + 40 + w / 2;
      spawnY = -h / 2;
      vx = (Math.random() - 0.5) * 0.8;
      vy = speed;
    }

    eSp.position.set(spawnX, spawnY);
    this.gameLayer.addChild(eSp);

    this.enemies.push({
      sprite: eSp,
      hp,
      maxHp: hp,
      type,
      vx,
      vy,
      cd: Math.floor(Math.random() * 35),
      baseX: spawnX,
      timeAlive: 0,
      movementMode,
      flankSide
    });
  }

  // Switch Stage 5 to Phase 2 (Ruins collapsed, Loading transition, BGM switches, map switches to R'lyeh sky)
  private async switchStage5Phase2() {
    this.isTransitioning = true;

    // 1. Clear all in-flight bullets and existing enemies to prevent post-cutscene player damage!
    for (const b of this.bullets) {
      this.gameLayer.removeChild(b.sprite);
      b.sprite.destroy();
    }
    this.bullets = [];

    for (const em of this.enemies) {
      this.gameLayer.removeChild(em.sprite);
      em.sprite.destroy();
    }
    this.enemies = [];

    // Clear dark mist when transitioning to phase 2
    if (this.darkMistGfx) {
      this.darkMistGfx.clear();
      this.darkMistParticles = [];
    }

    // Temporarily hide combat layer so nothing renders behind the loading screen
    this.gameLayer.visible = false;

    // 2. Play authentic loading animation transition!
    await this.playVideoIntro('assets/videos/loading.mp4');

    // Restore combat layer
    this.gameLayer.visible = true;
    this.isTransitioning = false;
    this.playerInvincibleTimer = 60; // 1s safety invincibility after transition

    // Note: BGM continues playing love_theme_from_tiga.mp3 through phase 2, until level victory when golden light converges!

    // 3. Swap background to R'lyeh Ruins Sky (L5_2_rlyeh.png)
    try {
      const tex2 = await Assets.load('assets/sprites/common/L5_2_rlyeh.png');
      if (this.bgSprite1) {
        this.bgSprite1.texture = tex2;
        this.bgSprite1.tint = 0xffffff;
        this.bgSprite1.width = CANVAS_WIDTH;
        this.bgSprite1.height = CANVAS_HEIGHT;
        if (!this.bgLayer.children.includes(this.bgSprite1)) this.bgLayer.addChild(this.bgSprite1);
      }
      if (this.bgSprite2) {
        this.bgSprite2.texture = tex2;
        this.bgSprite2.tint = 0xffffff;
        this.bgSprite2.width = CANVAS_WIDTH;
        this.bgSprite2.height = CANVAS_HEIGHT;
        if (!this.bgLayer.children.includes(this.bgSprite2)) this.bgLayer.addChild(this.bgSprite2);
      }
    } catch (e) {
      console.warn('Failed to load Rlyeh map:', e);
    }
  }

  private async triggerBossEntrance(bossType: number) {
    this.isTransitioning = true;

    // Clear stray bullets to ensure clean boss confrontation
    for (const b of this.bullets) {
      this.gameLayer.removeChild(b.sprite);
      b.sprite.destroy();
    }
    this.bullets = [];

    // 1. Play Huge Attention Siren and Fullscreen Darkening Alarm
    await this.playAttentionWarning();

    this.isTransitioning = false;
    this.playerInvincibleTimer = 60; // 1s safety invincibility after alarm

    // 2. Stage 4 Boss Map Switch: switch background to dark stormy clouds!
    if (bossType === 4) {
      try {
        const stormTex = await Assets.load('assets/sprites/common/L4_tileable.png');
        if (this.bgSprite1) {
          this.bgSprite1.texture = stormTex;
          this.bgSprite1.tint = 0x334466; // Dark storm tint
        }
        if (this.bgSprite2) {
          this.bgSprite2.texture = stormTex;
          this.bgSprite2.tint = 0x334466;
        }
      } catch (e) {}
    }

    // 3. Spawn Boss (Size * 1.5, HP * 2)
    let spritePath = bossType === 4 ? 'assets/sprites/common/Boss1_hd.png' : 'assets/sprites/common/Boss2_hd.png';
    const bTex = Assets.get(spritePath) || await Assets.load(spritePath);
    const bSp = new Sprite(bTex);
    bSp.anchor.set(0.5);
    // Boss Size * 1.5
    bSp.width = bossType === 4 ? 333 : 375;
    bSp.height = bossType === 4 ? 423 : 294;
    bSp.position.set(CANVAS_WIDTH / 2, 135);
    this.gameLayer.addChild(bSp);

    // Boss HP * 2
    const maxHp = bossType === 4 ? 3000 : 4000;
    this.boss = {
      sprite: bSp,
      hp: maxHp,
      maxHp,
      type: bossType,
      vx: 2.2,
      vy: 0,
      phase: 1,
      laserCooldown: 0
    };
  }

  // Giant Fullscreen Attention Alarm Animation
  private playAttentionWarning(): Promise<void> {
    return new Promise((resolve) => {
      sounds.playSfx('alarm', 1.0);
      const container = new Container();
      this.modalLayer.addChild(container);

      // Fullscreen dark blackout overlay
      const darkBg = new Graphics();
      darkBg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      darkBg.fill({ color: 0x030308, alpha: 0.88 });
      container.addChild(darkBg);

      // Flashing emergency alarm borders
      const alarmStrobe = new Graphics();
      container.addChild(alarmStrobe);

      // Giant Attention Sprite across almost full width
      const attnSprite = new Sprite();
      attnSprite.anchor.set(0.5);
      attnSprite.position.set(CANVAS_WIDTH / 2, 320);
      attnSprite.width = 620;
      attnSprite.height = 240;
      container.addChild(attnSprite);

      const warnText = new Text({
        text: '⚠️ CRITICAL ALERT // 超重型敌对生命体接近 ⚠️\nALL UNITS PREPARE FOR MAXIMUM HOSTILITY SORTIE',
        style: new TextStyle({
          fill: 0xff2222,
          fontSize: 16,
          fontWeight: 'bold',
          fontFamily: 'Segoe UI, Microsoft YaHei',
          align: 'center',
          dropShadow: { alpha: 0.95, blur: 10, color: 0x000000, distance: 0 }
        })
      });
      warnText.anchor.set(0.5);
      warnText.position.set(CANVAS_WIDTH / 2, 470);
      container.addChild(warnText);

      let frame = 0;
      const totalAttnFrames = 42;
      const maxTicks = 180; // ~3.0 seconds, exactly ~2 full loops

      const tickerFn = () => {
        const attnIndex = Math.floor(frame / 2) % totalAttnFrames;
        const tex = Assets.get(`assets/sprites/attention/attn_${attnIndex}.png`);
        if (tex) attnSprite.texture = tex;

        // Flashing alarm strobe
        alarmStrobe.clear();
        const flashAlpha = 0.5 + 0.5 * Math.sin(frame * 0.35);
        alarmStrobe.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        alarmStrobe.stroke({ color: 0xff0000, width: 10, alpha: flashAlpha });
        warnText.alpha = 0.6 + 0.4 * Math.sin(frame * 0.4);

        if (frame % 40 === 0) {
          sounds.playSfx('alarm', 0.8);
        }

        frame++;
        if (frame >= maxTicks) {
          this.app.ticker.remove(tickerFn);
          this.modalLayer.removeChild(container);
          container.destroy({ children: true });
          resolve();
        }
      };
      this.app.ticker.add(tickerFn);
    });
  }

  private async handleBossDefeat() {
    if (!this.boss) return;
    const bType = this.boss.type;
    const bx = this.boss.sprite.x;
    const by = this.boss.sprite.y;

    // Remove boss body immediately
    this.gameLayer.removeChild(this.boss.sprite);
    this.boss.sprite.destroy();
    this.boss = null;

    // Trigger dramatic screen shake for Boss defeat
    this.triggerScreenShake(12, 40);

    // 1. Spawn Giant Cinematic Boss Explosion across the screen! (640x330)
    this.spawnExplosion(CANVAS_WIDTH / 2, by, 'boom4', 640, 330);
    setTimeout(() => this.spawnExplosion(bx - 100, by - 40, 'boom3_1', 130, 130), 200);
    setTimeout(() => this.spawnExplosion(bx + 100, by + 40, 'boom3_1', 130, 130), 400);
    setTimeout(() => this.spawnExplosion(bx, by - 60, 'boom2', 150, 150), 600);
    setTimeout(() => this.spawnExplosion(bx - 50, by + 50, 'boom3_1', 120, 120), 800);

    // 2. Wait for all 29 frames of boom4 and secondary explosions to finish completely!
    await new Promise((r) => setTimeout(r, 2200));

    // 3. Clear all leftover in-flight bullets and enemy sprites
    for (const b of this.bullets) {
      this.gameLayer.removeChild(b.sprite);
      b.sprite.destroy();
    }
    this.bullets = [];

    for (const em of this.enemies) {
      this.gameLayer.removeChild(em.sprite);
      em.sprite.destroy();
    }
    this.enemies = [];

    if (bType === 4) {
      // Stage 4 Boss defeat: score += 25
      this.score += 25;
      // Keep gameLayer visible so player fighter stays visible and can fly out in victory celebration!
      this.gameLayer.visible = true;
      this.startVictorySequence(5);
    } else if (bType === 10) {
      // Hide combat layer during Story transition
      this.gameLayer.visible = false;
      this.isTransitioning = true;
      // Stage 8 Boss 2 defeat:
      this.score += 100;
      await this.storySystem.playTruthAndDefection(this.storyLayer);

      // Transition to Earth with authentic loading animation!
      await this.playVideoIntro('assets/videos/loading.mp4');

      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 50);
      this.stage8Phase2Triggered = true;
      this.gameLayer.visible = true;
      this.isTransitioning = false;
      this.playerInvincibleTimer = 60; // 1s safety invincibility

      // Switch background to L8_2 (Earth fortress skies)
      try {
        const earthTex = await Assets.load('assets/sprites/common/L8_2.png');
        if (this.bgSprite1) {
          this.bgSprite1.texture = earthTex;
          this.bgSprite1.tint = 0xffffff;
          this.bgSprite1.width = CANVAS_WIDTH;
          this.bgSprite1.height = CANVAS_HEIGHT;
          if (!this.bgLayer.children.includes(this.bgSprite1)) this.bgLayer.addChild(this.bgSprite1);
        }
        if (this.bgSprite2) {
          this.bgSprite2.texture = earthTex;
          this.bgSprite2.tint = 0xffffff;
          this.bgSprite2.width = CANVAS_WIDTH;
          this.bgSprite2.height = CANVAS_HEIGHT;
          if (!this.bgLayer.children.includes(this.bgSprite2)) this.bgLayer.addChild(this.bgSprite2);
        }
      } catch (e) {
        console.warn('Failed to load L8_2 map:', e);
      }
    }
  }

  private async handleStageWin() {
    if (this.isStageEnding) return;
    this.isStageEnding = true;
    this.state = GameState.VICTORY;

    // Clear all leftover bullets and enemies
    for (const b of this.bullets) {
      this.gameLayer.removeChild(b.sprite);
      b.sprite.destroy();
    }
    this.bullets = [];

    for (const em of this.enemies) {
      this.gameLayer.removeChild(em.sprite);
      em.sprite.destroy();
    }
    this.enemies = [];

    // Ensure game layer is hidden
    this.gameLayer.visible = false;

    // In original code: user.update_amount(score)
    // Linear Medal Buff Scaling: each unlocked medal grants +2% bonus sortie funds (up to +24%)
    const medalsList = this.saveManager.profile.medals || new Array(12).fill(false);
    const medalCount = medalsList.filter(Boolean).length;
    const bonusFundMult = 1.0 + (medalCount * 0.02);
    const rewardFunds = Math.round(this.score * bonusFundMult);

    this.saveManager.addFunds(rewardFunds);
    this.saveManager.passLevel(this.currentStageId - 1);

    // If Stage 4 cleared: play Story 2 (Mothership down)
    if (this.currentStageId === 4) {
      await this.storySystem.playStory2(this.storyLayer);
    }

    // If Stage 5 cleared: play Tiga Story 2, STOP BGM, and play tiga2.mp4 cutscene with sound!
    if (this.currentStageId === 5) {
      await this.storySystem.playTigaStory2(this.storyLayer);
      sounds.stopBgm(); // STOP BGM so video audio is crisp and audible!
      await this.playVideoIntro('assets/videos/tiga2.mp4');
      this.saveManager.unlockFighter(4); // GW-01
      this.saveManager.unlockFighter(5); // GW-02
    }

    // If Stage 8 cleared: fade out whiteout screen smoothly into final ending story, then play credits scroll!
    if (this.currentStageId === 8 && this.stage8Phase2Triggered) {
      const baseBgm = this.saveManager.profile.bgmVolume ?? 0.7;
      sounds.fadeBgm(baseBgm, 2.0); // Music swells back to full normal volume over 2.0s!
      if (this.whiteoutGfx) {
        let fadeOutFrames = 36;
        while (fadeOutFrames > 0) {
          fadeOutFrames--;
          const a = fadeOutFrames / 36;
          this.whiteoutGfx.clear();
          this.whiteoutGfx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          this.whiteoutGfx.fill({ color: 0xffffff, alpha: a });
          await new Promise((r) => setTimeout(r, 16));
        }
        this.whiteoutGfx.clear();
      }
      sounds.playBgm('valse_di_fantastica.mp3');
      await this.storySystem.playFinalEnding(this.storyLayer, this.saveManager.profile.name);
      await this.playCreditsEnding();
    }

    // === ACHIEVEMENTS / MEDALS UNLOCK CHECKS ===
    const newlyConferredMedals: number[] = [];

    // Medal #1 (index 0): Wing Sortie - Clear Stage 1
    if (this.currentStageId === 1) {
      if (this.saveManager.unlockMedal(0)) newlyConferredMedals.push(0);
    }
    // Medal #2 (index 1): Victory Elite - Clear Stage 4
    if (this.currentStageId === 4) {
      if (this.saveManager.unlockMedal(1)) newlyConferredMedals.push(1);
    }
    // Medal #3 (index 2): Earth Guardian - Clear all 8 stages
    if (this.currentStageId === 8 && this.stage8Phase2Triggered) {
      if (this.saveManager.unlockMedal(2)) newlyConferredMedals.push(2);
    }
    // Medal #5 (index 4): Absolute Aegis - Win any stage without taking damage
    if (!this.stageTookDamage) {
      if (this.saveManager.unlockMedal(4)) newlyConferredMedals.push(4);
    }
    // Medal #6 (index 5): Ultimate Beam Clash - Overpower and win beam clash struggle against boss mega beam
    if (this.wonBeamClash) {
      if (this.saveManager.unlockMedal(5)) newlyConferredMedals.push(5);
    }
    // Medal #7 (index 6): Beacon of Light - Clear Stage 5 specifically piloting a Tiga-series fighter (id >= 4)
    if (this.currentStageId === 5 && this.currentFighterId >= 4) {
      if (this.saveManager.unlockMedal(6)) newlyConferredMedals.push(6);
    }
    // Check Treasury Medal #11 (index 10)
    if (this.saveManager.profile.amount >= 10000) {
      if (this.saveManager.unlockMedal(10)) newlyConferredMedals.push(10);
    }
    // Medal #12 (index 11): Ace of the Sky - Unlocks automatically when all other 11 medals (0..10) are achieved!
    const currentMedals = this.saveManager.profile.medals || [];
    let firstElevenUnlocked = true;
    for (let m = 0; m < 11; m++) {
      if (!currentMedals[m]) {
        firstElevenUnlocked = false;
        break;
      }
    }
    if (firstElevenUnlocked) {
      if (this.saveManager.unlockMedal(11)) newlyConferredMedals.push(11);
    }

    // Trigger toast notification for newly conferred medals
    newlyConferredMedals.forEach((mId, i) => {
      setTimeout(() => this.showMedalUnlockedToast(mId), i * 800);
    });

    this.modalLayer.removeChildren();
    this.uiLayer.removeChildren();

    const hasNewMedals = newlyConferredMedals.length > 0;
    const modalH = hasNewMedals ? 450 : 390;
    const modalY = hasNewMedals ? 190 : 220;

    const modal = new Graphics();
    modal.roundRect(100, modalY, 500, modalH, 12);
    modal.fill({ color: 0x0a1424, alpha: 0.96 });
    modal.stroke({ color: 0x28dc78, width: 2.5 });
    this.modalLayer.addChild(modal);

    const lang = getLanguage();
    const vI18n = I18N[lang].victory;
    const medI18n = I18N[lang].medals;

    const title = new Text({
      text: vI18n.title,
      style: new TextStyle({ fill: 0x28dc78, fontSize: 22, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    title.position.set(CANVAS_WIDTH / 2 - title.width / 2, modalY + 28);
    this.modalLayer.addChild(title);

    const info = new Text({
      text: `${vI18n.scoreEarned(this.score)}\n${vI18n.fundsAwarded(this.score)}\n\n${vI18n.unlockedNotice}`,
      style: new TextStyle({ fill: 0xffffff, fontSize: 14, fontFamily: 'Segoe UI, Microsoft YaHei', lineHeight: 24, align: 'center' })
    });
    info.position.set(CANVAS_WIDTH / 2 - info.width / 2, modalY + 75);
    this.modalLayer.addChild(info);

    // Scheme B: Animated Conferred Medals Showcase Section
    if (hasNewMedals) {
      const bestowCont = new Container();
      bestowCont.position.set(0, modalY + 185);
      this.modalLayer.addChild(bestowCont);

      const bestowLabel = new Text({
        text: medI18n.victoryBestow,
        style: new TextStyle({ fill: 0xffd700, fontSize: 12, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      bestowLabel.position.set(CANVAS_WIDTH / 2 - bestowLabel.width / 2, 0);
      bestowCont.addChild(bestowLabel);

      const medalThemes = [
        { color: 0x00e5ff, symbol: '🥇' },
        { color: 0x3cd070, symbol: '🥉' },
        { color: 0xffd700, symbol: '🏆' },
        { color: 0x80d8ff, symbol: '⚡' },
        { color: 0x00f0ff, symbol: '🛡️' },
        { color: 0xff3b10, symbol: '💥' },
        { color: 0xfffae0, symbol: '✨' },
        { color: 0xff9900, symbol: '🛸' },
        { color: 0x00ffcc, symbol: '🎯' },
        { color: 0xe6be64, symbol: '🧘' },
        { color: 0xffbb00, symbol: '💰' },
        { color: 0xff00e5, symbol: '👑' }
      ];

      const itemW = 145;
      const totalW = newlyConferredMedals.length * itemW;
      const startX = (CANVAS_WIDTH - totalW) / 2;

      newlyConferredMedals.forEach((mId, idx) => {
        const itemData = medI18n.items[mId];
        const theme = medalThemes[mId] || medalThemes[0];
        const mX = startX + idx * itemW + itemW / 2;

        const badgeCont = new Container();
        badgeCont.position.set(mX, 60);
        bestowCont.addChild(badgeCont);

        // Halo Shockwave Ring
        const halo = new Graphics();
        halo.circle(0, 0, 24);
        halo.fill({ color: theme.color, alpha: 0.25 });
        halo.stroke({ color: 0xffd700, width: 2 });
        badgeCont.addChild(halo);

        const sym = new Text({
          text: theme.symbol,
          style: new TextStyle({ fontSize: 24, align: 'center' })
        });
        sym.anchor.set(0.5);
        badgeCont.addChild(sym);

        const badgeName = new Text({
          text: itemData ? itemData.name : '',
          style: new TextStyle({ fill: 0xffffff, fontSize: 11, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
        });
        badgeName.anchor.set(0.5, 0);
        badgeName.position.set(0, 30);
        badgeCont.addChild(badgeName);

        // Pop-in scale bounce animation
        badgeCont.scale.set(0);
        let animFrame = 0;
        const badgeTicker = (ticker: { deltaTime: number }) => {
          animFrame += ticker.deltaTime || 1;
          const t = Math.min(1, animFrame / 18);
          // Elastic back ease
          const s = Math.sin(t * Math.PI * 0.5) * 1.15;
          badgeCont.scale.set(t >= 1 ? 1 : s);
          if (t >= 1) {
            this.app.ticker.remove(badgeTicker);
          }
        };
        setTimeout(() => {
          this.app.ticker.add(badgeTicker);
          sounds.playSfx('ding', 0.8);
        }, idx * 250);
      });
    }

    const btnY = modalY + modalH - 70;

    // Buttons directly placed on modalLayer - 100% visible and interactive!
    this.createModalButton(CANVAS_WIDTH / 2 - 210, btnY, 190, 48, vI18n.continueSortie, 0x28dc78, () => {
      this.modalLayer.removeChildren();
      this.showMapSelect();
    });

    this.createModalButton(CANVAS_WIDTH / 2 + 20, btnY, 190, 48, vI18n.returnMenu, 0x00f0ff, () => {
      this.modalLayer.removeChildren();
      this.showMainMenu();
    });
  }

  // Final Ending Credits (Yodeeshi Appreciation Scroll)
  private async playCreditsEnding(): Promise<void> {
    return new Promise(async (resolve) => {
      // 1. Play ending BGM
      sounds.playBgm('valse_di_fantastica.mp3');

      // 2. Clear layers
      this.modalLayer.removeChildren();
      this.uiLayer.removeChildren();
      this.gameLayer.visible = false;
      this.bgLayer.removeChildren();

      // 3. Dark cosmic backdrop with starfield
      const bg = new Graphics();
      bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      bg.fill({ color: 0x050a14 });
      this.bgLayer.addChild(bg);

      const starGfx = new Graphics();
      for (let i = 0; i < 70; i++) {
        const sx = Math.random() * CANVAS_WIDTH;
        const sy = Math.random() * CANVAS_HEIGHT;
        const r = Math.random() * 1.5 + 0.5;
        starGfx.circle(sx, sy, r);
        starGfx.fill({ color: 0xffffff, alpha: Math.random() * 0.8 + 0.2 });
      }
      this.bgLayer.addChild(starGfx);

      // Load ending_credits.png
      let creditsTex = Assets.get('assets/sprites/ui/ending_credits.png');
      if (!creditsTex) {
        try {
          creditsTex = await Assets.load('assets/sprites/ui/ending_credits.png');
        } catch (e) {
          console.warn('Could not load ending credits:', e);
        }
      }

      const container = new Container();
      this.modalLayer.addChild(container);

      let creditsSprite: Sprite | null = null;
      let targetMinY = 0;
      if (creditsTex) {
        creditsSprite = new Sprite(creditsTex);
        // Occupy the full width of the game rectangle screen (700px)!
        creditsSprite.width = CANVAS_WIDTH;
        creditsSprite.height = (creditsTex.height / creditsTex.width) * CANVAS_WIDTH;
        creditsSprite.x = 0;
        // Starts at y = 0: top of image visible on-screen, exactly matching original C++ putimage(0, 0, BG_w, BG_h, &img_ending, 0, 0)
        creditsSprite.y = 0;
        targetMinY = -(creditsSprite.height - CANVAS_HEIGHT);
        container.addChild(creditsSprite);
      }

      let isFinished = false;
      let pauseAtBottomTimer = 0;

      const finish = () => {
        if (isFinished) return;
        isFinished = true;
        this.app.ticker.remove(tickerFn);
        this.modalLayer.removeChild(container);
        container.destroy({ children: true });
        resolve();
      };

      // Forced full cinematic playback (No skipping allowed, authentic C++ 50ms per pixel pan)
      const tickerFn = (ticker: { deltaTime: number }) => {
        if (!creditsSprite) {
          finish();
          return;
        }

        const delta = ticker.deltaTime || 1;

        if (creditsSprite.y > targetMinY) {
          // Pan viewport down (move sprite upward by ~20px/sec, exactly 0.33-0.35 px per frame at 60fps)
          creditsSprite.y -= 0.35 * delta;
          if (creditsSprite.y < targetMinY) {
            creditsSprite.y = targetMinY;
          }
        } else {
          // Reached the very bottom: hold on the final message for ~3.5 seconds
          creditsSprite.y = targetMinY;
          pauseAtBottomTimer += delta;
          if (pauseAtBottomTimer >= 210) {
            finish();
          }
        }
      };

      this.app.ticker.add(tickerFn);
    });
  }

  private handlePlayerDefeat() {
    this.state = GameState.GAME_OVER;
    sounds.playSfx('boom', 1.0);

    if (this.playerSprite) {
      this.spawnExplosion(this.playerSprite.x, this.playerSprite.y, 'boom4', 300, 200);
      this.playerSprite.visible = false;
    }

    this.gameLayer.visible = false;
    this.modalLayer.removeChildren();
    this.uiLayer.removeChildren();

    const lang = getLanguage();
    const dI18n = I18N[lang].defeat;

    const modal = new Graphics();
    modal.roundRect(100, 230, 500, 360, 12);
    modal.fill({ color: 0x140a0a, alpha: 0.96 });
    modal.stroke({ color: 0xff3232, width: 2.5 });
    this.modalLayer.addChild(modal);

    const title = new Text({
      text: dI18n.title,
      style: new TextStyle({ fill: 0xff3232, fontSize: 22, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    title.position.set(CANVAS_WIDTH / 2 - title.width / 2, 260);
    this.modalLayer.addChild(title);

    const info = new Text({
      text: `${dI18n.desc}\n${dI18n.finalScore(this.score)}`,
      style: new TextStyle({ fill: 0xffffff, fontSize: 15, fontFamily: 'Segoe UI, Microsoft YaHei', lineHeight: 26, align: 'center' })
    });
    info.position.set(CANVAS_WIDTH / 2 - info.width / 2, 320);
    this.modalLayer.addChild(info);

    this.createModalButton(CANVAS_WIDTH / 2 - 210, 480, 190, 48, dI18n.retrySortie, 0xffa028, () => {
      this.modalLayer.removeChildren();
      this.startBattle(this.currentStageId);
    });

    this.createModalButton(CANVAS_WIDTH / 2 + 20, 480, 190, 48, dI18n.returnMenu, 0x00c8ff, () => {
      this.modalLayer.removeChildren();
      this.showMainMenu();
    });
  }

  private togglePause() {
    if (this.state === GameState.PLAY) {
      this.state = GameState.PAUSE;

      const lang = getLanguage();
      const bI18n = I18N[lang].battle;

      const pauseContainer = new Container();
      pauseContainer.label = 'pauseContainer';
      this.modalLayer.addChild(pauseContainer);

      const pModal = new Graphics();
      pModal.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      pModal.fill({ color: 0x050a14, alpha: 0.75 });
      pModal.eventMode = 'static'; // block inputs to underlying layers
      pauseContainer.addChild(pModal);

      const title = new Text({
        text: bI18n.pauseTitle,
        style: new TextStyle({ fill: 0x00f0ff, fontSize: 20, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      title.position.set(CANVAS_WIDTH / 2 - title.width / 2, 340);
      pauseContainer.addChild(title);

      this.createModalButton(CANVAS_WIDTH / 2 - 90, 395, 180, 42, bI18n.resume, 0x00f0ff, () => {
        this.togglePause();
      }, pauseContainer);

      this.createModalButton(CANVAS_WIDTH / 2 - 90, 450, 180, 42, bI18n.settings, 0x00f0ff, () => {
        this.showAudioSettingsModal();
      }, pauseContainer);

      this.createModalButton(CANVAS_WIDTH / 2 - 90, 505, 180, 42, bI18n.retire, 0xff3232, () => {
        this.togglePause(); // clean up pause state & UI
        this.showMapSelect();
      }, pauseContainer);
    } else if (this.state === GameState.PAUSE) {
      this.state = GameState.PLAY;
      const pauseContainer = this.modalLayer.getChildByLabel('pauseContainer');
      if (pauseContainer) {
        this.modalLayer.removeChild(pauseContainer);
        pauseContainer.destroy({ children: true });
      }
    }
  }

  // ==========================================
  // AUDIO SETTINGS MODAL
  // ==========================================
  private showAudioSettingsModal(onClose?: () => void) {
    const modalContainer = new Container();
    modalContainer.label = 'audioSettingsModal';
    this.modalLayer.addChild(modalContainer);

    let curBgm = Math.round(sounds.getBgmVolume() * 100);
    let curSfx = Math.round(sounds.getSfxVolume() * 100);

    const renderModal = () => {
      modalContainer.removeChildren();

      const lang = getLanguage();
      const setI18n = I18N[lang].settings;

      // Dim overlay
      const overlay = new Graphics();
      overlay.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      overlay.fill({ color: 0x050a14, alpha: 0.85 });
      overlay.eventMode = 'static'; // block clicks behind
      modalContainer.addChild(overlay);

      // Modal frame
      const modalBox = new Graphics();
      modalBox.roundRect(80, 160, 540, 520, 14);
      modalBox.fill({ color: 0x0e1826, alpha: 0.98 });
      modalBox.stroke({ color: 0x00f0ff, width: 2 });
      modalContainer.addChild(modalBox);

      // Title
      const title = new Text({
        text: setI18n.title,
        style: new TextStyle({ fill: 0x00f0ff, fontSize: 18, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      title.position.set(CANVAS_WIDTH / 2 - title.width / 2, 185);
      modalContainer.addChild(title);

      // --- LANGUAGE SELECTOR ---
      const langLabel = new Text({
        text: setI18n.langLabel,
        style: new TextStyle({ fill: 0xffdc3c, fontSize: 14, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      langLabel.position.set(120, 235);
      modalContainer.addChild(langLabel);

      const zhActive = lang === 'zh';
      const enActive = lang === 'en';

      this.createModalButton(330, 226, 125, 34, setI18n.zhBtn, zhActive ? 0x00f0ff : 0x3a5068, async () => {
        setLanguage('zh');
        this.saveManager.profile.language = 'zh';
        await this.saveManager.save();
        renderModal();
      }, modalContainer);

      this.createModalButton(465, 226, 125, 34, setI18n.enBtn, enActive ? 0x00f0ff : 0x3a5068, async () => {
        setLanguage('en');
        this.saveManager.profile.language = 'en';
        await this.saveManager.save();
        renderModal();
      }, modalContainer);

      // Divider line
      const divider = new Graphics();
      divider.moveTo(110, 275);
      divider.lineTo(590, 275);
      divider.stroke({ color: 0x1f344d, width: 1.5 });
      modalContainer.addChild(divider);

      // --- BGM SLIDER ---
      const bgmLabel = new Text({
        text: setI18n.bgmLabel,
        style: new TextStyle({ fill: 0xffffff, fontSize: 14, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      bgmLabel.position.set(120, 295);
      modalContainer.addChild(bgmLabel);

      const bgmValText = new Text({
        text: `${curBgm}%`,
        style: new TextStyle({ fill: 0x00f0ff, fontSize: 15, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      bgmValText.position.set(500, 295);
      modalContainer.addChild(bgmValText);

      const bgmTrackX = 175;
      const bgmTrackY = 333;
      const trackW = 270;
      const trackH = 10;

      // --- BGM SLIDER COMPONENTS ---
      const bgmBarGfx = new Graphics();
      modalContainer.addChild(bgmBarGfx);

      const bgmThumb = new Graphics();
      bgmThumb.eventMode = 'static';
      bgmThumb.cursor = 'grab';
      modalContainer.addChild(bgmThumb);

      const renderBgmTrack = () => {
        bgmBarGfx.clear();
        // Track background
        bgmBarGfx.roundRect(bgmTrackX, bgmTrackY, trackW, trackH, 5);
        bgmBarGfx.fill({ color: 0x1f3045, alpha: 1 });
        // Active fill
        const fillW = Math.max(0, Math.min(trackW, (curBgm / 100) * trackW));
        if (fillW > 0) {
          bgmBarGfx.roundRect(bgmTrackX, bgmTrackY, fillW, trackH, 5);
          bgmBarGfx.fill({ color: 0x00f0ff, alpha: 1 });
        }
        // Slider thumb (White ball with cyan border)
        bgmThumb.clear();
        bgmThumb.circle(bgmTrackX + fillW, bgmTrackY + trackH / 2, 11);
        bgmThumb.fill({ color: 0xffffff, alpha: 1 });
        bgmThumb.stroke({ color: 0x00f0ff, width: 2.5 });
        bgmValText.text = `${curBgm}%`;
      };
      renderBgmTrack();

      const updateBgmFromX = (globalX: number) => {
        const local = modalContainer.toLocal({ x: globalX, y: 0 });
        const ratio = Math.max(0, Math.min(1, (local.x - bgmTrackX) / trackW));
        curBgm = Math.round(ratio * 100);
        sounds.setBgmVolume(curBgm / 100);
        renderBgmTrack();
      };

      let isDraggingBgm = false;
      const onBgmPointerMove = (e: PointerEvent) => {
        if (isDraggingBgm) {
          updateBgmFromX(e.clientX);
        }
      };
      const onBgmPointerUp = () => {
        if (isDraggingBgm) {
          isDraggingBgm = false;
          window.removeEventListener('pointermove', onBgmPointerMove);
          window.removeEventListener('pointerup', onBgmPointerUp);
        }
      };

      // Track click / drag hit area
      const bgmHit = new Graphics();
      bgmHit.rect(bgmTrackX - 10, bgmTrackY - 14, trackW + 20, trackH + 28);
      bgmHit.fill({ color: 0xffffff, alpha: 0.001 });
      bgmHit.eventMode = 'static';
      bgmHit.cursor = 'pointer';

      bgmHit.on('pointerdown', (e) => {
        isDraggingBgm = true;
        updateBgmFromX(e.global.x);
        window.addEventListener('pointermove', onBgmPointerMove);
        window.addEventListener('pointerup', onBgmPointerUp);
      });
      modalContainer.addChild(bgmHit);

      // Direct grab on the white thumb ball
      bgmThumb.on('pointerdown', (e) => {
        isDraggingBgm = true;
        updateBgmFromX(e.global.x);
        window.addEventListener('pointermove', onBgmPointerMove);
        window.addEventListener('pointerup', onBgmPointerUp);
      });

      // [-] button
      this.createModalButton(120, 321, 42, 34, '-', 0x00f0ff, () => {
        curBgm = Math.max(0, curBgm - 5);
        sounds.setBgmVolume(curBgm / 100);
        renderBgmTrack();
      }, modalContainer);

      // [+] button
      this.createModalButton(460, 321, 42, 34, '+', 0x00f0ff, () => {
        curBgm = Math.min(100, curBgm + 5);
        sounds.setBgmVolume(curBgm / 100);
        renderBgmTrack();
      }, modalContainer);

      // --- SFX SLIDER COMPONENTS ---
      const sfxLabel = new Text({
        text: setI18n.sfxLabel,
        style: new TextStyle({ fill: 0xffffff, fontSize: 14, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      sfxLabel.position.set(120, 380);
      modalContainer.addChild(sfxLabel);

      const sfxValText = new Text({
        text: `${curSfx}%`,
        style: new TextStyle({ fill: 0xffa028, fontSize: 15, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      sfxValText.position.set(500, 380);
      modalContainer.addChild(sfxValText);

      const sfxTrackX = 175;
      const sfxTrackY = 418;

      const sfxBarGfx = new Graphics();
      modalContainer.addChild(sfxBarGfx);

      const sfxThumb = new Graphics();
      sfxThumb.eventMode = 'static';
      sfxThumb.cursor = 'grab';
      modalContainer.addChild(sfxThumb);

      const renderSfxTrack = () => {
        sfxBarGfx.clear();
        // Track background
        sfxBarGfx.roundRect(sfxTrackX, sfxTrackY, trackW, trackH, 5);
        sfxBarGfx.fill({ color: 0x1f3045, alpha: 1 });
        // Active fill
        const fillW = Math.max(0, Math.min(trackW, (curSfx / 100) * trackW));
        if (fillW > 0) {
          sfxBarGfx.roundRect(sfxTrackX, sfxTrackY, fillW, trackH, 5);
          sfxBarGfx.fill({ color: 0xffa028, alpha: 1 });
        }
        // Slider thumb (White ball with orange border)
        sfxThumb.clear();
        sfxThumb.circle(sfxTrackX + fillW, sfxTrackY + trackH / 2, 11);
        sfxThumb.fill({ color: 0xffffff, alpha: 1 });
        sfxThumb.stroke({ color: 0xffa028, width: 2.5 });
        sfxValText.text = `${curSfx}%`;
      };
      renderSfxTrack();

      const updateSfxFromX = (globalX: number) => {
        const local = modalContainer.toLocal({ x: globalX, y: 0 });
        const ratio = Math.max(0, Math.min(1, (local.x - sfxTrackX) / trackW));
        curSfx = Math.round(ratio * 100);
        sounds.setSfxVolume(curSfx / 100);
        renderSfxTrack();
      };

      let isDraggingSfx = false;
      const onSfxPointerMove = (e: PointerEvent) => {
        if (isDraggingSfx) {
          updateSfxFromX(e.clientX);
        }
      };
      const onSfxPointerUp = () => {
        if (isDraggingSfx) {
          isDraggingSfx = false;
          window.removeEventListener('pointermove', onSfxPointerMove);
          window.removeEventListener('pointerup', onSfxPointerUp);
        }
      };

      // Track click / drag hit area
      const sfxHit = new Graphics();
      sfxHit.rect(sfxTrackX - 10, sfxTrackY - 14, trackW + 20, trackH + 28);
      sfxHit.fill({ color: 0xffffff, alpha: 0.001 });
      sfxHit.eventMode = 'static';
      sfxHit.cursor = 'pointer';

      sfxHit.on('pointerdown', (e) => {
        isDraggingSfx = true;
        updateSfxFromX(e.global.x);
        window.addEventListener('pointermove', onSfxPointerMove);
        window.addEventListener('pointerup', onSfxPointerUp);
      });
      modalContainer.addChild(sfxHit);

      // Direct grab on the white thumb ball
      sfxThumb.on('pointerdown', (e) => {
        isDraggingSfx = true;
        updateSfxFromX(e.global.x);
        window.addEventListener('pointermove', onSfxPointerMove);
        window.addEventListener('pointerup', onSfxPointerUp);
      });

      // [-] button
      this.createModalButton(120, 406, 42, 34, '-', 0xffa028, () => {
        curSfx = Math.max(0, curSfx - 5);
        sounds.setSfxVolume(curSfx / 100);
        renderSfxTrack();
      }, modalContainer);

      // [+] button
      this.createModalButton(460, 406, 42, 34, '+', 0xffa028, () => {
        curSfx = Math.min(100, curSfx + 5);
        sounds.setSfxVolume(curSfx / 100);
        renderSfxTrack();
      }, modalContainer);

      // Test SFX button
      this.createModalButton(CANVAS_WIDTH / 2 - 90, 475, 180, 40, setI18n.testSfx, 0x00f0ff, () => {
        sounds.playSfx('laser', 0.9);
      }, modalContainer);

      // Save and Return button
      this.createModalButton(CANVAS_WIDTH / 2 - 120, 545, 240, 46, setI18n.saveAndClose, 0x28dc78, async () => {
        this.saveManager.profile.bgmVolume = curBgm / 100;
        this.saveManager.profile.sfxVolume = curSfx / 100;
        await this.saveManager.save();
        this.modalLayer.removeChild(modalContainer);
        modalContainer.destroy({ children: true });
        if (onClose) onClose();
      }, modalContainer);
    };

    renderModal();
  }

  private checkCollision(a: Container, b: Container, radius: number): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy < radius * radius;
  }

  // ==========================================
  // HELPERS
  // ==========================================
  private clearAllLayers() {
    this.bgLayer.removeChildren();
    this.gameLayer.removeChildren();
    this.uiLayer.removeChildren();
    this.modalLayer.removeChildren();
    this.storyLayer.removeChildren();
    this.storyLayer.visible = false;
    this.storyLayer.eventMode = 'none';
    this.gameLayer.visible = true;
    this.bgLayer.visible = true;
    this.uiLayer.visible = true;
    this.uiLayer.eventMode = 'static';
    this.gameLayer.position.set(0, 0);
    this.bgLayer.position.set(0, 0);
    this.uiLayer.position.set(0, 0);
    this.screenShakeTimer = 0;
    this.darkMistGfx = null;
    this.darkMistParticles = [];
    this.beamClashState = null;
    this.beamClashHudContainer = null;
    this.isWhiteoutActive = false;
    this.whiteoutProgress = 0;
    this.whiteoutHoldTimer = 0;
    this.whiteoutSfxTriggered = false;
    if (this.whiteoutGfx) {
      this.whiteoutGfx.clear();
      this.whiteoutGfx.position.set(0, 0);
    }
  }

  private createButton(x: number, y: number, w: number, h: number, text: string, color: number, action: () => void): Container {
    const cont = new Container();
    const g = new Graphics();
    g.roundRect(x, y, w, h, 6);
    g.fill({ color: 0x141e2d, alpha: 0.95 });
    g.stroke({ color, width: 1.5 });
    cont.addChild(g);

    const t = new Text({
      text,
      style: new TextStyle({ fill: 0xffffff, fontSize: 13, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    t.position.set(x + (w - t.width) / 2, y + (h - t.height) / 2);
    cont.addChild(t);

    cont.eventMode = 'static';
    cont.cursor = 'pointer';
    cont.on('pointerover', () => {
      g.clear();
      g.roundRect(x, y, w, h, 6);
      g.fill({ color: 0x1e3048, alpha: 0.95 });
      g.stroke({ color, width: 2 });
    });
    cont.on('pointerout', () => {
      g.clear();
      g.roundRect(x, y, w, h, 6);
      g.fill({ color: 0x141e2d, alpha: 0.95 });
      g.stroke({ color, width: 1.5 });
    });
    cont.on('pointerdown', action);

    this.uiLayer.addChild(cont);
    return cont;
  }

  private createModalButton(x: number, y: number, w: number, h: number, text: string, color: number, action: () => void, targetLayer: Container = this.modalLayer): Container {
    const cont = new Container();
    const g = new Graphics();
    g.roundRect(x, y, w, h, 8);
    g.fill({ color: 0x141e2d, alpha: 0.98 });
    g.stroke({ color, width: 2 });
    cont.addChild(g);

    const t = new Text({
      text,
      style: new TextStyle({ fill: 0xffffff, fontSize: 14, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
    });
    t.position.set(x + (w - t.width) / 2, y + (h - t.height) / 2);
    cont.addChild(t);

    cont.eventMode = 'static';
    cont.cursor = 'pointer';
    cont.on('pointerover', () => {
      g.clear();
      g.roundRect(x, y, w, h, 8);
      g.fill({ color: 0x1e3048, alpha: 0.98 });
      g.stroke({ color, width: 2.5 });
    });
    cont.on('pointerout', () => {
      g.clear();
      g.roundRect(x, y, w, h, 8);
      g.fill({ color: 0x141e2d, alpha: 0.98 });
      g.stroke({ color, width: 2 });
    });
    cont.on('pointerdown', action);

    targetLayer.addChild(cont);
    return cont;
  }

  private createReturnButton(x: number, y: number, w: number, h: number, text: string, action: () => void): Container {
    return this.createButton(x, y, w, h, text, 0x00f0ff, action);
  }

  private confirmExit() {
    const lang = getLanguage();
    if (confirm(I18N[lang].menu.exitPrompt)) {
      if (typeof window !== 'undefined' && (window as any).close) {
        window.close();
      }
    }
  }
}
