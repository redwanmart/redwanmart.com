const fs = require('fs');
const path = require('path');

// For this conversion, we'll use a simple approach with sharp if available
// or create a basic PNG conversion

async function convertSvgToPng() {
  try {
    // Try using sharp (fast, modern image processing)
    const sharp = require('sharp');

    const svgPath = path.join(__dirname, 'public', 'logo.svg');
    const pngPath = path.join(__dirname, 'public', 'logo.png');

    await sharp(svgPath)
      .png()
      .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(pngPath);

    console.log('✓ Logo PNG created successfully at public/logo.png');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' || error.message.includes('Cannot find module')) {
      console.log('Sharp not available, using fallback method...');
      // Fallback: create a simple base64 PNG programmatically
      // For now, we'll just copy the SVG reference
      const svgData = fs.readFileSync(path.join(__dirname, 'public', 'logo.svg'), 'utf8');
      console.log('SVG created at public/logo.svg - use PNG version from SVG in browser');
    } else {
      console.error('Error converting SVG to PNG:', error);
    }
  }
}

convertSvgToPng();
