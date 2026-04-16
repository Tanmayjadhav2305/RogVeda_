/**
 * Generate PWA icon sizes from icon-512.png
 * Uses pure Node.js with sharp if available, otherwise copies the 512 to all sizes.
 * Run: node generate-icons.js
 */
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'public', 'icons');
const src = path.join(iconsDir, 'icon-512.png');

try {
  const sharp = require('sharp');
  const sizes = [144, 180, 192, 512];
  Promise.all(
    sizes.map(size =>
      sharp(src)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon-${size}.png`))
        .then(() => console.log(`✅ icon-${size}.png`))
    )
  ).then(() => console.log('All icons generated!'));
} catch {
  // sharp not available — just copy 512 to all sizes
  const sizes = [144, 180, 192];
  sizes.forEach(size => {
    fs.copyFileSync(src, path.join(iconsDir, `icon-${size}.png`));
    console.log(`📋 Copied icon-${size}.png (same resolution)`);
  });
  console.log('Done (sharp not available — install sharp for proper resizing)');
}
