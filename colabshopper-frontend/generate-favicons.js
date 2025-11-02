/**
 * Script to generate favicon.ico, logo192.png, and logo512.png from favicon.svg
 * 
 * Install dependencies first:
 * npm install sharp --save-dev
 * 
 * Then run:
 * node generate-favicons.js
 */

const fs = require('fs');
const path = require('path');

try {
  const sharp = require('sharp');
  
  const svgPath = path.join(__dirname, 'public', 'favicon.svg');
  const svgBuffer = fs.readFileSync(svgPath);
  
  const outputDir = path.join(__dirname, 'public');
  
  // Generate logo192.png
  sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, 'logo192.png'))
    .then(() => console.log('✓ Generated logo192.png'));
  
  // Generate logo512.png
  sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'logo512.png'))
    .then(() => console.log('✓ Generated logo512.png'));
  
  // Generate favicon.ico (16x16, 32x32, 48x48 sizes)
  Promise.all([
    sharp(svgBuffer).resize(16, 16).png().toBuffer(),
    sharp(svgBuffer).resize(32, 32).png().toBuffer(),
    sharp(svgBuffer).resize(48, 48).png().toBuffer(),
  ]).then(([ico16, ico32, ico48]) => {
    // Note: Creating a simple ICO file requires additional processing
    // For now, we'll create a 32x32 PNG as favicon.ico replacement
    // Browsers will accept PNG files with .ico extension
    fs.writeFileSync(
      path.join(outputDir, 'favicon.ico'),
      ico32
    );
    console.log('✓ Generated favicon.ico (PNG format)');
    console.log('\n✅ All favicon files generated successfully!');
  });
  
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('❌ Error: sharp module not found.');
    console.log('\nPlease install it first:');
    console.log('  npm install sharp --save-dev');
    console.log('\nOr use an online tool to convert favicon.svg to:');
    console.log('  - favicon.ico (32x32)');
    console.log('  - logo192.png (192x192)');
    console.log('  - logo512.png (512x512)');
  } else {
    console.error('❌ Error:', error.message);
  }
  process.exit(1);
}

