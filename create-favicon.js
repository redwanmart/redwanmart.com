const sharp = require('sharp');
const path = require('path');

async function createFavicon() {
  try {
    const pngPath = path.join(__dirname, 'public', 'logo.png');
    const icoPath = path.join(__dirname, 'public', 'favicon.ico');

    // Create a 32x32 ICO file
    await sharp(pngPath)
      .resize(32, 32, { fit: 'contain', background: { r: 204, g: 0, b: 0, alpha: 255 } })
      .toFile(path.join(__dirname, 'public', 'favicon-32.png'));

    // Create favicon.ico (we'll just use the PNG for now as most browsers support it)
    await sharp(pngPath)
      .resize(16, 16, { fit: 'contain', background: { r: 204, g: 0, b: 0, alpha: 255 } })
      .toFile(path.join(__dirname, 'public', 'favicon.png'));

    console.log('✓ Favicons created successfully');
  } catch (error) {
    console.error('Error creating favicon:', error.message);
  }
}

createFavicon();
