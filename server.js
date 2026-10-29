const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const BACKEND_PORT = parseInt(process.env.INTERNAL_BACKEND_PORT, 10) || 4001;

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = String(PORT);
process.env.HOSTNAME = '0.0.0.0';
process.env.INTERNAL_BACKEND_PORT = String(BACKEND_PORT);
process.env.BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://restauranterp.uptoware.com';
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'uptoware-restaurant-erp-jwt-secret-key-32chars-min-prod';
}

console.log(`[Uptoware] Initializing Uptoware Restaurant ERP on port ${PORT}...`);

let backendProcess = null;
const backendPath = path.resolve(__dirname, 'apps/backend/dist/src/main.js');

if (fs.existsSync(backendPath)) {
  console.log(`[Uptoware] Starting backend service on internal port ${BACKEND_PORT}...`);
  try {
    backendProcess = spawn(process.execPath, [backendPath], {
      cwd: path.resolve(__dirname, 'apps/backend'),
      env: {
        ...process.env,
        PORT: String(BACKEND_PORT),
      },
      stdio: 'inherit',
    });

    backendProcess.on('error', (err) => {
      console.error('[Uptoware] Backend service error:', err.message);
    });
  } catch (err) {
    console.warn('[Uptoware] Backend launch warning:', err.message);
  }
} else {
  console.log(`[Uptoware] Backend dist not found at ${backendPath}, running frontend standalone.`);
}

// Next.js standalone entry
const standaloneEntry = path.resolve(
  __dirname,
  'apps/web/.next/standalone/apps/web/server.js'
);

if (fs.existsSync(standaloneEntry)) {
  console.log(`[Uptoware] Starting Next.js standalone server on port ${PORT}...`);
  require(standaloneEntry);
} else {
  console.log(`[Uptoware] Standalone server not found, falling back to next start...`);
  const nextProcess = spawn('npx', ['next', 'start', '-p', String(PORT), '-H', '0.0.0.0'], {
    cwd: path.resolve(__dirname, 'apps/web'),
    env: process.env,
    stdio: 'inherit',
    shell: true,
  });

  nextProcess.on('error', (err) => {
    console.error('[Uptoware] Next.js process error:', err.message);
  });

  nextProcess.on('exit', (code) => {
    if (backendProcess) {
      try { backendProcess.kill(); } catch (_) {}
    }
    process.exit(code || 0);
  });
}

function handleShutdown() {
  console.log('[Uptoware] Gracefully shutting down...');
  if (backendProcess) {
    try {
      backendProcess.kill('SIGTERM');
    } catch (_) {}
  }
  process.exit(0);
}

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
