// Full-page screenshots of each static snapshot to verify fidelity.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const MONACO = path.join(__dirname, 'node_modules/monaco-editor/min/vs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/monaco-editor@[^/]+\/min\/vs\/(.*)$/, (r) => {
    const f = path.join(MONACO, r.request().url().match(/min\/vs\/([^?#]*)/)[1]);
    r.fulfill({ status: 200, body: fs.readFileSync(f), headers: { 'content-type': f.endsWith('.css') ? 'text/css' : 'application/javascript' } });
  });
  await ctx.route('http://localhost:3000/__brag/**', (r) => {
    const f = path.join(__dirname, r.request().url().split('/__brag/')[1].split('?')[0]);
    r.fulfill({ status: 200, body: fs.readFileSync(f), headers: { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' } });
  });
  const p = await ctx.newPage();
  for (const n of process.argv.slice(2)) {
    await p.goto('http://localhost:3000/__brag/snaps/' + n + '.html', { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: 'snaps/' + n + '-static-full.png', fullPage: true });
    console.log(n, await p.evaluate(() => document.documentElement.scrollHeight));
  }
  await b.close();
})();
