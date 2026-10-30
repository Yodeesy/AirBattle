import { Container, Sprite, Text, TextStyle, Graphics, Assets, Rectangle } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './types';
import { sounds } from './audio';
import { getLanguage, I18N } from './i18n';

export interface StorySlide {
  image: string;
  subtitle: string;
}

export class StorySystem {
  private static instance: StorySystem;

  public static getInstance(): StorySystem {
    if (!StorySystem.instance) {
      StorySystem.instance = new StorySystem();
    }
    return StorySystem.instance;
  }

  // Generic full-screen American comic story slide viewer
  public showSlides(
    container: Container,
    title: string,
    slides: StorySlide[],
    onComplete: () => void,
    playMenuMusic: boolean = true
  ) {
    let currentIdx = 0;
    let isFinished = false;
    let isAdvancing = false;

    if (playMenuMusic) {
      sounds.playMenu();
    }

    container.visible = true;
    container.eventMode = 'static';
    container.removeChildren();

    const cleanup = () => {
      if (isFinished) return;
      isFinished = true;
      window.removeEventListener('keydown', keyHandler);
      container.removeChildren();
      container.visible = false;
      container.eventMode = 'none';
      onComplete();
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup();
      } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        advance();
      }
    };
    window.addEventListener('keydown', keyHandler);

    const advance = () => {
      if (isFinished || isAdvancing) return;
      isAdvancing = true;
      sounds.playSfx('shoot', 0.3);
      currentIdx++;
      if (currentIdx >= slides.length) {
        cleanup();
      } else {
        renderCurrent().finally(() => {
          isAdvancing = false;
        });
      }
    };

    const renderCurrent = async () => {
      if (isFinished) return;
      container.removeChildren();

      const item = slides[currentIdx];
      if (!item) {
        cleanup();
        return;
      }
      const lang = getLanguage();
      const sI18n = I18N[lang].story;

      // Comic Art
      try {
        const tex = await Assets.load(item.image.replace(/^\//, ''));
        if (isFinished) return;
        const sp = new Sprite(tex);
        sp.width = CANVAS_WIDTH;
        sp.height = CANVAS_HEIGHT;
        container.addChild(sp);
      } catch (err) {
        console.warn('Failed to load story image:', item.image, err);
      }

      if (isFinished) return;

      // Fullscreen click to advance (Added FIRST as background click catcher)
      const fullClick = new Graphics();
      fullClick.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      fullClick.fill({ color: 0x000000, alpha: 0.001 });
      fullClick.eventMode = 'static';
      fullClick.cursor = 'pointer';
      fullClick.hitArea = new Rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      fullClick.on('pointerdown', (e) => {
        e.stopPropagation();
        advance();
      });
      container.addChild(fullClick);

      // Bottom Dark Comic Caption Box (only if subtitle text exists)
      if (item.subtitle && item.subtitle.trim().length > 0) {
        const hud = new Graphics();
        hud.rect(0, CANVAS_HEIGHT - 128, CANVAS_WIDTH, 128);
        hud.fill({ color: 0x070d18, alpha: 0.92 });
        hud.stroke({ color: 0x00f0ff, width: 2 });
        container.addChild(hud);

        // Title & Page indicator
        const titleText = new Text({
          text: `${title} [ ${currentIdx + 1} / ${slides.length} ]`,
          style: new TextStyle({
            fill: 0x00f0ff,
            fontSize: 12,
            fontWeight: 'bold',
            fontFamily: 'Segoe UI, Microsoft YaHei'
          })
        });
        titleText.position.set(28, CANVAS_HEIGHT - 114);
        container.addChild(titleText);

        // Subtitle Narrative
        const subText = new Text({
          text: item.subtitle,
          style: new TextStyle({
            fill: 0xffffff,
            fontSize: 13,
            fontFamily: 'Segoe UI, Microsoft YaHei',
            lineHeight: 22,
            wordWrap: true,
            wordWrapWidth: CANVAS_WIDTH - 180
          })
        });
        subText.position.set(28, CANVAS_HEIGHT - 90);
        container.addChild(subText);
      }

      // Next / Skip prompt
      const hint = new Text({
        text: currentIdx < slides.length - 1 ? sI18n.next : sI18n.end,
        style: new TextStyle({
          fill: 0xffd232,
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: 'Segoe UI, Microsoft YaHei'
        })
      });
      hint.position.set(CANVAS_WIDTH - 230, CANVAS_HEIGHT - 38);
      container.addChild(hint);

      // Skip Button (Added AFTER fullClick so it stays on top and interactive)
      const skipBox = new Graphics();
      skipBox.roundRect(CANVAS_WIDTH - 140, 24, 115, 34, 4);
      skipBox.fill({ color: 0x0a1424, alpha: 0.9 });
      skipBox.stroke({ color: 0x00f0ff, width: 1 });
      skipBox.eventMode = 'static';
      skipBox.cursor = 'pointer';
      skipBox.hitArea = new Rectangle(CANVAS_WIDTH - 140, 24, 115, 34);
      skipBox.on('pointerdown', (e) => {
        e.stopPropagation();
        cleanup();
      });
      container.addChild(skipBox);

      const skipText = new Text({
        text: sI18n.skip,
        style: new TextStyle({ fill: 0x00f0ff, fontSize: 11, fontWeight: 'bold', fontFamily: 'Segoe UI, Microsoft YaHei' })
      });
      skipText.position.set(CANVAS_WIDTH - 128, 32);
      container.addChild(skipText);
    };

    renderCurrent();
  }

  // 1. Prologue Story 1 (5 slides in American Comic graphic novel style)
  public playStory1(container: Container): Promise<void> {
    return new Promise((resolve) => {
      const s = I18N[getLanguage()].story;
      const slides: StorySlide[] = [
        { image: 'assets/story/S1_1.png', subtitle: s.p1Slides[0] },
        { image: 'assets/story/S1_2.png', subtitle: s.p1Slides[1] },
        { image: 'assets/story/S1_3.png', subtitle: s.p1Slides[2] },
        { image: 'assets/story/S1_4.png', subtitle: s.p1Slides[3] },
        { image: 'assets/story/S1_5.png', subtitle: s.p1Slides[4] }
      ];
      this.showSlides(container, s.p1Title, slides, resolve);
    });
  }

  // 2. Mission Briefing (Level 1)
  public playMissionBriefing1(container: Container): Promise<void> {
    return new Promise((resolve) => {
      const s = I18N[getLanguage()].story;
      const slides: StorySlide[] = [
        { image: 'assets/story/S0.png', subtitle: s.m1Sub }
      ];
      this.showSlides(container, s.m1Title, slides, resolve);
    });
  }

  // 3. Story 2 (After Stage 4 Boss 1 defeat - The first crack in the illusion)
  public playStory2(container: Container): Promise<void> {
    return new Promise((resolve) => {
      const s = I18N[getLanguage()].story;
      const slides: StorySlide[] = [
        { image: 'assets/story/S2_1.png', subtitle: s.s2_1 },
        { image: 'assets/story/S2_2.png', subtitle: s.s2_2 }
      ];
      this.showSlides(container, s.s2Title, slides, resolve);
    });
  }

  // 4. Easter Egg Story 1 (Before Stage 5 Tokyo Defense - Authentic Film Stills)
  public playTigaStory1(container: Container): Promise<void> {
    return new Promise((resolve) => {
      const s = I18N[getLanguage()].story;
      const slides: StorySlide[] = [
        { image: 'assets/story/P1.png', subtitle: '' },
        { image: 'assets/story/P2.png', subtitle: '' },
        { image: 'assets/story/P3.png', subtitle: '' },
        { image: 'assets/story/P4.png', subtitle: '' }
      ];
      this.showSlides(container, s.tiga1Title, slides, resolve);
    });
  }

  // 5. Easter Egg Story 2 (After Stage 5 clear, unlocks GUTS fighters)
  public playTigaStory2(container: Container): Promise<void> {
    return new Promise((resolve) => {
      const s = I18N[getLanguage()].story;
      const slides: StorySlide[] = [
        { image: 'assets/story/P5.png', subtitle: s.tiga2Slides[0] },
        { image: 'assets/story/P6.png', subtitle: s.tiga2Slides[1] },
        { image: 'assets/story/P7.png', subtitle: s.tiga2Slides[2] },
        { image: 'assets/story/P8.png', subtitle: s.tiga2Slides[3] },
        { image: 'assets/story/P9.png', subtitle: s.tiga2Slides[4] },
        { image: 'assets/story/P10.png', subtitle: s.tiga2Slides[5] }
      ];
      this.showSlides(container, s.tiga2Title, slides, resolve, false);
    });
  }

  // 6. Mission Briefing (Level 6)
  public playMissionBriefing6(container: Container): Promise<void> {
    return new Promise((resolve) => {
      const s = I18N[getLanguage()].story;
      const slides: StorySlide[] = [
        { image: 'assets/story/S00.png', subtitle: s.m6Sub }
      ];
      this.showSlides(container, s.m6Title, slides, resolve);
    });
  }

  // 7. Stage 8 Turning Point: The Great Betrayal & The Return to Earth
  public playTruthAndDefection(container: Container): Promise<void> {
    return new Promise((resolve) => {
      const s = I18N[getLanguage()].story;
      const slides: StorySlide[] = [
        { image: 'assets/story/S000.png', subtitle: s.truth1 },
        { image: 'assets/story/S0000.png', subtitle: s.truth2 }
      ];
      // Keep Stage 8 BGM playing continuously
      this.showSlides(container, s.truthTitle, slides, resolve, false);
    });
  }

  // 8. Final Ending (Stage 8 win)
  public playFinalEnding(container: Container, pilotName: string): Promise<void> {
    return new Promise((resolve) => {
      const s = I18N[getLanguage()].story;
      const slides: StorySlide[] = [
        { image: 'assets/story/S00000.png', subtitle: s.finalSub(pilotName) }
      ];
      // Keep Stage 8 BGM playing continuously into credits
      this.showSlides(container, s.finalTitle, slides, resolve, false);
    });
  }
}
