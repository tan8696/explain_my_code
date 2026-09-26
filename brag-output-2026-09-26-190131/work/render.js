// Renders the stage frame by frame.
//   node render.js stills <t> [t...]      -> stills/t-<t>.png
//   node render.js video <out.mp4> [fps]  -> silent H.264 video
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const WORK = __dirname;
const MONACO = path.join(WORK, 'node_modules/monaco-editor/min/vs');
const FFMPEG = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png' };

async function openStage() {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/monaco-editor@[^/]+\/min\/vs\/(.*)$/, (r) => {
    const f = path.join(MONACO, r.request().url().match(/min\/vs\/([^?#]*)/)[1]);
    if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' });
    r.fulfill({ status: 200, body: fs.readFileSync(f), headers: { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' } });
  });
  await ctx.route('http://localhost:3000/__brag/**', (r) => {
    const f = path.join(WORK, decodeURIComponent(r.request().url().split('/__brag/')[1].split('?')[0]));
    if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' });
    r.fulfill({ status: 200, body: fs.readFileSync(f), headers: { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' } });
  });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log('console:', m.text().slice(0, 300)); });
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  await page.goto('http://localhost:3000/__brag/stage.html', { waitUntil: 'load' });
  await page.evaluate(() => window.stageReady);
  return { browser, page };
}

(async () => {
  const [mode, ...args] = process.argv.slice(2);
  const { browser, page } = await openStage();
  if (mode === 'stills') {
    fs.mkdirSync(path.join(WORK, 'stills'), { recursive: true });
    for (const a of args) {
      const t = parseFloat(a);
      await page.evaluate((t) => window.renderFrame(t), t);
      await page.screenshot({ path: path.join(WORK, 'stills', `t-${t.toFixed(3)}.png`) });
      console.log('still', t);
    }
  } else if (mode === 'video') {
    const out = args[0];
    const fps = parseInt(args[1] || '30', 10);
    const dur = await page.evaluate(() => window.TIMELINE.end);
    const n = Math.round(dur * fps);
    const ff = spawn(FFMPEG, ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const t = i / fps;
      await page.evaluate((t) => window.renderFrame(t), t);
      const buf = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (i % 30 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
  }
  await browser.close();
})();
