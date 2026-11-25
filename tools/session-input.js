// Reads the WhatsApp session for local runs.
//
// The batch file used to ask for it with `set /p`, but cmd truncates long
// pasted values (around 1024 characters), which cut the session in half and
// produced "SESSION could not be read. It looks cut off or changed".
// Reading through Node's readline has no such limit.
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const FILE = path.join(__dirname, '..', 'session.txt');
const REQUIRED = ['noiseKey', 'signedIdentityKey', 'signedPreKey', 'registrationId', 'advSecretKey'];

function inspect(raw) {
  let text = String(raw || '')
    .replace(/\r/g, '')
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim();
  if (!text) return { ok: false, reason: 'empty' };

  // Any label the session site puts in front, for example "ST.DERRICKS MD:~".
  // The core only strips labels made of letters, digits, - and _, so labels
  // containing a dot or a space are removed here instead.
  const label = text.match(/^[^:~\s][^:~]{0,40}:~\s*/);
  if (label) text = text.slice(label[0].length);

  let json = text;
  if (!text.startsWith('{')) {
    const base64 = text.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return { ok: false, reason: 'base64' };
    json = Buffer.from(base64, 'base64').toString('utf8');
  }

  let creds;
  try {
    creds = JSON.parse(json);
  } catch {
    return { ok: false, reason: 'json' };
  }
  if (!creds || typeof creds !== 'object') return { ok: false, reason: 'json' };

  const missing = REQUIRED.filter((key) => !(key in creds));
  if (missing.length > 0) return { ok: false, reason: 'keys', missing };

  // Store the login without any label so the core reads it as-is.
  const encoded = json.startsWith('{')
    ? Buffer.from(json, 'utf8').toString('base64')
    : text.replace(/\s+/g, '');
  return { ok: true, session: encoded };
}

function explain(reason, missing) {
  switch (reason) {
    case 'empty':
      return 'Nothing was entered.';
    case 'base64':
      return 'The session has characters that are not valid base64. Copy the whole line again.';
    case 'json':
      return 'That session is cut off or changed. Copy the whole thing, including the last characters.';
    case 'keys':
      return `That is not a WhatsApp login (missing: ${missing.join(', ')}). Generate a new session.`;
    default:
      return 'That session could not be used.';
  }
}

function save(session) {
  fs.writeFileSync(FILE, session, { encoding: 'utf8', mode: 0o600 });
}

async function ask() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  const lines = [];
  const session = await new Promise((resolve) => {
    const prompt = () =>
      process.stdout.write(
        lines.length === 0
          ? 'Session (paste it, then press Enter): '
          : 'Keep pasting / press Enter on an empty line to give up: '
      );
    rl.on('line', (line) => {
      lines.push(line);
      const result = inspect(lines.join(''));
      // The promise has to settle before rl.close(): closing emits "close"
      // synchronously, and that handler also resolves this promise.
      if (result.ok) {
        resolve(result.session);
        rl.close();
        return;
      }
      if (line.trim() === '' && lines.length > 1) {
        resolve(null);
        rl.close();
        return;
      }
      prompt();
    });
    rl.on('close', () => resolve(null));
    prompt();
  });
  return session;
}

async function loadSession() {
  if (process.env.SESSION && String(process.env.SESSION).trim() !== '') {
    const result = inspect(process.env.SESSION);
    if (result.ok) return result.session;
    console.error(`Session from the environment is not usable: ${explain(result.reason, result.missing)}`);
    return null;
  }

  if (fs.existsSync(FILE)) {
    const result = inspect(fs.readFileSync(FILE, 'utf8'));
    if (result.ok) {
      const current = fs.readFileSync(FILE, 'utf8');
      if (current.trim() !== result.session) save(result.session);
      return result.session;
    }
    console.error(`session.txt is not usable: ${explain(result.reason, result.missing)}`);
    console.error('Starting over with a fresh session.\n');
  }

  const session = await ask();
  if (!session) {
    console.error('\nNo session entered, so there is nothing to start.');
    return null;
  }
  save(session);
  console.log(`Session saved to session.txt (${session.length} characters).\n`);
  return session;
}

module.exports = { loadSession, inspect, FILE };
