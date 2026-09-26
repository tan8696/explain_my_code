// Drives the real running app (next start on :3000) and snapshots each UI state as static HTML.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const WORK = __dirname;
const SNAP = path.join(WORK, 'snaps');
const MONACO = path.join(WORK, 'node_modules/monaco-editor/min/vs');
fs.mkdirSync(SNAP, { recursive: true });

// Serve the Monaco CDN from the local package (jsdelivr is blocked by the sandbox proxy).
async function routeMonaco(ctx) {
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/monaco-editor@[^/]+\/min\/vs\/(.*)$/, (route) => {
    const rel = route.request().url().match(/min\/vs\/([^?#]*)/)[1];
    const file = path.join(MONACO, rel);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
    const ct = file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'application/javascript' : 'application/octet-stream';
    route.fulfill({ status: 200, body: fs.readFileSync(file), headers: { 'content-type': ct, 'access-control-allow-origin': '*' } });
  });
}

// Serialize the live DOM (incl. CSSOM-inserted rules and canvases) into a static, script-free page.
async function snapshot(page, name, prep) {
  const html = await page.evaluate((prepSrc) => {
    if (prepSrc) (0, eval)("(" + prepSrc + ")")();
    const clone = document.documentElement.cloneNode(true);
    // Canvases -> images
    const liveCanvases = [...document.querySelectorAll('canvas')];
    const cloneCanvases = [...clone.querySelectorAll('canvas')];
    cloneCanvases.forEach((c, i) => {
      try {
        const img = document.createElement('img');
        img.src = liveCanvases[i].toDataURL();
        img.style.cssText = liveCanvases[i].style.cssText;
        img.className = liveCanvases[i].className;
        c.replaceWith(img);
      } catch { c.remove(); }
    });
    // Form state
    const liveSelects = [...document.querySelectorAll('select')];
    [...clone.querySelectorAll('select')].forEach((s, i) => {
      [...s.options].forEach((o, j) => { if (j === liveSelects[i].selectedIndex) o.setAttribute('selected', ''); else o.removeAttribute('selected'); });
    });
    clone.querySelectorAll('script, link[rel=preload], link[rel=modulepreload], noscript, next-route-announcer').forEach((n) => n.remove());
    // Style elements: re-serialize from CSSOM so runtime-inserted rules survive
    const liveStyles = [...document.querySelectorAll('style')];
    const cloneStyles = [...clone.querySelectorAll('style')];
    cloneStyles.forEach((s, i) => {
      const sheet = liveStyles[i] && liveStyles[i].sheet;
      if (sheet) {
        try { s.textContent = [...sheet.cssRules].map((r) => r.cssText).join('\n'); } catch {}
      }
    });
    const adopted = (document.adoptedStyleSheets || []).map((sh) => [...sh.cssRules].map((r) => r.cssText).join('\n')).join('\n');
    if (adopted) {
      const st = document.createElement('style');
      st.textContent = adopted;
      clone.querySelector('head').appendChild(st);
    }
    return '<!DOCTYPE html>\n' + clone.outerHTML;
  }, prep ? prep.toString() : null);
  fs.writeFileSync(path.join(SNAP, name + '.html'), html);
  await page.screenshot({ path: path.join(SNAP, name + '.png') });
  console.log('snap', name, html.length);
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await routeMonaco(ctx);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text().slice(0, 200)); });

  // ── Workspace flow ───────────────────────────────────────────────
  await page.goto('http://localhost:3000/workspace', { waitUntil: 'networkidle' });
  await page.waitForSelector('.monaco-editor .view-lines .view-line');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  await page.mouse.move(1270, 10); // keep hover styles off
  await snapshot(page, 'A-initial');

  await page.getByRole('button', { name: /Python: Division Bug/ }).click();
  await page.waitForFunction(() => document.querySelector('.monaco-editor .view-lines')?.textContent.includes('divide_numbers'));
  await page.waitForTimeout(500);
  await page.mouse.move(1270, 10);
  await snapshot(page, 'B-division');

  // Hold the explain request so the real loading state can be captured.
  let release;
  const gate = new Promise((r) => (release = r));
  await page.route('**/v1/explain', async (route) => { await gate; await route.continue(); });
  await page.getByRole('button', { name: /Explain This Code/ }).click();
  await page.getByText('Analyzing Code...').waitFor();
  await page.waitForTimeout(400);
  await page.mouse.move(1270, 10);
  await snapshot(page, 'C-loading');
  release();

  await page.waitForSelector('#results');
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.move(1270, 10);
  await snapshot(page, 'D-summary');

  await page.getByRole('tab', { name: /Line by Line/ }).click();
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.move(1270, 10);
  await snapshot(page, 'E-lines');

  await page.getByRole('tab', { name: /Bugs/ }).click();
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.move(1270, 10);
  await snapshot(page, 'F-bugs');

  // ── Landing page ─────────────────────────────────────────────────
  const p2 = await ctx.newPage();
  await p2.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await p2.evaluate(() => document.fonts.ready);
  await p2.waitForTimeout(1500);
  await p2.mouse.move(1270, 10);
  await p2.screenshot({ path: path.join(SNAP, 'L-landing-live.png') });
  await snapshot(p2, 'L-landing', function () {
    // Tag the WebGL waves host so the stage can re-mount the real shader there.
    const c = document.querySelector('.gradient-waves-container');
    if (c) { c.setAttribute('data-brag-waves', ''); c.innerHTML = ''; }
  });

  await browser.close();
})();
