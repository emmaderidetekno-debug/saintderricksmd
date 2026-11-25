// Builds tesla/index.html: the page the bot serves at / must be self-contained,
// because the core's web server answers only / and /healthz, not static files.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const page = fs.readFileSync(path.join(root, 'stderricks', 'index.html'), 'utf8');

function dataUri(rel) {
  const file = path.join(root, 'stderricks', rel);
  const type = path.extname(file).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
  return 'data:' + type + ';base64,' + fs.readFileSync(file).toString('base64');
}

let out = page.split('src="assets/stderricks-logo.jpg"').join('src="' + dataUri('assets/stderricks-logo.jpg') + '"');
out = out.split('src="assets/stderricks-hero.jpg"').join('src="' + dataUri('assets/stderricks-hero.jpg') + '"');

fs.mkdirSync(path.join(root, 'tesla'), { recursive: true });
fs.writeFileSync(path.join(root, 'tesla', 'index.html'), out);
console.log('tesla/index.html built (' + Math.round(out.length / 1024) + ' KB, images inlined)');
