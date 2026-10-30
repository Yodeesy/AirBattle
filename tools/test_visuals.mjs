import { chromium } from 'playwright';
import path from 'path';

async function testGameVisuals() {
  console.log('[Test] Launching headless browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  console.log('[Test] Navigating to game...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // Wait 1.5s for initial render
  await page.waitForTimeout(1500);

  // 1. Capture Menu
  const menuPic = path.resolve('public/screenshot_menu.png');
  await page.screenshot({ path: menuPic });
  console.log(`[Test] Saved menu screenshot: ${menuPic}`);

  // 2. Click "打坐修仙 (木鱼)" button
  // Coordinates based on button center (CANVAS_WIDTH / 2 = 350, y = 560)
  const canvas = await page.$('canvas');
  if (canvas) {
    const box = await canvas.boundingBox();
    if (box) {
      console.log('[Test] Clicking Muyu button...');
      await page.mouse.click(box.x + 350, box.y + 560);
      await page.waitForTimeout(800);

      // Click Muyu 3 times to earn gongde
      await page.mouse.click(box.x + 350, box.y + 420);
      await page.waitForTimeout(200);
      await page.mouse.click(box.x + 350, box.y + 420);
      await page.waitForTimeout(200);
      await page.mouse.click(box.x + 350, box.y + 420);
      await page.waitForTimeout(600);

      const muyuPic = path.resolve('public/screenshot_muyu.png');
      await page.screenshot({ path: muyuPic });
      console.log(`[Test] Saved muyu screenshot: ${muyuPic}`);

      // Return to menu
      await page.mouse.click(box.x + 350, box.y + 750);
      await page.waitForTimeout(600);

      // Start Battle
      console.log('[Test] Starting Battle...');
      await page.mouse.click(box.x + 350, box.y + 420);
      await page.waitForTimeout(1200);

      // Hold SPACE to fire and hold SHIFT for focus mode
      await page.keyboard.down('Shift');
      await page.keyboard.down(' ');
      await page.keyboard.down('ArrowLeft');
      await page.waitForTimeout(1000);
      await page.keyboard.up('ArrowLeft');
      await page.keyboard.down('ArrowRight');
      await page.waitForTimeout(1000);

      const playPic = path.resolve('public/screenshot_play.png');
      await page.screenshot({ path: playPic });
      console.log(`[Test] Saved gameplay screenshot: ${playPic}`);
    }
  }

  await browser.close();
  console.log('[Test] Visual test completed!');
}

testGameVisuals().catch(console.error);
