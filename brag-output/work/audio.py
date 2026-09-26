"""Soundtrack for the Explain My Code launch video.

160 BPM half-time, F major. The music and effects are written as one piece: every
effect is pitched to the chord playing at that moment and shares the same reverb.
Intro in D minor (confusion) -> drop onto F (clarity) -> ii-V-I (Gm7 - C9 - Fmaj9) on the outro.
Event times are the same beat-aligned timeline the stage uses (stage.js T).
"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile
import os

SR = 48000
DUR = 22.5
N = int(SR * DUR)
BEAT = 60 / 160
BAR = 4 * BEAT
E8 = BEAT / 2
rng = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), "stems")
os.makedirs(OUT, exist_ok=True)

T = dict(drop=3.0, clickLaunch=5.625, winIn=5.9, clickChip=6.75, clickExplain=7.875, results=8.625,
         clickLines=9.75, rowHi=11.25, clickBugs=14.625, bugHi=15.0, fixHi=15.75, exit=17.4, outro=18.0)

mtof = lambda m: 440.0 * 2 ** ((m - 69) / 12)
t_all = np.arange(N) / SR


def stereo(x, pan=0.0):
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def place(buf, sig, t0):
    i = int(round(t0 * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    if i < 0:
        sig = sig[-i:]
        i = 0
        j = min(len(buf), len(sig))
    buf[i:j] += sig[: j - i]


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x, axis=0)


def saw(f, n, phase0=0.0):
    dt = f / SR
    ph = (phase0 + np.cumsum(np.full(n, dt))) % 1.0
    y = 2 * ph - 1
    m = ph < dt
    x = ph[m] / dt
    y[m] -= x + x - x * x - 1
    m = ph > 1 - dt
    x = (ph[m] - 1) / dt
    y[m] -= x * x + x + x + 1
    return y


def env_adsr(n, a, r, total_hold):
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na) ** 1.5
    hold = int(total_hold * SR)
    if hold < n:
        nr = n - hold
        e[hold:] *= np.exp(-np.linspace(0, 1, nr) * 6)
    return e


# ── Harmony ────────────────────────────────────────────────────────────
# (start, dur, voicing, bass)
CH = [
    (0.0, BAR, [50, 57, 60, 64, 65], 38),          # Dm9
    (1.5, BAR, [53, 57, 60, 62, 65], 34),          # Bbmaj9
    (3.0, BAR, [53, 57, 60, 64, 69], 41),          # Fmaj7
    (4.5, BAR, [55, 57, 60, 64, 67], 33),          # Am7
    (6.0, BAR, [50, 57, 60, 64, 65], 38),          # Dm9
    (7.5, BAR, [53, 57, 60, 62, 65], 34),          # Bbmaj9
    (9.0, BAR, [53, 57, 60, 64, 69], 41),          # Fmaj7
    (10.5, BAR, [55, 57, 60, 64, 67], 33),         # Am7
    (12.0, BAR, [50, 57, 60, 64, 65], 38),         # Dm9
    (13.5, BAR, [53, 57, 60, 62, 65], 34),         # Bbmaj9
    (15.0, BAR, [53, 58, 62, 65, 69], 31),         # Gm9
    (16.5, BAR / 2, [55, 58, 62, 65, 70], 36),     # C9sus4
    (17.25, BAR / 2, [55, 58, 62, 64, 70], 36),    # C9
    (18.0, DUR - 18.0, [53, 57, 60, 64, 67, 72], 29),  # Fmaj9 (outro)
]


def chord_at(t):
    for s, d, v, b in CH:
        if s <= t < s + d:
            return v, b
    return CH[-1][2], CH[-1][3]


# ── Sidechain from the kick pattern ────────────────────────────────────
KICKS = []
for b in range(2, 12):
    bt = b * BAR
    KICKS += [bt, bt + 5 * E8]
KICKS = [k for k in KICKS if k < 17.25] + [T["outro"]]
side = np.ones(N)
for k in KICKS:
    i = int(k * SR)
    n = min(N - i, int(0.35 * SR))
    tt = np.arange(n) / SR
    side[i:i + n] = np.minimum(side[i:i + n], 1 - (1 - np.exp(-tt / 0.004)) * np.exp(-tt / 0.11))
side = np.clip(side, 0, 1)
duck = lambda depth: 1 - depth * (1 - side)

# ── Pad (supersaw, dark in the intro, opens at the drop) ───────────────
pad_dark = np.zeros((N, 2))
pad_bright = np.zeros((N, 2))
for s, d, v, b in CH:
    rel = 0.35 if s < 18 else 0.0
    n = int((d + rel) * SR)
    n = min(n, N - int(s * SR))
    seg = np.zeros((n, 2))
    for m in v:
        for k, det in enumerate([-0.08, 0.0, 0.08]):
            f = mtof(m) * 2 ** (det / 12)
            pan = [-0.6, 0.0, 0.6][k]
            seg += stereo(saw(f, n, rng.random()), pan) * 0.18
    hold = d if s < 18 else d
    e = env_adsr(n, 0.06 if s > 0 else 0.4, rel, hold)
    if s >= 18:
        e = np.minimum(1, np.arange(n) / (0.25 * SR)) * np.exp(-np.arange(n) / SR / 5.5)
    seg *= e[:, None]
    place(pad_dark, lp(seg, 650, 2), s)
    place(pad_bright, lp(seg, 3400, 2), s)
open_k = np.clip((t_all - 0.4) / 2.6, 0, 1) ** 2
open_k = np.where(t_all >= T["drop"], 1.0, open_k * 0.55)
pad = pad_dark * (1 - open_k)[:, None] + pad_bright * open_k[:, None]
pad *= duck(0.55)[:, None]

# ── Sub bass ───────────────────────────────────────────────────────────
bass = np.zeros(N)
for s, d, v, b in CH:
    if s < T["drop"]:
        continue
    n = min(int((d + 0.05) * SR), N - int(s * SR))
    tt = np.arange(n) / SR
    f = mtof(b + 12) if b < 33 else mtof(b)
    ph = 2 * np.pi * f * tt
    x = np.sin(ph) + 0.18 * np.sin(2 * ph)
    e = np.minimum(1, tt / 0.01) * np.minimum(1, np.maximum(0, (d + 0.05 - tt) / 0.05))
    if s >= 18:
        e = np.minimum(1, tt / 0.01) * np.exp(-tt / 1.6)
    place(bass, np.tanh(1.3 * x * e), s)
bass = lp(bass, 220, 2) * duck(0.75)
bass = stereo(bass)


# ── FM pluck / bell voices ─────────────────────────────────────────────
def fm(f, dur, ratio=2.0, index=2.2, idecay=0.09, adecay=0.35, attack=0.003):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    modl = index * np.exp(-tt / idecay) * np.sin(2 * np.pi * f * ratio * tt)
    y = np.sin(2 * np.pi * f * tt + modl)
    e = np.minimum(1, tt / attack) * np.exp(-tt / adecay)
    return y * e


# Arp: eighth notes over chord tones an octave up (ping-pong delay later)
arp = np.zeros((N, 2))
order = [0, 2, 1, 3, 2, 4, 3, 1]
i = 0
t = 0.0
while t < 17.25:
    v, _ = chord_at(t + 1e-4)
    m = v[order[i % 8] % len(v)] + 12
    lvl = 0.45 if t < T["drop"] else 1.0
    if t < T["drop"]:
        lvl *= 0.35 + 0.65 * (t / T["drop"])
    acc = 1.0 if i % 2 == 0 else 0.72
    place(arp, stereo(fm(mtof(m), 0.6, 2.0, 1.6, 0.06, 0.2) * lvl * acc, -0.35 if i % 2 else 0.35), t)
    i += 1
    t += E8
arp = lp(arp, 5200, 2)
arp *= duck(0.3)[:, None]


def pingpong(x, delay, fb, n_rep=5, damp=3500):
    y = np.zeros_like(x)
    d = int(delay * SR)
    cur = x.copy()
    for k in range(1, n_rep + 1):
        cur = lp(cur, damp, 1) * fb
        sh = np.zeros_like(cur)
        sh[d * k:] = cur[: len(cur) - d * k] if d * k < len(cur) else 0
        if k % 2:
            sh = sh[:, ::-1]
        y += sh
    return y


arp_fx = pingpong(arp, 3 * E8 / 2, 0.38, 4)

# ── Drums ──────────────────────────────────────────────────────────────
drums = np.zeros((N, 2))


def kick():
    n = int(0.4 * SR)
    tt = np.arange(n) / SR
    f = 46 + 110 * np.exp(-tt / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-tt / 0.2)
    click = lp(rng.standard_normal(n) * np.exp(-tt / 0.0025), 3000, 1) * 0.25
    return np.tanh(1.4 * (y + click))


def clap():
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    nz = rng.standard_normal(n)
    e = np.zeros(n)
    for k, off in enumerate([0.0, 0.011, 0.022]):
        e += (tt >= off) * np.exp(-np.maximum(0, tt - off) / (0.012 if k < 2 else 0.14))
    return bp(nz * e, 900, 2600, 2) * 0.9


def hat(open_=False):
    n = int(0.12 * SR)
    tt = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7500, 2) * np.exp(-tt / (0.05 if open_ else 0.022))


K = kick()
for k in KICKS:
    place(drums, stereo(K * (1.0 if k != T["outro"] else 0.9)), k)
claps = np.zeros((N, 2))
for b in range(2, 12):
    ct = b * BAR + 4 * E8
    if ct < 17.25:
        place(claps, stereo(clap(), 0.05), ct)
hats = np.zeros((N, 2))
for b in range(2, 12):
    for e8 in range(8):
        ht = b * BAR + e8 * E8
        if ht >= 17.25:
            continue
        lvl = 0.55 if e8 % 2 else 1.0
        place(hats, stereo(hat(e8 == 7) * lvl, 0.25 if e8 % 2 else -0.15), ht)
hats = lp(hats, 12000, 1)

# ── Effects, pitched to the harmony ────────────────────────────────────
fx = np.zeros((N, 2))
# Decode glitter: sixteenth-note blips in D minor pentatonic while the headline resolves
pent = [74, 77, 79, 81, 84, 86]
t = 0.09
while t < 1.2:
    m = pent[int(rng.integers(len(pent)))]
    place(fx, stereo(fm(mtof(m), 0.25, 3.0, 1.2, 0.02, 0.05) * 0.5, rng.uniform(-0.7, 0.7)), t)
    t += BEAT / 4
# Riser into the drop (band-limited noise sweeping up), and into the outro
def riser(t0, t1, lvl):
    n = int((t1 - t0) * SR)
    tt = np.linspace(0, 1, n)
    nz = rng.standard_normal((n, 2))
    out = np.zeros((n, 2))
    blocks = 24
    for bI in range(blocks):
        a, b_ = bI * n // blocks, (bI + 1) * n // blocks
        fc = 300 * (5000 / 300) ** (bI / blocks)
        out[a:b_] = bp(nz[a:b_], fc * 0.7, min(fc * 1.4, 20000), 1)
    out *= (tt ** 2.2 * lvl)[:, None]
    place(fx, out, t0)
riser(1.6, 3.0, 0.5)
riser(17.0, 18.0, 0.45)
# Soft whoosh for the page change
def whoosh(t0, dur, lvl):
    n = int(dur * SR)
    tt = np.linspace(0, 1, n)
    x = bp(rng.standard_normal((n, 2)), 500, 2500, 1) * (np.sin(np.pi * tt) ** 2)[:, None] * lvl
    place(fx, x, t0)
whoosh(5.62, 0.45, 0.35)
# Impacts (sub thump + air) on the drop and the outro
def impact(t0, lvl):
    n = int(1.6 * SR)
    tt = np.arange(n) / SR
    f = 36 + 40 * np.exp(-tt / 0.08)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.5)
    air = lp(rng.standard_normal(n), 1800, 1) * np.exp(-tt / 0.12) * 0.25
    place(fx, stereo((sub + air) * lvl), t0)
impact(T["drop"], 0.55)
impact(T["outro"], 0.5)
# UI clicks: tiny pitched ticks on the current chord's top note
for tc in [T["clickLaunch"], T["clickChip"], T["clickExplain"], T["clickLines"], T["clickBugs"]]:
    v, _ = chord_at(tc)
    m = v[-1] + 12
    tick = fm(mtof(m), 0.12, 1.0, 0.8, 0.01, 0.03, 0.001) * 0.7
    tick += lp(rng.standard_normal(len(tick)) * np.exp(-np.arange(len(tick)) / SR / 0.002), 2500, 1) * 0.35
    place(fx, stereo(tick, 0.15), tc)
# Bells for the story beats
def bells(t0, notes, step, lvl, pan=0.0):
    for k, m in enumerate(notes):
        place(fx, stereo(fm(mtof(m), 1.6, 3.5, 1.0, 0.15, 0.55) * lvl, pan + (k - len(notes) / 2) * 0.12), t0 + k * step)
bells(T["results"], [77, 81, 84], 0.07, 0.3)                 # F A C over Bbmaj9: "done"
bells(T["rowHi"], [76, 81], 0.09, 0.26)                     # E A over Am7: the highlight
bells(T["bugHi"], [74, 70], 0.13, 0.3)                      # D -> Bb over Gm: "uh-oh"
bells(T["fixHi"], [70, 74, 77, 81], 0.075, 0.26)            # Gm9 rising: the fix
bells(T["outro"] + 0.02, [77, 81, 84, 88, 91], BEAT / 4, 0.28)  # Fmaj9 sparkle on the logo

# ── Mix ────────────────────────────────────────────────────────────────
def reverb_ir(sec=2.4, pre=0.02):
    n = int(sec * SR)
    tt = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-tt / (sec / 6.5))[:, None]
    ir = lp(ir, 5000, 1)
    ir = np.concatenate([np.zeros((int(pre * SR), 2)), ir])
    return ir / np.sqrt((ir ** 2).sum(axis=0))


IR = reverb_ir()


def verb(x):
    return np.stack([fftconvolve(x[:, c], IR[:, c])[:N] for c in range(2)], axis=1)


stems = {
    "pad": pad * 0.34,
    "bass": bass * 0.36,
    "arp": (arp + arp_fx) * 0.2,
    "kick": drums * 0.5,
    "clap": claps * 0.16,
    "hats": hats * 0.05,
    "fx": fx * 0.22,
}
send = stems["pad"] * 0.35 + stems["arp"] * 0.5 + stems["clap"] * 0.6 + stems["fx"] * 0.7
wet = verb(send) * 0.55
mix = sum(stems.values()) + wet
mix = hp(mix, 28, 2)
# Final fade and gentle glue
fade = np.clip((DUR - t_all) / 1.4, 0, 1) ** 1.5
fade *= np.clip(t_all / 0.01, 0, 1)
mix *= fade[:, None]
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.25) / np.tanh(1.25)
mix *= 10 ** (-5.0 / 20)

for k, v in list(stems.items()) + [("reverb", wet)]:
    wavfile.write(os.path.join(OUT, f"{k}.wav"), SR, (np.clip(v / max(1e-9, np.abs(v).max()), -1, 1) * 32767 * 0.9).astype(np.int16))
wavfile.write(os.path.join(os.path.dirname(__file__), "soundtrack.wav"), SR, (mix * 32767).astype(np.int16))
print("ok", mix.shape, float(np.abs(mix).max()))
