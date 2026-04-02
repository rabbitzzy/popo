import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const iconsDir = join(publicDir, 'icons');

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Read the SVG file
const svgPath = join(publicDir, 'sprites', 'berry.svg');
const svgContent = readFileSync(svgPath);

// Icon sizes needed for PWA and iOS
const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 16, name: 'icon-16.png' },
  { size: 32, name: 'icon-32.png' },
  { size: 180, name: 'apple-touch-icon-180.png' },
  { size: 120, name: 'apple-touch-icon-120.png' },
  { size: 152, name: 'apple-touch-icon-152.png' },
  { size: 167, name: 'apple-touch-icon-167.png' },
];

async function generateIcons() {
  for (const { size, name } of sizes) {
    try {
      await sharp(svgContent)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(join(iconsDir, name));
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (err) {
      console.error(`✗ Failed to generate ${name}:`, err.message);
    }
  }
  
  // Generate manifest.json
  const manifest = {
    name: "Berry's Evolution",
    short_name: "Berry Evo",
    description: "Collect all 8 evolutions. Conquer the Arena.",
    start_url: '/',
    display: 'standalone',
    background_color: '#f0f9f8',
    theme_color: '#2d8b85',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
  
  writeFileSync(
    join(publicDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('✓ Generated manifest.json');
}

generateIcons();
