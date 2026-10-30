import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { MaxRectsPacker } from 'maxrects-packer';
import { execFile } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const LEGACY_DIR = path.resolve('_legacy');
const ASSETS_OUT = path.resolve('public/assets');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 1. Process Video sequences using ffmpeg-static
async function sequenceToVideo(inputPattern, fps, outputFile) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.dirname(outputFile))) {
      fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    }
    console.log(`[Video] Converting ${inputPattern} -> ${path.basename(outputFile)}...`);
    const args = [
      '-y',
      '-framerate', String(fps),
      '-i', inputPattern,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-crf', '23',
      '-preset', 'fast',
      outputFile
    ];
    execFile(ffmpegPath, args, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error encoding ${outputFile}:`, stderr);
        return reject(err);
      }
      console.log(`[Video] Done: ${path.basename(outputFile)} (${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB)`);
      resolve();
    });
  });
}

// 2. Alpha Mask merger: combine RGB image and black/white mask image into true RGBA PNG
async function mergeMaskToRGBA(colorPath, maskPath) {
  const colorImg = sharp(colorPath);
  const colorMeta = await colorImg.metadata();
  
  // Extract RGB raw
  const { data: colorData } = await colorImg
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const maskImg = sharp(maskPath).resize(colorMeta.width, colorMeta.height);
  const { data: maskData } = await maskImg
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // In EasyX: Mask white (255) means transparent/background or black means sprite depending on raster op.
  // In AirBattle: putimage(x, y, &mask, NOTSRCERASE); putimage(x, y, &img, SRCINVERT);
  // NOTSRCERASE: dest = ~(dest | mask) -> When mask is 0 (black), screen inverted.
  // Standard EasyX convention: Mask is BLACK (0) for foreground/sprite shape, WHITE (255) for background!
  // Let's verify mask luminance: In typical EasyX, 0 = keep foreground (opaque), 255 = background (transparent).
  // Or vice versa. Let's sample mask edge vs center.
  // Usually corner (0,0) is background.
  const cornerVal = maskData[0];
  const isCornerBg = cornerVal > 128; // If corner is white, then white = transparent

  const len = colorMeta.width * colorMeta.height;
  const outBuf = Buffer.alloc(len * 4);

  for (let i = 0; i < len; i++) {
    const r = colorData[i * 4];
    const g = colorData[i * 4 + 1];
    const b = colorData[i * 4 + 2];
    const m = maskData[i];

    // Alpha: if corner is bg (white), then alpha = 255 - m; else alpha = m
    const a = isCornerBg ? (255 - m) : m;

    outBuf[i * 4] = r;
    outBuf[i * 4 + 1] = g;
    outBuf[i * 4 + 2] = b;
    outBuf[i * 4 + 3] = a;
  }

  return sharp(outBuf, {
    raw: {
      width: colorMeta.width,
      height: colorMeta.height,
      channels: 4
    }
  }).png();
}

async function buildBoomSpriteSheets() {
  console.log('[Spritesheet] Packing Explosion Effects...');
  const boomDir = path.join(LEGACY_DIR, 'images/boom');
  const outSpritesDir = path.join(ASSETS_OUT, 'sprites');
  await ensureDir(outSpritesDir);

  const packer = new MaxRectsPacker(2048, 2048, 2, { smart: true, pot: false });
  const framesMeta = {};

  // Boom1: 4 frames
  for (let i = 1; i <= 4; i++) {
    const c = path.join(boomDir, `boom1/boom${i}.png`);
    const m = path.join(boomDir, `boom1/boom${i}_mask.png`);
    let buf;
    if (fs.existsSync(m)) {
      buf = await (await mergeMaskToRGBA(c, m)).toBuffer();
    } else {
      buf = await sharp(c).png().toBuffer();
    }
    const meta = await sharp(buf).metadata();
    packer.add({ width: meta.width, height: meta.height, data: { name: `boom1_${i - 1}`, buf } });
  }

  // Boom2: 8 frames
  for (let i = 0; i < 8; i++) {
    const c = path.join(boomDir, `boom2/frame_${i}_delay-0.1s.png`);
    const m = path.join(boomDir, `boom2/frame_${i}_delay-0.1s_mask.png`);
    if (fs.existsSync(c)) {
      let buf;
      if (fs.existsSync(m)) {
        buf = await (await mergeMaskToRGBA(c, m)).toBuffer();
      } else {
        buf = await sharp(c).png().toBuffer();
      }
      const meta = await sharp(buf).metadata();
      packer.add({ width: meta.width, height: meta.height, data: { name: `boom2_${i}`, buf } });
    }
  }

  // Boom4: 29 frames (Boss epic explosion)
  for (let i = 0; i < 29; i++) {
    const pad = String(i).padStart(2, '0');
    const c = path.join(boomDir, `boom4/frame_${pad}_delay-0.04s.png`);
    if (fs.existsSync(c)) {
      // Boom4 has black background, we can key out black or keep RGB if additive, but let's make black transparent
      const img = sharp(c);
      const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
      const out = Buffer.alloc(info.width * info.height * 4);
      for (let j = 0; j < info.width * info.height; j++) {
        const r = data[j * 3];
        const g = data[j * 3 + 1];
        const b = data[j * 3 + 2];
        const maxVal = Math.max(r, g, b);
        out[j * 4] = r;
        out[j * 4 + 1] = g;
        out[j * 4 + 2] = b;
        out[j * 4 + 3] = maxVal < 15 ? 0 : (maxVal > 150 ? 255 : maxVal);
      }
      const buf = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
      packer.add({ width: info.width, height: info.height, data: { name: `boom_boss_${i}`, buf } });
    }
  }

  // Output packed bins
  for (let bIndex = 0; bIndex < packer.bins.length; bIndex++) {
    const bin = packer.bins[bIndex];
    const sheetImg = sharp({
      create: {
        width: bin.width,
        height: bin.height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    });

    const composites = [];
    const jsonFrames = {};

    for (const rect of bin.rects) {
      composites.push({
        input: rect.data.buf,
        top: rect.y,
        left: rect.x
      });
      jsonFrames[rect.data.name] = {
        frame: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: rect.width, h: rect.height },
        sourceSize: { width: rect.width, height: rect.height }
      };
    }

    const sheetFilename = `effects_${bIndex}.png`;
    const jsonFilename = `effects_${bIndex}.json`;

    await sheetImg.composite(composites).png().toFile(path.join(outSpritesDir, sheetFilename));

    const atlasData = {
      frames: jsonFrames,
      meta: {
        image: sheetFilename,
        size: { w: bin.width, h: bin.height },
        scale: "1"
      },
      animations: {
        boom_small: [0, 1, 2, 3].map(i => `boom1_${i}`),
        boom_medium: [0, 1, 2, 3, 4, 5, 6, 7].map(i => `boom2_${i}`),
        boom_boss: Array.from({ length: 29 }, (_, i) => `boom_boss_${i}`)
      }
    };

    fs.writeFileSync(path.join(outSpritesDir, jsonFilename), JSON.stringify(atlasData, null, 2));
    console.log(`[Spritesheet] Generated ${sheetFilename} and ${jsonFilename}`);
  }
}

async function convertAudios() {
  console.log('[Audio] Copying and cataloging music & sfx...');
  const musicIn = path.join(LEGACY_DIR, 'music');
  const musicOut = path.join(ASSETS_OUT, 'music');
  await ensureDir(musicOut);

  const files = fs.readdirSync(musicIn);
  for (const f of files) {
    if (f.endsWith('.mp3')) {
      // Normalize naming for web compatibility
      const safeName = f.replace(/[^a-zA-Z0-9_\.]/g, '_').toLowerCase();
      fs.copyFileSync(path.join(musicIn, f), path.join(musicOut, safeName));
      console.log(`[Audio] Audio ready: ${f} -> ${safeName}`);
    }
  }
}

async function processCommonAssets() {
  console.log('[Sprites] Processing player, enemies, bullets and UI...');
  const commonIn = path.join(LEGACY_DIR, 'images/common');
  const outDir = path.join(ASSETS_OUT, 'sprites/common');
  await ensureDir(outDir);

  const files = fs.readdirSync(commonIn);
  const processed = new Set();

  for (const f of files) {
    if (f.includes('_mask.') || !f.endsWith('.png') && !f.endsWith('.jpg')) continue;
    const base = f.substring(0, f.lastIndexOf('.'));
    const maskCandidate = `${base}_mask.png`;
    const fullColor = path.join(commonIn, f);
    const fullMask = path.join(commonIn, maskCandidate);

    const destFile = path.join(outDir, `${base}.png`);

    if (fs.existsSync(fullMask)) {
      try {
        const outImg = await mergeMaskToRGBA(fullColor, fullMask);
        await outImg.toFile(destFile);
        processed.add(base);
      } catch (e) {
        console.warn(`Failed mask merge for ${f}, copying direct:`, e.message);
        fs.copyFileSync(fullColor, destFile);
      }
    } else {
      // Just copy or convert to clean PNG
      if (f.endsWith('.jpg')) {
        await sharp(fullColor).png().toFile(destFile);
      } else {
        fs.copyFileSync(fullColor, destFile);
      }
    }
  }
  console.log(`[Sprites] Common assets processed (${files.length} source items).`);
}

async function processVideos() {
  const vidDir = path.join(ASSETS_OUT, 'videos');
  await ensureDir(vidDir);

  // Tiga1 sequence: 233 frames (0.04s delay = 25 fps)
  const tiga1Pattern = path.join(LEGACY_DIR, 'images/Tiga1/frame_%03d_delay-0.04s.png');
  if (fs.existsSync(path.join(LEGACY_DIR, 'images/Tiga1/frame_000_delay-0.04s.png'))) {
    await sequenceToVideo(tiga1Pattern, 25, path.join(vidDir, 'tiga1.mp4'));
  }

  // Tiga2 sequence: 254 frames (0.1s delay = 10 fps)
  const tiga2Pattern = path.join(LEGACY_DIR, 'images/Tiga2/frame_%03d_delay-0.1s.png');
  if (fs.existsSync(path.join(LEGACY_DIR, 'images/Tiga2/frame_000_delay-0.1s.png'))) {
    await sequenceToVideo(tiga2Pattern, 10, path.join(vidDir, 'tiga2.mp4'));
  }

  // L4 Level 4 dynamic background sequence: 134 frames
  const l4Pattern = path.join(LEGACY_DIR, 'images/common/L4/frame_%03d_delay-0.03s.png');
  if (fs.existsSync(path.join(LEGACY_DIR, 'images/common/L4/frame_000_delay-0.03s.png'))) {
    await sequenceToVideo(l4Pattern, 30, path.join(vidDir, 'bg_l4.mp4'));
  }
}

async function main() {
  console.log('=== STARTING AIRBATTLE ASSET PIPELINE ===');
  await ensureDir(ASSETS_OUT);
  await processCommonAssets();
  await buildBoomSpriteSheets();
  await convertAudios();
  await processVideos();
  console.log('=== ASSET PIPELINE COMPLETED SUCCESSFULLY ===');
}

main().catch(err => {
  console.error('Asset Pipeline Failed:', err);
  process.exit(1);
});
