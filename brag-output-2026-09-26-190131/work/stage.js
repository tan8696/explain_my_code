// yc-parody stage: a deadpan pitch deck with hard cuts. Every frame is a pure function of t (seconds).
(() => {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, u) => a + (b - a) * u;
  const E = {
    lin: (u) => u,
    io: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
    out: (u) => 1 - Math.pow(1 - u, 3),
  };
  const ramp = (t, t0, t1, e = E.io) => e(clamp((t - t0) / (t1 - t0)));
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

  // 96 BPM, beat = 0.625 s, bar = 2.5 s. Shared with audio.py.
  const T = {
    s2: 2.5, s3: 5.0, clickExplain: 5.3125, clickLines: 6.25, rowHi: 7.5,
    s4: 10.0, bugHi: 10.3125, fixHi: 10.9375, s5: 12.5, n2: 13.75, n3: 15.0, n4: 16.25, s6: 17.5, end: 21.25,
  };
  window.TIMELINE = T;
  const SCENES = [
    [0, 's1', '01', 'The problem'], [T.s2, 's2', '02', 'The solution'], [T.s3, 's3', '03', 'The product'],
    [T.s4, 's4', '04', "The product (cont’d)"], [T.s5, 's5', '05', 'By the numbers'], [T.s6, 's6', '06', 'The ask'],
  ];

  const $ = (s) => document.querySelector(s);
  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    const sy = el.ownerDocument.defaultView.scrollY;
    return { x: r.left, y: r.top + sy, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + sy + r.height / 2, right: r.right };
  };
  const byText = (doc, sel, txt) => [...doc.querySelectorAll(sel)].find((e) => e.textContent.includes(txt));
  const setStyle = (el, css) => {
    if (el.__orig === undefined) el.__orig = el.getAttribute('style') || '';
    if (el.__css !== css) { el.style.cssText = el.__orig + ';' + css; el.__css = css; }
  };

  let S = null;

  async function init() {
    if (document.readyState !== 'complete') await new Promise((r) => window.addEventListener('load', r, { once: true }));
    // Lay every scene out while measuring and loading fonts; renderFrame hides the inactive ones.
    document.querySelectorAll('.scene').forEach((el) => (el.style.display = 'block'));
    for (const f of document.querySelectorAll('iframe')) {
      const d = f.contentDocument;
      d.documentElement.style.scrollBehavior = 'auto';
      await d.fonts.ready;
      await Promise.all([...d.images].map((im) => (im.complete ? 0 : im.decode().catch(() => 0))));
    }
    await document.fonts.ready;
    await Promise.all([...document.images].map((im) => im.decode().catch(() => 0)));

    // ── 02: the real landing page ──
    const L = $('#landing'), Ld = L.contentDocument;
    const h1 = Ld.querySelector('h1');
    const metrics = h1.nextElementSibling.nextElementSibling.nextElementSibling;
    metrics.style.visibility = 'hidden';
    const landAnims = Ld.getAnimations(); landAnims.forEach((a) => a.pause());
    const waves = mountWaves(Ld, Ld.querySelector('[data-brag-waves]'));
    const h1R = rectOf(h1);

    // ── 03/04: workspace states ──
    const st = {};
    for (const f of document.querySelectorAll('#cam iframe')) {
      const d = f.contentDocument;
      d.documentElement.style.paddingBottom = '700px';
      const hdr = d.querySelector('header'); if (hdr) hdr.style.background = '#07070e';
      st[f.dataset.state] = { el: f, doc: d, win: f.contentWindow };
    }
    const B = st.B.doc, D = st.D.doc, Ed = st.E.doc, F = st.F.doc;
    const explainB = byText(B, 'button', 'Explain This Code');
    const linesTabD = D.querySelector('#tab-lines'), linesTabE = Ed.querySelector('#tab-lines');
    const rows = [...Ed.querySelectorAll('.line-row')];
    const row5 = rows[rows.length - 1];
    const expl = row5.querySelector('.line-explanation');
    const phrase = 'this line will never be reached';
    expl.innerHTML = expl.textContent.replace(phrase, `<span class="brag-hl">${phrase}</span>`);
    const hl = expl.querySelector('.brag-hl');
    hl.style.cssText = 'background-image:linear-gradient(90deg,rgba(56,189,248,.45),rgba(167,139,250,.5),rgba(244,114,182,.45));background-repeat:no-repeat;background-position:0 92%;background-size:0% 50%;border-radius:3px;';
    rows.forEach((r) => (r.style.opacity = '0'));
    const bugCard = F.querySelector('#tabpanel-bugs .rounded-xl');
    const errBadge = F.querySelector('#tabpanel-bugs .badge-error');
    const fixBlock = F.querySelector('#tabpanel-bugs .rounded-lg.p-3');
    const fixedF = [...F.querySelectorAll('body *')].filter((el) => F.defaultView.getComputedStyle(el).position === 'fixed' && !el.closest('header') && el.getBoundingClientRect().width < 200);

    const rng = Ed.createRange(); rng.selectNodeContents(expl);
    const er = rng.getBoundingClientRect();
    const R = {
      explain: rectOf(explainB), results: rectOf(D.querySelector('#results')), linesTab: rectOf(linesTabD),
      row5: rectOf(row5), row4: rectOf(rows[rows.length - 2]), expl: { x0: rectOf(expl).x, x1: er.right }, bugCard: rectOf(bugCard),
    };
    const scB = Math.round(R.explain.cy - 540);
    const scD = Math.round(R.results.y - 110);

    const freshRoot = { D: D.querySelector('#results'), E: Ed.querySelector('.tab-content-enter'), F: F.querySelector('.tab-content-enter') };
    const stStart = { B: T.s3, D: T.clickExplain, E: T.clickLines, F: T.s4 - 5 };
    for (const k of Object.keys(st)) {
      st[k].anims = st[k].doc.getAnimations().map((a) => {
        a.pause();
        const tm = a.effect.getComputedTiming();
        const tgt = a.effect.target;
        return { a, inf: tm.iterations === Infinity, end: tm.endTime, fresh: !!(freshRoot[k] && tgt && freshRoot[k].contains(tgt)) };
      });
    }

    document.querySelectorAll('.scene').forEach((el) => (el.style.display = ''));
    S = { L, h1R, landAnims, waves, st, explainB, linesTabD, linesTabE, rows, hl, bugCard, errBadge, fixBlock, fixedF, R, scB, scD, stStart };
    return R;
  }

  function mountWaves(doc, host) {
    host.innerHTML = '';
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

  // Inner camera of the product window (1680x650 at 120,300). Window-local anchor = (840, 325).
  function winCam(t) {
    const R = S.R;
    const sRow = Math.min(2.25, 1560 / (R.expl.x1 - R.expl.x0));
    const excx = (R.expl.x0 + R.expl.x1) / 2;
    const rowFy = (R.row4.cy + R.row5.cy) / 2 - S.scD + 6;
    const sBug = Math.min(1.34, 1620 / R.bugCard.w);
    let s, fx, fy, scroll;
    if (t < T.s4) {
      s = ztrack(t, [[T.s3, 1.0], [T.clickExplain + 0.05, 1.0], [5.95, 1.3125], [6.8, 1.3125], [7.5, sRow], [T.s4, sRow * 1.035, E.lin]]);
      fx = track(t, [[T.s3, 640], [6.8, 640], [7.5, excx]]);
      fy = track(t, [[T.s3, 325], [T.clickExplain + 0.05, 325], [5.95, 247.6], [6.8, 247.6], [7.5, rowFy]]);
      scroll = track(t, [[T.s3, S.scB], [T.clickExplain + 0.05, S.scB], [5.95, S.scD]]);
    } else {
      s = ztrack(t, [[T.s4, sBug], [T.s5, sBug * 1.04, E.lin]]);
      fx = S.R.bugCard.cx;
      fy = S.R.bugCard.cy - S.scD - 8;
      scroll = S.scD;
    }
    return { s, x: 840 - fx * s, y: 325 - fy * s, scroll };
  }
  const wmap = (c, x, docY) => [120 + c.x + x * c.s, 300 + c.y + (docY - c.scroll) * c.s];

  const press = (t, tc) => (t < tc ? 1 - 0.05 * ramp(t, tc - 0.08, tc, E.lin) : 1 - 0.05 * (1 - ramp(t, tc, tc + 0.22, E.out)));
  let lastScene = null;

  window.renderFrame = (t) => {
    let sc = SCENES[0];
    for (const s of SCENES) if (t >= s[0]) sc = s;
    const id = sc[1];
    if (id !== lastScene) {
      for (const s of SCENES) setStyle($('#' + s[1]), `display:${s[1] === id ? 'block' : 'none'};`);
      $('#label').innerHTML = `${sc[2]}<span class="dash">—</span>${sc[3]}`;
      $('#page').textContent = `${sc[2]} / 06`;
      setStyle($('#footScrim'), `visibility:${id === 's2' ? 'visible' : 'hidden'};`);
      setStyle($('#win'), `visibility:${id === 's3' || id === 's4' ? 'visible' : 'hidden'};`);
      if (id !== 's3' && id !== 's4') for (const k of Object.keys(S.st)) setStyle(S.st[k].el, 'visibility:hidden;');
      lastScene = id;
    }
    const local = t - sc[0];

    // 01 — the problem: "code." types in, then the caret blinks
    if (id === 's1') {
      const n = [0.35, 0.45, 0.55, 0.65].filter((x) => t >= x).length;
      $('#typed').textContent = 'code'.slice(0, n);
      $('#period').textContent = t >= 0.8 ? '.' : '';
      const on = t < 0.8 || Math.floor((t - 0.8) / 0.42) % 2 === 0;
      setStyle($('#caret'), `opacity:${on ? 1 : 0};`);
      setStyle($('#s1 .stmt'), `transform:scale(${1 + 0.022 * (local / 2.5)});`);
    }

    // 02 — the solution: real landing hero, zoomed past the nav, waves live
    if (id === 's2') {
      const s = 1.9 + 0.07 * (local / 2.5);
      const fx = 640, fy = S.h1R.cy + 70;
      setStyle(S.L, `transform:translate(${960 - fx * s}px,${540 - fy * s}px) scale(${s});`);
      S.landAnims.forEach((a) => (a.currentTime = t * 1000));
      S.waves(6.0 + t);
    }

    // 03/04 — the product window
    let cur = null;
    if (id === 's3' || id === 's4') {
      cur = t < T.clickExplain ? 'B' : t < T.clickLines ? 'D' : t < T.s4 ? 'E' : 'F';
      const c = winCam(t);
      S.cam = c;
      setStyle($('#cam'), `transform:translate(${c.x}px,${c.y}px) scale(${c.s});`);
      for (const k of Object.keys(S.st)) {
        const s = S.st[k];
        setStyle(s.el, `visibility:${k === cur ? 'visible' : 'hidden'};`);
        if (s.win.scrollY !== Math.round(c.scroll)) s.win.scrollTo(0, Math.round(c.scroll));
        if (k === cur) {
          const start = k === 'F' ? T.s4 - 5 : S.stStart[k];
          for (const an of s.anims) {
            if (an.inf) an.a.currentTime = t * 1000;
            else if (an.fresh) an.a.currentTime = clamp((t - start) * 1000, 0, an.end);
            else an.a.currentTime = an.end;
          }
        }
      }
      setStyle(S.explainB, `transform:scale(${press(t, T.clickExplain)});`);
      setStyle(S.linesTabD, `transform:scale(${press(t, T.clickLines)});`);
      setStyle(S.linesTabE, `transform:scale(${press(t, T.clickLines)});`);
      const hiU = ramp(t, T.rowHi, T.rowHi + 0.4, E.out);
      S.rows.forEach((r, i) => {
        const u = ramp(t, 6.3 + i * 0.1, 6.6 + i * 0.1, E.out);
        const last = i === S.rows.length - 1;
        const dimK = last || i === S.rows.length - 2 ? 1 : lerp(1, 0.35, ramp(t, 6.9, 7.4));
        const bg = last ? `background:linear-gradient(90deg,rgba(167,139,250,${0.16 * hiU}),rgba(56,189,248,${0.07 * hiU}));box-shadow:inset ${4 * hiU}px 0 0 #a78bfa;` : '';
        setStyle(r, `opacity:${u * dimK};transform:translateY(${(1 - u) * 10}px);${bg}`);
      });
      const hlU = ramp(t, T.rowHi + 0.15, T.rowHi + 0.8, E.io);
      S.hl.style.backgroundSize = `${hlU * 100}% 50%`;
      S.hl.style.color = hlU > 0.02 ? '#ffffff' : '';
      // 04: spotlight on the bug card, ERROR then the fix
      setStyle(S.bugCard, 'box-shadow:0 0 0 4000px rgba(4,4,9,0.66);position:relative;z-index:30;');
      S.fixedF.forEach((el) => setStyle(el, 'opacity:0.2;'));
      const bugK = ramp(t, T.bugHi, T.bugHi + 0.15, E.out) * lerp(1, 0.55, ramp(t, T.bugHi + 0.15, T.bugHi + 0.8));
      setStyle(S.errBadge, `box-shadow:0 0 ${28 * bugK}px rgba(248,113,113,${0.85 * bugK}), 0 0 0 ${2 * bugK}px rgba(248,113,113,${0.5 * bugK});`);
      const fixK = ramp(t, T.fixHi, T.fixHi + 0.25, E.out) * lerp(1, 0.7, ramp(t, T.fixHi + 0.25, T.fixHi + 1.0));
      setStyle(S.fixBlock, `background:rgba(16,185,129,${0.06 + 0.08 * fixK});border:1px solid rgba(16,185,129,${0.2 + 0.5 * fixK});box-shadow:0 0 ${36 * fixK}px rgba(52,211,153,${0.35 * fixK});`);
    }
    for (const el of document.querySelectorAll('.title')) setStyle(el, `transform:scale(${1 + 0.012 * clamp(local / 5)});transform-origin:0 50%;`);

    // Cursor (03 only): Explain, then Line by Line
    let cvis = 0, pos = [0, 0], cs = 1, rip = null;
    if (id === 's3') {
      const c = S.cam, R = S.R;
      const at = {
        near: () => wmap(c, R.explain.cx + 110, R.explain.cy + 70),
        explain: () => wmap(c, R.explain.cx - 30, R.explain.cy + 4),
        lines: () => wmap(c, R.linesTab.cx + 6, R.linesTab.cy + 4),
        away: () => wmap(c, 1150, R.linesTab.cy + 220),
      };
      const keys = [[T.s3, at.near], [5.25, at.explain], [5.45, at.explain], [6.12, at.lines], [6.4, at.lines], [6.9, at.away]];
      pos = keys[keys.length - 1][1]();
      for (let i = 1; i < keys.length; i++) {
        if (t <= keys[i][0]) {
          const [t0, f0] = keys[i - 1], [t1, f1] = keys[i];
          const a = f0(), b = f1();
          if (f0 === f1) { pos = a; break; }
          const e = E.io(clamp((t - t0) / (t1 - t0)));
          const dx = b[0] - a[0], dy = b[1] - a[1], arc = Math.sin(Math.PI * e) * 0.1;
          pos = [lerp(a[0], b[0], e) - dy * arc, lerp(a[1], b[1], e) + dx * arc];
          break;
        }
      }
      cvis = 1 - ramp(t, 6.55, 6.9);
      for (const tc of [T.clickExplain, T.clickLines]) {
        if (t >= tc - 0.08 && t < tc) cs = lerp(1, 0.8, (t - (tc - 0.08)) / 0.08);
        else if (t >= tc && t < tc + 0.2) cs = lerp(0.8, 1, E.out((t - tc) / 0.2));
        if (t >= tc && t < tc + 0.5) rip = (t - tc) / 0.5;
      }
    }
    setStyle($('#cursor'), `opacity:${cvis};transform:translate(${pos[0] - 3}px,${pos[1] - 3}px) scale(${cs});`);
    setStyle($('#ripple'), rip === null ? 'opacity:0;' : `opacity:${0.75 * (1 - rip)};transform:translate(${pos[0]}px,${pos[1]}px) scale(${0.25 + 0.9 * E.out(rip)});`);

    // 05 — by the numbers: one hard cut per metric
    if (id === 's5') {
      const starts = [T.s5, T.n2, T.n3, T.n4];
      let k = 0; starts.forEach((s, i) => { if (t >= s) k = i; });
      const u = clamp((t - starts[k]) / 1.25);
      document.querySelectorAll('#s5 .num').forEach((el, i) => setStyle(el, `visibility:${i === k ? 'visible' : 'hidden'};transform:scale(${1 + 0.03 * u});`));
      document.querySelectorAll('#s5 .numlab').forEach((el, i) => setStyle(el, `visibility:${i === k ? 'visible' : 'hidden'};`));
    }

    // 06 — the ask
    if (id === 's6') {
      const k = 1 + 0.02 * clamp(local / 3.75);
      setStyle($('#s6 .stmt'), `transform:scale(${k});`);
      setStyle($('#url'), `transform:scale(${k});`);
    }
    return true;
  };

  window.stageReady = init();
})();
