const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

function ensureDir() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Persists a buffer and returns a public URL.
 * Supports 'local' (default) and 'cloudinary'.
 */
async function uploadBuffer(buffer, name, mimetype = 'audio/mpeg') {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  if (provider === 'cloudinary') {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const resourceType = mimetype.startsWith('audio') ? 'video' : 'raw';
    const dataUrl = `data:${mimetype};base64,${buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUrl, {
      public_id: path.parse(name).name,
      resource_type: resourceType,
    });
    return result.secure_url;
  }

  // local storage
  ensureDir();
  const safeName = `${crypto.randomUUID()}-${path.basename(name)}`;
  const filePath = path.join(UPLOADS_DIR, safeName);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${safeName}`;
}

module.exports = { uploadBuffer };
