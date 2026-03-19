#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Create minimal 1x1 PNG files as placeholders
 * Each file is a valid PNG with PNG signature + minimal IHDR chunk
 */

// PNG file signature followed by minimal IHDR chunk (1x1 blue pixel)
// This is a real, valid PNG file: PNG signature + IHDR chunk with CRC
const minimalPNG = Buffer.from([
  // PNG signature
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  // IHDR chunk
  0x00, 0x00, 0x00, 0x0d,                         // chunk length (13 bytes)
  0x49, 0x48, 0x44, 0x52,                         // "IHDR"
  0x00, 0x00, 0x00, 0x01,                         // width: 1
  0x00, 0x00, 0x00, 0x01,                         // height: 1
  0x08,                                           // bit depth: 8
  0x02,                                           // color type: RGB
  0x00,                                           // compression: deflate
  0x00,                                           // filter: none
  0x00,                                           // interlace: none
  0x90, 0x77, 0x53, 0xde,                         // CRC
  // IDAT chunk (minimal compressed data for 1x1 blue pixel)
  0x00, 0x00, 0x00, 0x0c,                         // chunk length (12 bytes)
  0x49, 0x44, 0x41, 0x54,                         // "IDAT"
  0x08, 0x99, 0x63, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
  0xe5, 0x27, 0xde, 0xfc,                         // CRC
  // IEND chunk
  0x00, 0x00, 0x00, 0x00,                         // chunk length (0 bytes)
  0x49, 0x45, 0x4e, 0x44,                         // "IEND"
  0xae, 0x42, 0x60, 0x82,                         // CRC
]);

const iconsDir = path.join(__dirname, '..', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, minimalPNG);
  console.log(`Created ${filePath}`);
});

console.log('All icon placeholders created successfully!');
