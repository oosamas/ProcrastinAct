/**
 * Asset Generator for ProcrastinAct
 * Generates all required app icons and splash screens
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Brand colors
const BRAND_PRIMARY = '#6366f1'; // Indigo
const BRAND_SECONDARY = '#8b5cf6'; // Purple
const BRAND_LIGHT = '#a5b4fc';
const WHITE = '#ffffff';
const DARK = '#1e1b4b';

// Output directory
const ASSETS_DIR = path.join(__dirname, '../apps/mobile/assets');
const WEB_PUBLIC_DIR = path.join(__dirname, '../apps/web/public');

// Ensure directories exist
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}
if (!fs.existsSync(WEB_PUBLIC_DIR)) {
  fs.mkdirSync(WEB_PUBLIC_DIR, { recursive: true });
}

/**
 * Draw the ProcrastinAct logo (checkmark morphing into forward arrow)
 */
function drawLogo(ctx, centerX, centerY, size, color = WHITE) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size * 0.12;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw a stylized checkmark that curves into a forward motion
  const scale = size / 100;

  ctx.beginPath();
  // Start of checkmark (bottom left)
  ctx.moveTo(centerX - 35 * scale, centerY + 5 * scale);
  // Down to bottom of check
  ctx.lineTo(centerX - 10 * scale, centerY + 30 * scale);
  // Up and to the right (completing check, transitioning to arrow)
  ctx.lineTo(centerX + 35 * scale, centerY - 25 * scale);
  ctx.stroke();

  // Add a small arrow head to suggest forward motion
  ctx.beginPath();
  ctx.moveTo(centerX + 25 * scale, centerY - 35 * scale);
  ctx.lineTo(centerX + 35 * scale, centerY - 25 * scale);
  ctx.lineTo(centerX + 25 * scale, centerY - 15 * scale);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw gradient background
 */
function drawGradientBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, BRAND_PRIMARY);
  gradient.addColorStop(1, BRAND_SECONDARY);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw solid background
 */
function drawSolidBackground(ctx, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Generate main app icon (1024x1024)
 */
function generateAppIcon() {
  const size = 1024;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Gradient background
  drawGradientBackground(ctx, size, size);

  // Add subtle inner glow/highlight
  const innerGradient = ctx.createRadialGradient(
    size * 0.3,
    size * 0.3,
    0,
    size * 0.5,
    size * 0.5,
    size * 0.7
  );
  innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = innerGradient;
  ctx.fillRect(0, 0, size, size);

  // Draw logo
  drawLogo(ctx, size / 2, size / 2, size * 0.5, WHITE);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(ASSETS_DIR, 'icon.png'), buffer);
  console.log('Created: icon.png (1024x1024)');

  return canvas;
}

/**
 * Generate adaptive icon foreground (432x432 with safe zone)
 */
function generateAdaptiveIcon() {
  const size = 432;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Transparent background (foreground only for adaptive icons)
  ctx.clearRect(0, 0, size, size);

  // Draw logo centered in safe zone (66% of icon)
  // Safe zone is the inner 66%, so logo should be smaller
  drawLogo(ctx, size / 2, size / 2, size * 0.33, WHITE);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(ASSETS_DIR, 'adaptive-icon.png'), buffer);
  console.log('Created: adaptive-icon.png (432x432)');
}

/**
 * Generate splash screen icon (200x200 as per app.json config)
 */
function generateSplashIcon() {
  const size = 200;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Transparent background (splash background color is set in app.json)
  ctx.clearRect(0, 0, size, size);

  // Draw logo
  drawLogo(ctx, size / 2, size / 2, size * 0.6, WHITE);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(ASSETS_DIR, 'splash-icon.png'), buffer);
  console.log('Created: splash-icon.png (200x200)');
}

/**
 * Generate notification icon (96x96, white with transparency for Android)
 */
function generateNotificationIcon() {
  const size = 96;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Transparent background
  ctx.clearRect(0, 0, size, size);

  // Draw logo in white (Android notification icons must be white/transparent)
  drawLogo(ctx, size / 2, size / 2, size * 0.5, WHITE);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(ASSETS_DIR, 'notification-icon.png'), buffer);
  console.log('Created: notification-icon.png (96x96)');
}

/**
 * Generate favicon (48x48)
 */
function generateFavicon() {
  const size = 48;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Gradient background
  drawGradientBackground(ctx, size, size);

  // Draw logo
  drawLogo(ctx, size / 2, size / 2, size * 0.5, WHITE);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(ASSETS_DIR, 'favicon.png'), buffer);
  console.log('Created: favicon.png (48x48)');
}

/**
 * Generate web PWA icons
 */
function generateWebIcons() {
  // 192x192 icon
  const size192 = 192;
  const canvas192 = createCanvas(size192, size192);
  const ctx192 = canvas192.getContext('2d');
  drawGradientBackground(ctx192, size192, size192);
  drawLogo(ctx192, size192 / 2, size192 / 2, size192 * 0.5, WHITE);
  fs.writeFileSync(
    path.join(WEB_PUBLIC_DIR, 'icon-192.png'),
    canvas192.toBuffer('image/png')
  );
  console.log('Created: icon-192.png (192x192)');

  // 512x512 icon
  const size512 = 512;
  const canvas512 = createCanvas(size512, size512);
  const ctx512 = canvas512.getContext('2d');
  drawGradientBackground(ctx512, size512, size512);
  drawLogo(ctx512, size512 / 2, size512 / 2, size512 * 0.5, WHITE);
  fs.writeFileSync(
    path.join(WEB_PUBLIC_DIR, 'icon-512.png'),
    canvas512.toBuffer('image/png')
  );
  console.log('Created: icon-512.png (512x512)');
}

/**
 * Generate app store feature graphic (1024x500)
 */
function generateFeatureGraphic() {
  const width = 1024;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Gradient background
  drawGradientBackground(ctx, width, height);

  // Add subtle pattern
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 20 + Math.random() * 40;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = WHITE;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Draw logo on the left
  drawLogo(ctx, 200, height / 2, 150, WHITE);

  // Add app name text
  ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = WHITE;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ProcrastinAct', 350, height / 2 - 30);

  // Add tagline
  ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('Small steps lead to big wins', 350, height / 2 + 30);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(ASSETS_DIR, 'feature-graphic.png'), buffer);
  console.log('Created: feature-graphic.png (1024x500)');
}

// Run all generators
console.log('\nGenerating ProcrastinAct assets...\n');

generateAppIcon();
generateAdaptiveIcon();
generateSplashIcon();
generateNotificationIcon();
generateFavicon();
generateWebIcons();
generateFeatureGraphic();

console.log('\nAll assets generated successfully!');
console.log('\nAssets location:');
console.log(`  Mobile: ${ASSETS_DIR}`);
console.log(`  Web: ${WEB_PUBLIC_DIR}`);
