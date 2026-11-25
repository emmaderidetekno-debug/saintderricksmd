const fs = require('fs');
const path = require('path');

const { loadSession } = require('./tools/session-input');

const ENTRY = path.join(__dirname, 'index.js');
const TRIES = Math.max(1, Number(process.env.CORE_START_TRIES) || 5);
const WAIT_MS = Number(process.env.CORE_START_WAIT_MS) || 10000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const PAIR_URL = 'https://pair-tesla-md.onrender.com';
const SESSION_FILE = path.join(__dirname, 'session.txt');
const SESSION_DIR = path.join(__dirname, 'session');
// True when a host (Heroku, a container) supplied the session, because then the
// login lives in a config var and deleting local files would not replace it.
const HOST_SESSION = Boolean(String(process.env.SESSION || '').trim());

let logoutHandled = false;

// WhatsApp revokes a login when the device is removed from the phone, and a
// revoked login blocks every later start. The core prints the notice and keeps
// running in a failed state, so listen for that line, remove the dead login and
// stop, leaving the next start free to accept a fresh pairing.
function forgetRevokedLogin() {
  console.error('\n[SESSION] WhatsApp logged this bot out, so that login can never connect again.');
  if (HOST_SESSION) {
    console.error(`[SESSION] Set a new SESSION config var from ${PAIR_URL} and restart.`);
    return;
  }

  let removed = true;
  try {
    fs.rmSync(SESSION_FILE, { force: true, maxRetries: 5, retryDelay: 200 });
  } catch (error) {
    removed = false;
    console.error(`[SESSION] Could not delete session.txt: ${error.message}`);
  }
  try {
    fs.rmSync(SESSION_DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch (error) {
    removed = false;
    console.error(`[SESSION] Could not delete the session folder: ${error.message}`);
  }

  if (removed) {
    console.error('[SESSION] Removed session.txt and the session folder.');
    console.error(`[SESSION] Pair a new session at ${PAIR_URL}, start the bot again and paste it.`);
  } else {
    console.error('[SESSION] Run reset-session.bat to clear the old login, then pair again.');
  }

  // Nothing can connect with a revoked login, so stop instead of holding the port.
  setTimeout(() => process.exit(0), 300);
}

function watchForLogout() {
  const write = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk, ...rest) => {
    const result = write(chunk, ...rest);
    if (!logoutHandled && /Device has been logged out/i.test(String(chunk))) {
      logoutHandled = true;
      forgetRevokedLogin();
    }
    return result;
  };
}

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

  watchForLogout();
  require('./index.js');
}

main().catch((error) => {
  console.error('[CORE] Fatal:', error.message || error);
  process.exit(1);
});

