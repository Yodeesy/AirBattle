import { chromium } from 'playwright';
import fs from 'fs';

async function renderLogo() {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@600;700&display=swap');
    body {
      margin: 0;
      padding: 0;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 900px;
      height: 280px;
      overflow: hidden;
    }
    .logo-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="logo-container">
    <svg width="900" height="280" viewBox="0 0 900 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradients -->
        <linearGradient id="gradText" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="40%" stop-color="#f0f9ff" />
          <stop offset="70%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
        <linearGradient id="gradGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="50%" stop-color="#ef4444" />
          <stop offset="100%" stop-color="#fbbf24" />
        </linearGradient>
        <linearGradient id="gradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00f0ff" />
          <stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
        <linearGradient id="gradFighter" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="50%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="strongGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background HUD Ring -->
      <circle cx="450" cy="115" r="95" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="10 8" opacity="0.4" />
      <circle cx="450" cy="115" r="110" stroke="#00f0ff" stroke-width="1" stroke-dasharray="4 12" opacity="0.35" />

      <!-- Supersonic Mach Cone Ribbons -->
      <path d="M450 18 L210 165 L275 165 L450 48 L625 165 L690 165 Z" fill="url(#gradCyan)" opacity="0.25" filter="url(#glow)" />
      <path d="M450 32 L260 160 L310 160 L450 56 L590 160 L640 160 Z" fill="url(#gradGold)" opacity="0.35" filter="url(#glow)" />

      <!-- Delta Fighter Silhouette -->
      <g transform="translate(450, 75) scale(0.95)">
        <!-- Twin Afterburner Plumes -->
        <polygon points="-16,32 0,90 -10,32" fill="#f97316" opacity="0.85" filter="url(#glow)" />
        <polygon points="16,32 0,90 10,32" fill="#f97316" opacity="0.85" filter="url(#glow)" />
        <polygon points="-12,32 -6,70 -2,32" fill="#fef08a" opacity="0.95" />
        <polygon points="12,32 6,70 2,32" fill="#fef08a" opacity="0.95" />

        <!-- Airframe Body -->
        <path d="M0 -56 L12 -12 L50 24 L20 28 L12 38 L0 30 L-12 38 L-20 28 L-50 24 L-12 -12 Z" fill="url(#gradFighter)" stroke="#38bdf8" stroke-width="2" filter="url(#glow)" />
        <path d="M0 -48 L6 -8 L22 18 L0 12 L-22 18 L-6 -8 Z" fill="#0ea5e9" opacity="0.75" />
        <!-- Cockpit Canopy -->
        <ellipse cx="0" cy="-16" rx="3.5" ry="11" fill="#00f0ff" filter="url(#glow)" />
      </g>

      <!-- Tactical Bracket Accents -->
      <path d="M120 50 L90 50 L90 80" stroke="#00f0ff" stroke-width="3" stroke-linecap="square" opacity="0.85" />
      <path d="M780 50 L810 50 L810 80" stroke="#00f0ff" stroke-width="3" stroke-linecap="square" opacity="0.85" />
      <path d="M120 215 L90 215 L90 185" stroke="#00f0ff" stroke-width="3" stroke-linecap="square" opacity="0.85" />
      <path d="M780 215 L810 215 L810 185" stroke="#00f0ff" stroke-width="3" stroke-linecap="square" opacity="0.85" />

      <!-- Horizontal Cyber Guidelines -->
      <line x1="130" y1="180" x2="250" y2="180" stroke="#38bdf8" stroke-width="2" opacity="0.6" />
      <circle cx="130" cy="180" r="3" fill="#00f0ff" />
      <line x1="650" y1="180" x2="770" y2="180" stroke="#38bdf8" stroke-width="2" opacity="0.6" />
      <circle cx="770" cy="180" r="3" fill="#00f0ff" />

      <!-- Primary Title Text: AIRBATTLE -->
      <text x="450" y="192" font-family="'Orbitron', sans-serif" font-size="64" font-weight="900" letter-spacing="9" text-anchor="middle" fill="url(#gradText)" filter="url(#glow)">AIRBATTLE</text>

      <!-- Subtitle Badge: 2D TACTICAL AIR COMBAT -->
      <rect x="315" y="216" width="270" height="25" rx="5" fill="#0b1329" stroke="#0284c7" stroke-width="1.5" opacity="0.92" />
      <text x="450" y="233" font-family="'Rajdhani', sans-serif" font-size="13" font-weight="700" letter-spacing="4" text-anchor="middle" fill="#38bdf8">2D TACTICAL AIR COMBAT</text>
    </svg>
  </div>
</body>
</html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 280 }, deviceScaleFactor: 2 });
  await page.setContent(html);
  await page.waitForTimeout(800);
  const buffer = await page.screenshot({ omitBackground: true });
  fs.writeFileSync('public/assets/sprites/ui/logo.png', buffer);
  await browser.close();
  console.log('Logo rendered successfully: public/assets/sprites/ui/logo.png');
}

renderLogo().catch(console.error);
