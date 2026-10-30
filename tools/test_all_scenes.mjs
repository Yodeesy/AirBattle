import { chromium } from 'playwright';
import path from 'path';

async function testAllScenes() {
  console.log('[Test] Launching Chromium...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  console.log('[Test] Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const canvas = await page.$('canvas');
  if (!canvas) {
    throw new Error('Canvas not found!');
  }
  const box = await canvas.boundingBox();
  console.log('[Test] Canvas bounding box:', box);

  // 1. Screenshot Main Menu
  const menuPath = path.resolve('public/live_test_menu.png');
  await page.screenshot({ path: menuPath });
  console.log('[Test] Captured Menu screenshot:', menuPath);

  // 2. Click "出击 // 关卡选择" (x: 420..650, y: 240..292)
  console.log('[Test] Clicking Start Sortie...');
  await page.mouse.click(box.x + 530, box.y + 266);
  await page.waitForTimeout(1000);
  const mapPath = path.resolve('public/live_test_map.png');
  await page.screenshot({ path: mapPath });
  console.log('[Test] Captured Map Select screenshot:', mapPath);

  // Return to Menu (center bottom: 350, 830)
  await page.mouse.click(box.x + 350, box.y + 830);
  await page.waitForTimeout(600);

  // 3. Click "战机机库 // 商店" (x: 420..650, y: 306..358)
  console.log('[Test] Clicking Hangar & Shop...');
  await page.mouse.click(box.x + 530, box.y + 332);
  await page.waitForTimeout(1000);
  const shopPath = path.resolve('public/live_test_shop.png');
  await page.screenshot({ path: shopPath });
  console.log('[Test] Captured Shop screenshot:', shopPath);

  // 4. Click "战机科技树 ⚙" (x: 280..460, y: 810..852)
  console.log('[Test] Clicking Tech Tree...');
  await page.mouse.click(box.x + 370, box.y + 830);
  await page.waitForTimeout(1000);
  const treePath = path.resolve('public/live_test_tech_tree.png');
  await page.screenshot({ path: treePath });
  console.log('[Test] Captured Tech Tree screenshot:', treePath);

  // Return to Shop (CANVAS_WIDTH - 200 + 80 = 580, 830)
  await page.mouse.click(box.x + 580, box.y + 830);
  await page.waitForTimeout(600);
  // Return to Menu
  await page.mouse.click(box.x + 580, box.y + 830);
  await page.waitForTimeout(600);

  // 5. Click "闭目打坐 // 敲木鱼" (x: 420..650, y: 372..424)
  console.log('[Test] Clicking Zen Muyu...');
  await page.mouse.click(box.x + 530, box.y + 398);
  await page.waitForTimeout(1000);

  // Click wooden fish 3 times (center 350, 700)
  for (let i = 0; i < 3; i++) {
    await page.mouse.click(box.x + 350, box.y + 700);
    await page.waitForTimeout(200);
  }
  const muyuPath = path.resolve('public/live_test_muyu.png');
  await page.screenshot({ path: muyuPath });
  console.log('[Test] Captured Muyu screenshot:', muyuPath);

  // Return to Menu (center 350, 845)
  await page.mouse.click(box.x + 350, box.y + 845);
  await page.waitForTimeout(600);

  // 6. Start Battle in Stage 1
  console.log('[Test] Entering Map Select and starting Stage 1...');
  await page.mouse.click(box.x + 530, box.y + 266);
  await page.waitForTimeout(600);

  // Click Stage 1 Card (x: startX + 67 = ~120, y: 110 + 135 = 245)
  await page.mouse.click(box.x + 120, box.y + 245);
  await page.waitForTimeout(1500);

  // Fire weapons and move!
  await page.keyboard.down(' ');
  await page.keyboard.down('a');
  await page.waitForTimeout(400);
  await page.keyboard.up('a');

  // Test double tap D for barrel roll!
  await page.keyboard.down('d');
  await page.keyboard.up('d');
  await page.waitForTimeout(80);
  await page.keyboard.down('d');
  await page.keyboard.up('d');
  await page.waitForTimeout(300);

  const combatPath = path.resolve('public/live_test_combat.png');
  await page.screenshot({ path: combatPath });
  console.log('[Test] Captured Combat screenshot:', combatPath);

  await page.keyboard.up(' ');
  await browser.close();
  console.log('[Test] All live tests completed successfully!');
}

testAllScenes().catch(err => {
  console.error('[Test Error]:', err);
  process.exit(1);
});
