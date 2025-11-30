/**
 * Icon Generator Script for Basel.ai PWA
 *
 * This script generates PNG icons from the SVG source.
 *
 * To use this script, you need to install sharp:
 *   npm install sharp --save-dev
 *
 * Then run:
 *   node scripts/generate-icons.js
 *
 * Alternatively, you can use an online tool like:
 *   - https://realfavicongenerator.net/
 *   - https://www.pwabuilder.com/imageGenerator
 *
 * Upload the SVG from public/icons/icon.svg and download the generated icons.
 */

const fs = require('fs');
const path = require('path');

async function generateIcons() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.log('Sharp not installed. Install it with: npm install sharp --save-dev');
    console.log('');
    console.log('Alternatively, use an online PWA icon generator:');
    console.log('  1. Go to https://www.pwabuilder.com/imageGenerator');
    console.log('  2. Upload public/icons/icon.svg');
    console.log('  3. Download and extract icons to public/icons/');
    return;
  }

  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const svgPath = path.join(__dirname, '../public/icons/icon.svg');
  const outputDir = path.join(__dirname, '../public/icons');

  const svgBuffer = fs.readFileSync(svgPath);

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-${size}x${size}.png`);
  }

  // Generate apple-touch-icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('Generated: apple-touch-icon.png');

  // Generate favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, 'favicon-32x32.png'));
  console.log('Generated: favicon-32x32.png');

  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(outputDir, 'favicon-16x16.png'));
  console.log('Generated: favicon-16x16.png');

  console.log('');
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
