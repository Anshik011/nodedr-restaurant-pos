const fs = require('fs');
const path = require('path');

const standaloneDir = path.resolve(__dirname, '../.next/standalone/apps/web');
if (fs.existsSync(standaloneDir)) {
  const staticSrc = path.resolve(__dirname, '../.next/static');
  const staticDest = path.resolve(standaloneDir, '.next/static');
  if (fs.existsSync(staticSrc)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
    console.log('[standalone] Copied .next/static to standalone');
  }
  const publicSrc = path.resolve(__dirname, '../public');
  const publicDest = path.resolve(standaloneDir, 'public');
  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
    console.log('[standalone] Copied public to standalone');
  }
}

// Ensure root has public copied
const rootDir = path.resolve(__dirname, '../../..');
const rootPublic = path.resolve(rootDir, 'public');
const webPublic = path.resolve(__dirname, '../public');
if (!fs.existsSync(rootPublic) && fs.existsSync(webPublic)) {
  try {
    fs.cpSync(webPublic, rootPublic, { recursive: true });
    console.log('[standalone] Copied public to root');
  } catch (e) {
    console.warn('[standalone] Root public copy note:', e.message);
  }
}
