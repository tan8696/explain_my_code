// Stage for the Explain My Code launch video. Every frame is a pure function of t (seconds).
(() => {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, u) => a + (b - a) * u;
  const E = {
    lin: (u) => u,
    io: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
    io5: (u) => (u < 0.5 ? 16 * u ** 5 : 1 - Math.pow(-2 * u + 2, 5) / 2),
    out: (u) => 1 - Math.pow(1 - u, 3),
    out5: (u) => 1 - Math.pow(1 - u, 5),
    in: (u) => u * u * u,
  };
  const ramp = (t, t0, t1, e = E.io) => e(clamp((t - t0) / (t1 - t0)));
  // keys: [[time, value, easeIntoThisKey?]]
  function track(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        return lerp(v0, v1, (e || E.io)(clamp((t - t0) / (t1 - t0 || 1))));
      }
    }
    return keys[keys.length - 1][1];
  }
  const ztrack = (t, keys) => Math.exp(track(t, keys.map(([a, v, e]) => [a, Math.log(v), e])));
  const hash = (a, b) => {
    let h = (a * 374761393 + b * 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };

  // Beat-aligned timeline (160 BPM half-time, beat = 0.375 s). Shared with the soundtrack.
  const T = {
    drop: 3.0, curIn: 4.875, clickLaunch: 5.625, winIn: 5.9, clickChip: 6.75, clickExplain: 7.875,
    results: 8.625, clickLines: 9.75, rowHi: 11.25, clickBugs: 14.625, bugHi: 15.0, fixHi: 15.75,
    exit: 17.4, outro: 18.0, end: 22.5,
  };
  window.TIMELINE = T;

  const $ = (s) => document.querySelector(s);
  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    const sy = el.ownerDocument.defaultView.scrollY;
    return { x: r.left, y: r.top + sy, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + sy + r.height / 2, bottom: r.bottom + sy, right: r.right };
  };
  const byText = (doc, sel, txt) => [...doc.querySelectorAll(sel)].find((e) => e.textContent.includes(txt));

  let S = null; // populated by init()

  async function init() {
    if (document.readyState !== 'complete') await new Promise((r) => window.addEventListener('load', r, { once: true }));
    const ifrs = [...document.querySelectorAll('iframe')];
    for (const f of ifrs) {
      const d = f.contentDocument;
      d.documentElement.style.scrollBehavior = 'auto';
      await d.fonts.ready;
      await Promise.all([...d.images].map((im) => (im.complete ? 0 : im.decode().catch(() => 0))));
    }
    await document.fonts.ready;
    await Promise.all([...document.images].map((im) => im.decode().catch(() => 0)));

    // ── Landing ─────────────────────────────────────────────────────
    const L = $('#landing');
    const Ld = L.contentDocument;
    const h1 = Ld.querySelector('h1');
    const header = Ld.querySelector('header');
    const chip = h1.previousElementSibling, para = h1.nextElementSibling, btns = para.nextElementSibling, metrics = btns.nextElementSibling;
    const launch = [...btns.querySelectorAll('a')].find((a) => a.textContent.includes('Launch Studio Free'));
    const wavesHost = Ld.querySelector('[data-brag-waves]');
    const origH1 = h1.innerHTML;
    const scramble = buildScramble(Ld, h1);
    const h1Rect = rectOf(h1);
    const landAnims = Ld.getAnimations();
    landAnims.forEach((a) => a.pause());

    // ── Waves: the site's real GradientWaves shader, re-mounted and driven by t ──
    const waves = mountWaves(Ld, wavesHost);

    // ── Workspace states ────────────────────────────────────────────
    const st = {};
    for (const f of document.querySelectorAll('#win iframe')) {
      const d = f.contentDocument;
      st[f.dataset.state] = { el: f, doc: d, win: f.contentWindow };
    }
    for (const k of Object.keys(st)) {
      const d = st[k].doc;
      // Room to scroll the results into view like the real app's scrollIntoView, and a solid sticky nav
      // (the app's backdrop blur doesn't survive the static snapshot, so content would ghost through it).
      d.documentElement.style.paddingBottom = '700px';
      const hdr = d.querySelector('header');
      if (hdr) hdr.style.background = '#07070e';
    }
    const A = st.A.doc, B = st.B.doc, C = st.C.doc, D = st.D.doc, Ed = st.E.doc, F = st.F.doc;
    const chipA = byText(A, 'button', 'Python: Division Bug');
    const chipB = byText(B, 'button', 'Python: Division Bug');
    const explainB = byText(B, 'button', 'Explain This Code');
    const explainC = byText(C, 'button', 'Analyzing Code');
    const loadingRoot = byText(C, 'span', 'Gemini AI is analyzing').closest('.animate-fade-in');
    const linesTabD = D.querySelector('#tab-lines'), linesTabE = Ed.querySelector('#tab-lines');
    const bugsTabE = Ed.querySelector('#tab-bugs'), bugsTabF = F.querySelector('#tab-bugs');
    const rows = [...Ed.querySelectorAll('.line-row')];
    const rowsCard = rows[0].closest('.section-card');
    const row5 = rows[rows.length - 1];
    const bugCard = F.querySelector('#tabpanel-bugs .rounded-xl');
    const errBadge = F.querySelector('#tabpanel-bugs .badge-error');
    const fixBlock = F.querySelector('#tabpanel-bugs .rounded-lg.p-3');
    const fixedF = [...F.querySelectorAll('body *')].filter((el) => F.defaultView.getComputedStyle(el).position === 'fixed' && !el.closest('header') && el.getBoundingClientRect().width < 200);

    // Highlighter span around the funniest real phrase in row 5
    const expl = row5.querySelector('.line-explanation');
    const phrase = 'this line will never be reached';
    expl.innerHTML = expl.textContent.replace(phrase, `<span class="brag-hl">${phrase}</span>`);
    const hl = expl.querySelector('.brag-hl');
    hl.style.cssText = 'background-image:linear-gradient(90deg,rgba(56,189,248,.45),rgba(167,139,250,.5),rgba(244,114,182,.45));background-repeat:no-repeat;background-position:0 92%;background-size:0% 50%;border-radius:3px;';
    rows.forEach((r) => (r.style.opacity = '0'));

    // Measurements (doc coords at scroll 0)
    const R = {
      launch: rectOf(launch), chip: rectOf(chipA), explain: rectOf(explainB), loading: rectOf(loadingRoot),
      results: rectOf(D.querySelector('#results')), linesTab: rectOf(linesTabD), bugsTab: rectOf(bugsTabE),
      rowsCard: rectOf(rowsCard), row5: rectOf(row5), bugCard: rectOf(bugCard),
    };
    const numL = rectOf(row5.querySelector('.line-num'));
    const rng = Ed.createRange(); rng.selectNodeContents(expl);
    const er = rng.getBoundingClientRect();
    R.row5Content = { x0: numL.x, x1: er.right };

    const sc1 = Math.round(R.explain.cy - 540);
    const sc2 = Math.round(R.loading.y - 250);
    const sc3 = Math.round(R.results.y - 250);

    // Animations inside each state: infinite ones follow global t; "fresh" ones play from the state's start.
    const freshRoot = { C: loadingRoot, D: D.querySelector('#results'), E: Ed.querySelector('.tab-content-enter'), F: F.querySelector('.tab-content-enter') };
    const stStart = { A: T.winIn, B: T.clickChip, C: T.clickExplain, D: T.results, E: T.clickLines, F: T.clickBugs };
    for (const k of Object.keys(st)) {
      st[k].anims = st[k].doc.getAnimations().map((a) => {
        a.pause();
        const tm = a.effect.getComputedTiming();
        const tgt = a.effect.target;
        return { a, inf: tm.iterations === Infinity, end: tm.endTime, fresh: !!(freshRoot[k] && tgt && freshRoot[k].contains(tgt)) };
      });
    }

    S = { L, Ld, h1, origH1, header, chip, para, btns, metrics, launch, wavesHost, scramble, h1Rect, landAnims, waves,
      st, chipA, chipB, explainB, explainC, linesTabD, linesTabE, bugsTabE, bugsTabF, rows, row5, hl, bugCard, errBadge, fixBlock, fixedF,
      R, sc1, sc2, sc3, stStart, h1Restored: false };
    return R;
  }

  // Split the real <h1> into fixed-width character cells so each can decode from code glyphs.
  function buildScramble(doc, h1) {
    const grad = h1.querySelector('span');
    const gradStyle = grad.getAttribute('style');
    const line1 = 'Understand Any Code in';
    const line2 = grad.textContent;
    h1.textContent = '';
    const mkLine = () => { const d = doc.createElement('div'); d.style.whiteSpace = 'nowrap'; h1.appendChild(d); return d; };
    const cells = [];
    const l1 = mkLine(), l2 = mkLine();
    for (const ch of line1) { const s = doc.createElement('span'); s.textContent = ch; l1.appendChild(s); cells.push({ el: s, ch, grad: false }); }
    for (const ch of line2) { const s = doc.createElement('span'); s.textContent = ch; l2.appendChild(s); cells.push({ el: s, ch, grad: true }); }
    // measure natural glyph boxes, then freeze widths
    cells.forEach((c) => { c.el.style.display = 'inline-block'; c.el.style.whiteSpace = 'pre'; });
    const l2r = l2.getBoundingClientRect();
    let gx0 = Infinity, gx1 = -Infinity, gy0 = Infinity, gy1 = -Infinity;
    cells.forEach((c) => {
      const r = c.el.getBoundingClientRect(); c.r = r;
      if (c.grad) { gx0 = Math.min(gx0, r.left); gx1 = Math.max(gx1, r.right); gy0 = Math.min(gy0, r.top); gy1 = Math.max(gy1, r.bottom); }
    });
    const gradImg = /background-image:\s*([^;]+)/.exec(gradStyle)[1];
    cells.forEach((c, i) => {
      c.el.style.width = c.r.width + 'px';
      c.el.style.textAlign = 'center';
      c.gradCss = c.grad
        ? `background-image:${gradImg};background-size:${gx1 - gx0}px ${gy1 - gy0}px;background-position:${-(c.r.left - gx0)}px ${-(c.r.top - gy0)}px;-webkit-background-clip:text;background-clip:text;color:transparent;`
        : '';
      c.i = i;
    });
    void l2r;
    const N = cells.length;
    cells.forEach((c) => {
      const f = c.i / (N - 1);
      c.appear = 0.04 + 0.42 * f;
      c.resolve = 0.42 + 0.72 * f + 0.07 * hash(c.i, 7);
    });
    return cells;
  }

  const GLYPHS = '{}[]()<>=;:/*+-_.#&|!?$%01=>=>();{}xyzabn';
  function renderScramble(t) {
    for (const c of S.scramble) {
      if (c.ch === ' ') continue;
      let key;
      if (t < c.appear) key = 'hide';
      else if (t < c.resolve) key = 'g' + Math.floor(t * 22);
      else if (t < c.resolve + 0.1) key = 'flash';
      else key = 'final';
      if (c.key === key) continue;
      c.key = key;
      const el = c.el;
      if (key === 'hide') { el.textContent = c.ch; el.style.cssText = `display:inline-block;white-space:pre;width:${c.r.width}px;text-align:center;opacity:0;`; }
      else if (key === 'final') { el.textContent = c.ch; el.style.cssText = `display:inline-block;white-space:pre;width:${c.r.width}px;text-align:center;${c.gradCss}`; }
      else if (key === 'flash') {
        el.textContent = c.ch;
        el.style.cssText = `display:inline-block;white-space:pre;width:${c.r.width}px;text-align:center;color:#fff;text-shadow:0 0 18px rgba(56,189,248,.9),0 0 34px rgba(167,139,250,.7);`;
      } else {
        const g = GLYPHS[Math.floor(hash(c.i, Math.floor(t * 22)) * GLYPHS.length)];
        const col = c.i % 3 === 0 ? '#38bdf8' : c.i % 3 === 1 ? '#a78bfa' : '#f472b6';
        el.textContent = g;
        el.style.cssText = `display:inline-block;white-space:pre;width:${c.r.width}px;text-align:center;font-family:var(--font-mono);font-weight:500;color:${col};opacity:.9;text-shadow:0 0 14px ${col}88;`;
      }
    }
  }

  function mountWaves(doc, host) {
    const cv = doc.createElement('canvas');
    cv.width = 1280; cv.height = 720;
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    host.appendChild(cv);
    const gl = cv.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, window.WAVES_VERTEX));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, window.WAVES_FRAGMENT));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    // Props exactly as passed in apps/web/src/app/page.tsx
    gl.uniform2f(U('iResolution'), cv.width, cv.height);
    gl.uniform1f(U('uSpeed'), 0.4); gl.uniform1f(U('uAmplitude'), 2.5); gl.uniform1f(U('uWaveScale'), 0.6);
    gl.uniform1f(U('uWaveRatio'), 0.9); gl.uniform1f(U('uSwell'), 35); gl.uniform1f(U('uTurbulence'), 20);
    gl.uniform1f(U('uTilt'), 1.11); gl.uniform1f(U('uZoom'), 1.0); gl.uniform1f(U('uHeight'), 5.5);
    gl.uniform1f(U('uFogDepth'), 18); gl.uniform1f(U('uSteps'), 70); gl.uniform1f(U('uBrightness'), 1.3);
    gl.uniform1f(U('uOpacity'), 1.0); gl.uniform1f(U('uGrain'), 1.0); gl.uniform1f(U('uGrainIntensity'), 0.05);
    gl.uniform2f(U('uMouse'), 0.5, 0.5); gl.uniform1f(U('uParallax'), 0.5); gl.uniform1i(U('uEnableMouse'), 1);
    gl.uniform3fv(U('uHorizonColor'), hex('#5227FF')); gl.uniform3fv(U('uWaveColor'), hex('#FF9FFC')); gl.uniform3fv(U('uCrestColor'), hex('#FFFFFF'));
    const uTime = U('iTime');
    return (time) => {
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.finish();
    };
  }

  // Layer animated styles on top of the element's own inline style (never discard the app's styles).
  const setStyle = (el, css) => {
    if (el.__orig === undefined) el.__orig = el.getAttribute('style') || '';
    if (el.__css !== css) { el.style.cssText = el.__orig + ';' + css; el.__css = css; }
  };
  const reveal = (t, t0, dur = 0.5, dy = 16) => { const u = ramp(t, t0, t0 + dur, E.out); return { o: u, y: (1 - u) * dy }; };

  // ── Camera: landing page (iframe 1280x720) ───────────────────────
  function landingCam(t) {
    const h = S.h1Rect;
    const s = ztrack(t, [[0, 2.22], [2.95, 2.36, E.lin], [4.35, 1.5, E.io5], [5.8, 1.53, E.lin], [18, 1.58, E.lin], [22.5, 1.64, E.lin]]);
    const fx = track(t, [[0, h.cx], [2.95, h.cx], [4.35, 640, E.io5]]);
    const fy = track(t, [[0, h.cy], [2.95, h.cy], [4.35, 360, E.io5], [18, 360], [22.5, 372, E.lin]]);
    return { s, x: 960 - fx * s, y: 540 - fy * s };
  }
  const lmap = (cam, x, y) => [cam.x + x * cam.s, cam.y + y * cam.s];

  // ── Camera: workspace window (iframe 1280x760) ───────────────────
  function winCam(t) {
    const R = S.R, sc3 = S.sc3;
    const sRows = Math.min(1.5, 1850 / R.rowsCard.w);
    const r5w = R.row5Content.x1 - R.row5Content.x0;
    const sRow5 = Math.min(1.7, 1760 / r5w);
    const r5cx = (R.row5Content.x0 + R.row5Content.x1) / 2;
    const sBug = Math.min(1.5, 1840 / R.bugCard.w);
    const Sx = ztrack(t, [[0, 1.3], [6.9, 1.3], [7.8, 1.34], [8.625, 1.34], [9.3, 1.32], [10.45, 1.32], [11.1, sRows], [11.3, sRows], [11.95, sRow5], [14.1, sRow5 * 1.025, E.lin], [14.5, 1.32], [14.85, 1.32], [15.55, sBug], [17.4, sBug * 1.04, E.lin]]);
    const fx = track(t, [[0, 640], [6.9, 640], [7.8, 680], [8.625, 680], [9.3, 640], [10.45, 640], [11.1, R.rowsCard.cx], [11.3, R.rowsCard.cx], [11.95, r5cx], [14.1, r5cx], [14.5, 640], [14.85, 640], [15.55, R.bugCard.cx]]);
    const fy = track(t, [[0, 380], [6.9, 380], [7.8, 385], [8.625, 385], [9.3, 380], [10.45, 380], [11.1, R.rowsCard.cy - sc3 + 20], [11.3, R.rowsCard.cy - sc3 + 20], [11.95, R.row5.cy - sc3 - 40], [14.1, R.row5.cy - sc3 - 40], [14.5, 380], [14.85, 380], [15.55, R.bugCard.cy - sc3 + 30]]);
    const rise = ramp(t, T.winIn, T.winIn + 0.65, E.out);
    const exit = ramp(t, T.exit, T.exit + 0.5, E.in);
    const k = lerp(0.92, 1, rise) * lerp(1, 0.95, exit);
    const s = Sx * k;
    const scroll = track(t, [[0, 0], [6.9, 0], [7.7, S.sc1], [7.95, S.sc1], [8.55, S.sc2], [8.625, S.sc2], [9.3, S.sc3]]);
    return { s, x: 960 - fx * s, y: 684 - fy * s + (1 - rise) * 240 + exit * 280, o: rise * (1 - exit), scroll };
  }
  const wmap = (cam, x, docY) => [cam.x + x * cam.s, cam.y + (docY - cam.scroll) * cam.s];

  function stateAt(t) {
    if (t < T.clickChip) return 'A';
    if (t < T.clickExplain) return 'B';
    if (t < T.results) return 'C';
    if (t < T.clickLines) return 'D';
    if (t < T.clickBugs) return 'E';
    return 'F';
  }

  const CLICKS = [T.clickLaunch, T.clickChip, T.clickExplain, T.clickLines, T.clickBugs];
  const press = (t, tc) => (t < tc ? 1 - 0.05 * ramp(t, tc - 0.08, tc, E.lin) : 1 - 0.05 * (1 - ramp(t, tc, tc + 0.22, E.out)));

  window.renderFrame = (t) => {
    const lc = landingCam(t);
    const wc = winCam(t);

    // ── Landing ───────────────────────────────────────────────────
    setStyle(S.L, `transform:translate(${lc.x}px,${lc.y}px) scale(${lc.s});`);
    if (t < T.drop + 0.05) {
      if (S.h1Restored) { S.h1.innerHTML = ''; S.scramble = buildScramble(S.Ld, S.h1); S.h1Restored = false; }
      renderScramble(t);
    } else if (!S.h1Restored) { S.h1.innerHTML = S.origH1; S.h1Restored = true; }
    const heroOut = ramp(t, 5.68, 5.9, E.in);
    const hOut = (o, y) => `opacity:${o * (1 - heroOut)};transform:translateY(${y - heroOut * 12}px);`;
    const r1 = reveal(t, 3.3), r2 = reveal(t, 3.45), r3 = reveal(t, 3.6), r4 = reveal(t, 3.75), rh = reveal(t, 3.35, 0.5, -14);
    setStyle(S.chip, hOut(r1.o, r1.y));
    setStyle(S.para, hOut(r2.o, r2.y));
    setStyle(S.btns, hOut(r3.o, r3.y));
    setStyle(S.metrics, hOut(r4.o, r4.y));
    setStyle(S.header, hOut(rh.o, rh.y));
    setStyle(S.h1, `opacity:${1 - heroOut};transform:translateY(${-heroOut * 12}px);`);
    setStyle(S.launch, `transform:scale(${press(t, T.clickLaunch)});`);
    const wo = track(t, [[0, 0.0], [2.4, 0.1, E.lin], [T.drop, 0.18, E.in], [3.9, 1.0, E.out]]);
    setStyle(S.wavesHost, `opacity:${wo};`);
    S.landAnims.forEach((a) => (a.currentTime = t * 1000));
    S.waves(4.0 + t);
    const dimO = track(t, [[0, 0], [5.68, 0], [6.1, 0.5], [T.exit, 0.5], [18.2, 0.08]]);
    setStyle($('#dim'), `opacity:${dimO};`);

    // ── Workspace window ──────────────────────────────────────────
    const cur = stateAt(t);
    const win = $('#win');
    setStyle(win, `opacity:${wc.o};transform:translate(${wc.x}px,${wc.y}px) scale(${wc.s});`);
    for (const k of Object.keys(S.st)) {
      const s = S.st[k];
      const vis = k === cur && wc.o > 0;
      setStyle(s.el, `visibility:${vis ? 'visible' : 'hidden'};`);
      if (s.win.scrollY !== Math.round(wc.scroll)) s.win.scrollTo(0, Math.round(wc.scroll));
      if (k === cur) {
        for (const an of s.anims) {
          if (an.inf) an.a.currentTime = t * 1000;
          else if (an.fresh) an.a.currentTime = clamp((t - S.stStart[k]) * 1000, 0, an.end);
          else an.a.currentTime = an.end;
        }
      }
    }
    setStyle(S.chipA, `transform:scale(${press(t, T.clickChip)});`);
    setStyle(S.chipB, `transform:scale(${press(t, T.clickChip)});`);
    setStyle(S.explainB, `transform:scale(${press(t, T.clickExplain)});`);
    setStyle(S.explainC, `transform:scale(${press(t, T.clickExplain)});`);
    setStyle(S.linesTabD, `transform:scale(${press(t, T.clickLines)});`);
    setStyle(S.linesTabE, `transform:scale(${press(t, T.clickLines)});`);
    setStyle(S.bugsTabE, `transform:scale(${press(t, T.clickBugs)});`);
    setStyle(S.bugsTabF, `transform:scale(${press(t, T.clickBugs)});`);

    // Line-by-line rows stagger in, then row 5 gets the spotlight
    const hiU = ramp(t, T.rowHi, T.rowHi + 0.45, E.out);
    const hiBack = ramp(t, 14.1, 14.45);
    S.rows.forEach((r, i) => {
      const u = ramp(t, 9.95 + i * 0.13, 10.3 + i * 0.13, E.out);
      const isHi = i === S.rows.length - 1;
      const dimK = isHi ? 1 : lerp(1, 0.38, hiU * (1 - hiBack));
      const bg = isHi ? `background:linear-gradient(90deg,rgba(167,139,250,${0.16 * hiU}),rgba(56,189,248,${0.07 * hiU}));box-shadow:inset ${4 * hiU}px 0 0 #a78bfa;` : '';
      setStyle(r, `opacity:${u * dimK};transform:translateY(${(1 - u) * 10}px);${bg}`);
    });
    const hlU = ramp(t, T.rowHi + 0.2, T.rowHi + 0.85, E.io);
    S.hl.style.backgroundSize = `${hlU * 100}% 50%`;
    S.hl.style.color = hlU > 0.02 ? '#ffffff' : '';

    // Bug card emphasis
    const bugK = ramp(t, T.bugHi, T.bugHi + 0.15, E.out) * lerp(1, 0.55, ramp(t, T.bugHi + 0.15, T.bugHi + 0.8));
    setStyle(S.errBadge, `box-shadow:0 0 ${28 * bugK}px rgba(248,113,113,${0.85 * bugK}), 0 0 0 ${2 * bugK}px rgba(248,113,113,${0.5 * bugK});`);
    // Spotlight: dim everything in the page except the bug card
    const spot = ramp(t, T.bugHi, T.bugHi + 0.45, E.out);
    setStyle(S.bugCard, `box-shadow:0 0 0 4000px rgba(4,4,9,${0.68 * spot});position:relative;z-index:30;`);
    S.fixedF.forEach((el) => setStyle(el, `opacity:${1 - 0.8 * spot};`));
    const fixK = ramp(t, T.fixHi, T.fixHi + 0.25, E.out) * lerp(1, 0.7, ramp(t, T.fixHi + 0.25, T.fixHi + 1.0));
    setStyle(S.fixBlock, `background:rgba(16,185,129,${0.06 + 0.08 * fixK});border:1px solid rgba(16,185,129,${0.2 + 0.5 * fixK});box-shadow:0 0 ${36 * fixK}px rgba(52,211,153,${0.35 * fixK});`);

    // ── Captions ──────────────────────────────────────────────────
    const cap = (id, tin, tout) => {
      const i = ramp(t, tin, tin + 0.35, E.out), o = ramp(t, tout, tout + 0.2, E.in);
      setStyle($(id), `opacity:${i * (1 - o)};transform:translateX(-50%) translateY(${(1 - i) * 18 - o * 10}px);`);
    };
    cap('#cap1', 6.25, 9.55);
    cap('#cap2', 9.95, 14.35);
    cap('#cap3', 14.8, 17.3);

    // ── Outro ─────────────────────────────────────────────────────
    setStyle($('#outro .scrim'), `opacity:${ramp(t, 17.8, 18.4)};`);
    const og = ramp(t, 18.3, T.end, E.lin);
    setStyle($('#outro'), `transform:scale(${1 + 0.025 * og});`);
    const oi = (id, t0, dy = 30, sc = 1) => {
      const u = ramp(t, t0, t0 + 0.6, E.out5);
      setStyle($(id), `opacity:${u};transform:translateY(${(1 - u) * dy}px) scale(${lerp(sc, 1, u)});`);
    };
    oi('#o-logo', 18.0, 26, 0.82);
    oi('#o-name', 18.15);
    oi('#o-tag', 18.35);
    oi('#o-url', 18.55);

    // ── Cursor ────────────────────────────────────────────────────
    const R = S.R;
    const at = {
      off: () => [1760, 1160],
      launch: () => lmap(lc, R.launch.cx - 34, R.launch.cy + 6),
      chip: () => wmap(wc, R.chip.cx + 10, R.chip.cy + 4),
      explain: () => wmap(wc, R.explain.cx - 40, R.explain.cy + 4),
      lines: () => wmap(wc, R.linesTab.cx + 6, R.linesTab.cy + 4),
      park1: () => wmap(wc, 1180, R.linesTab.cy + 240),
      bugsPre: () => wmap(wc, 720, R.bugsTab.cy + 150),
      bugs: () => wmap(wc, R.bugsTab.cx + 4, R.bugsTab.cy + 4),
      park2: () => wmap(wc, 1190, R.bugsTab.cy + 260),
    };
    const keys = [
      [0, at.off], [T.curIn, at.off], [5.5, at.launch], [5.8, at.launch], [6.62, at.chip], [6.92, at.chip],
      [7.74, at.explain], [8.35, at.explain], [9.58, at.lines], [9.95, at.lines], [10.6, at.park1],
      [13.9, at.bugsPre], [14.5, at.bugs], [14.85, at.bugs], [15.45, at.park2],
    ];
    let pos = keys[keys.length - 1][1]();
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, f0] = keys[i - 1], [t1, f1] = keys[i];
        const u = clamp((t - t0) / (t1 - t0 || 1));
        const a = f0(), b = f1();
        if (f0 === f1 || i === 11) { pos = f0 === f1 ? a : b; break; }
        const e = E.io(u);
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const arc = Math.sin(Math.PI * e) * 0.1;
        pos = [lerp(a[0], b[0], e) - dy * arc, lerp(a[1], b[1], e) + dx * arc];
        break;
      }
    }
    let cs = 1;
    let rip = null;
    for (const tc of CLICKS) {
      if (t >= tc - 0.08 && t < tc) cs = lerp(1, 0.8, (t - (tc - 0.08)) / 0.08);
      else if (t >= tc && t < tc + 0.2) cs = lerp(0.8, 1, E.out((t - tc) / 0.2));
      if (t >= tc && t < tc + 0.5) rip = (t - tc) / 0.5;
    }
    const cvis = ramp(t, T.curIn, T.curIn + 0.2) * (1 - ramp(t, 10.3, 10.6)) + ramp(t, 13.9, 14.1) * (1 - ramp(t, 15.1, 15.4));
    setStyle($('#cursor'), `opacity:${clamp(cvis)};transform:translate(${pos[0] - 3}px,${pos[1] - 3}px) scale(${cs});`);
    setStyle($('#ripple'), rip === null ? 'opacity:0;' : `opacity:${0.75 * (1 - rip)};transform:translate(${pos[0]}px,${pos[1]}px) scale(${0.25 + 0.9 * E.out(rip)});`);
    return true;
  };

  window.stageReady = init();
})();
