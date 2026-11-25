// The core is downloaded from the upstream files repo on every start, so anything
// rebranded by hand is overwritten. This rewrites the brand strings in the
// downloaded files after each sync.
//
// Lowercase "tesla" is deliberately left alone: it is part of the pairing
// hostname, the upstream files repo and internal identifiers, and changing it
// stops the bot from starting.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const FILES = ['index.js', 'tesla.js'];
const DIRS = ['lib', 'plugins'];

const RULES = [
  // styled menu title such as TESLA-<mathematical bold letters>
  [/TESLA-[𝐀-𝟿]+/gu, 'ST.DERRICKS MD'],
  ['TESLA-MD', 'ST.DERRICKS MD'],
  ['TESLA', 'ST.DERRICKS'],
  ['Tesla', 'St.Derricks']
];

function walk(dir) {
  const found = [];
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else if (entry.name.endsWith('.js')) found.push(full);
  }
  return found;
}

function patch(file) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const rule of RULES) {
    after = Array.isArray(rule) ? after.split(rule[0]).join(rule[1]) : after.replace(rule[0], rule[1]);
  }
  if (after === before) return 0;
  fs.writeFileSync(file, after);
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'ignore' });
  } catch (error) {
    fs.writeFileSync(file, before);
    console.warn('[REBRAND] reverted ' + path.relative(root, file) + ': syntax check failed');
    return 0;
  }
  return 1;
}

function rebrandCore() {
  const targets = FILES.map((f) => path.join(root, f)).filter((f) => fs.existsSync(f));
  for (const dir of DIRS) targets.push(...walk(path.join(root, dir)));
  let changed = 0;
  for (const file of targets) changed += patch(file);
  if (changed) console.log('[REBRAND] ' + changed + ' core file(s) rebranded to ST.DERRICKS MD');
  return changed;
}

module.exports = { rebrandCore };
