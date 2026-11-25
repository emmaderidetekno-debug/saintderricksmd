const fs = require('fs');
const path = require('path');

const { loadSession } = require('./tools/session-input');

const ENTRY = path.join(__dirname, 'index.js');
const TRIES = Math.max(1, Number(process.env.CORE_START_TRIES) || 5);
const WAIT_MS = Number(process.env.CORE_START_WAIT_MS) || 10000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const { syncCore } = require('./coresync');
  await syncCore();
  for (let attempt = 2; attempt <= TRIES && !fs.existsSync(ENTRY); attempt++) {
    console.error(`[CORE] index.js is still missing. Retrying in ${WAIT_MS / 1000}s (${attempt}/${TRIES}).`);
    await sleep(WAIT_MS);
    delete require.cache[require.resolve('./coresync')];
    await require('./coresync').syncCore();
  }
  if (!fs.existsSync(ENTRY)) {
    console.error('[CORE] index.js could not be downloaded. Exiting so the host restarts and tries again.');
    process.exit(1);
  }
  try { require('./tools/rebrand-core').rebrandCore(); } catch (error) { console.error('[REBRAND] skipped:', error.message); }

  const credsPath = path.join(__dirname, 'session', 'creds.json');
  const sessionFile = path.join(__dirname, 'session.txt');
  // A saved session.txt always wins over the stored creds, so pasting a fresh
  // session replaces one WhatsApp has already logged out. Without this the old
  // creds.json was reused and the bot kept reporting "Device has been logged out".
  if (fs.existsSync(sessionFile) || !fs.existsSync(credsPath)) {
    const session = await loadSession();
    if (session) process.env.SESSION = session;
    else if (!fs.existsSync(credsPath)) process.exit(1);
  }

  // Auto-join is not part of this project. The core falls back to a built-in
  // group code when the variable is missing, so it must be set to an empty
  // value rather than deleted.
  process.env.AUTO_JOIN = '';

  require('./index.js');
}

main().catch((error) => {
  console.error('[CORE] Fatal:', error.message || error);
  process.exit(1);
});

