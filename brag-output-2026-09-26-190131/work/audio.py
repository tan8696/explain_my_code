"""Soundtrack for the yc-parody cut: an earnest "inspirational startup" piano bed, played straight.

96 BPM, F major, the most sincere progression there is (I - V6 - vi - IV). Slide cuts get a soft
sub thud tuned to F; the four metric cuts climb C5 E5 F5 G5 and resolve to A5 on the final F chord.
All effects share the music's key and reverb. Event times match stage.js T.
"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile
import os

SR = 48000
DUR = 21.25
N = int(SR * DUR)
BEAT = 60 / 96
BAR = 4 * BEAT
E8 = BEAT / 2
rng = np.random.default_rng(11)
HERE = os.path.dirname(__file__)
os.makedirs(os.path.join(HERE, "stems"), exist_ok=True)
t_all = np.arange(N) / SR
mtof = lambda m: 440.0 * 2 ** ((m - 69) / 12)

T = dict(s2=2.5, s3=5.0, clickExplain=5.3125, clickLines=6.25, rowHi=7.5, s4=10.0, bugHi=10.3125,
         fixHi=10.9375, s5=12.5, n2=13.75, n3=15.0, n4=16.25, s6=17.5)
CUTS = [T["s2"], T["s3"], T["s4"], T["s5"], T["n2"], T["n3"], T["n4"], T["s6"]]


def stereo(x, pan=0.0):
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def place(buf, sig, t0):
    i = int(round(t0 * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x, axis=0)


def piano(m, dur, vel=1.0):
    """Soft felt piano: slightly inharmonic partials, brighter and faster-decaying when struck harder."""
    f = mtof(m)
    n = int((dur + 1.2) * SR)
    tt = np.arange(n) / SR
    y = np.zeros(n)
    for k in range(1, 15):
        fk = k * f * np.sqrt(1 + 0.0004 * k * k)
        if fk > 12000:
            break
        amp = (1 / k ** 1.05) * (0.66 + 0.34 * vel) ** (k - 1)
        y += amp * np.sin(2 * np.pi * fk * tt + rng.random() * 6.28) * np.exp(-tt * (0.7 + 0.55 * k) * (1.0 + (m - 60) / 60))
    y *= np.minimum(1, tt / 0.004)
    damp = np.ones(n)
    k0 = int(dur * SR)
    damp[k0:] = np.exp(-np.arange(n - k0) / SR / 0.09)
    y *= damp
    thump = lp(rng.standard_normal(n) * np.exp(-tt / 0.004), 1200, 1) * 0.08
    return (y + thump) * vel * 0.5


def fm(f, dur, ratio=3.5, index=1.0, idecay=0.15, adecay=0.6, attack=0.003):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * tt + index * np.exp(-tt / idecay) * np.sin(2 * np.pi * f * ratio * tt))
    return y * np.minimum(1, tt / attack) * np.exp(-tt / adecay)


def saw(f, n):
    dt = f / SR
    ph = (rng.random() + np.cumsum(np.full(n, dt))) % 1.0
    y = 2 * ph - 1
    m = ph < dt; x = ph[m] / dt; y[m] -= x + x - x * x - 1
    m = ph > 1 - dt; x = (ph[m] - 1) / dt; y[m] -= x * x + x + x + 1
    return y


# (bar start, right-hand voicing, left-hand bass)
BARS = [
    (0.0, [57, 60, 65], [41, 53]),     # F
    (2.5, [55, 60, 64], [40, 52]),     # C/E
    (5.0, [57, 62, 65], [38, 50]),     # Dm
    (7.5, [58, 62, 65], [34, 46]),     # Bb
    (10.0, [57, 60, 65], [41, 53]),    # F
    (12.5, [55, 60, 64], [36, 48]),    # C
    (15.0, [58, 62, 65], [34, 46]),    # Bb
    (17.5, [57, 60, 65, 69], [29, 41]),  # F (final)
]

# ── Piano: eighth-note pulse in the right hand, bass on beats 1 and 3 ──
pno = np.zeros((N, 2))
for s, rh, lh in BARS:
    final = s >= 17.5
    if final:
        for k, m in enumerate(rh):
            place(pno, stereo(piano(m, 3.4, 0.85), -0.2 + 0.13 * k), s + 0.012 * k)
        for m in lh:
            place(pno, stereo(piano(m, 3.4, 0.9), -0.1), s)
        continue
    for e in range(8):
        te = s + e * E8
        vel = 0.62 if e % 2 == 0 else 0.42
        if e in (0, 4):
            vel = 0.72
        if s < 2.5:
            vel *= 0.8
        for k, m in enumerate(rh):
            place(pno, stereo(piano(m, E8 * 0.9, vel), -0.25 + 0.25 * k), te + 0.004 * k)
    for half in (0, 2):
        for m in lh:
            place(pno, stereo(piano(m, BEAT * 1.9, 0.7), -0.1), s + half * BEAT)
pno = lp(pno, 9000, 1)

# ── Warm pad from the solution slide on ──
pad = np.zeros((N, 2))
for s, rh, lh in BARS:
    if s < 2.5:
        continue
    d = BAR if s < 17.5 else DUR - s
    n = min(int((d + 0.3) * SR), N - int(s * SR))
    tt = np.arange(n) / SR
    seg = np.zeros((n, 2))
    for m in rh + [lh[1]]:
        for k, det in enumerate([-0.07, 0.07]):
            seg += stereo(saw(mtof(m) * 2 ** (det / 12), n), -0.5 if k == 0 else 0.5) * 0.12
    env = np.minimum(1, tt / 0.35) * np.clip((d + 0.3 - tt) / 0.3, 0, 1)
    if s >= 17.5:
        env = np.minimum(1, tt / 0.3) * np.exp(-tt / 3.2)
    place(pad, lp(seg * env[:, None], 1400, 2), s)

# ── Sub bass from the product demo on ──
bass = np.zeros(N)
for s, rh, lh in BARS:
    if s < 5.0:
        continue
    d = BAR if s < 17.5 else 3.2
    n = min(int(d * SR), N - int(s * SR))
    tt = np.arange(n) / SR
    f = mtof(lh[0] + (12 if lh[0] < 36 else 0))
    env = np.minimum(1, tt / 0.02) * (np.clip((d - tt) / 0.06, 0, 1) if s < 17.5 else np.exp(-tt / 1.2))
    place(bass, np.tanh(1.2 * (np.sin(2 * np.pi * f * tt) + 0.15 * np.sin(4 * np.pi * f * tt))) * env, s)
bass = stereo(lp(bass, 200, 2))

# ── Drums: soft kick on 1 and 3 from the demo; finger snaps on 2 and 4 for the numbers ──
drums = np.zeros((N, 2))


def kick():
    n = int(0.35 * SR); tt = np.arange(n) / SR
    f = 48 + 70 * np.exp(-tt / 0.03)
    return np.tanh(1.2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.16))


def snap():
    n = int(0.25 * SR); tt = np.arange(n) / SR
    return bp(rng.standard_normal(n), 1400, 3800, 2) * (np.exp(-tt / 0.018) + 0.3 * np.exp(-tt / 0.07))


K = kick()
b = 5.0
while b < 17.5:
    for q in (0, 2):
        place(drums, stereo(K * 0.9), b + q * BEAT)
    if b >= 12.5:
        for q in (1, 3):
            place(drums, stereo(snap() * 0.35, 0.18), b + q * BEAT)
    b += BAR
place(drums, stereo(K * 0.8), 17.5)
# soft shaker sixteenths for air under the demo and the numbers
shaker = np.zeros((N, 2))
sh_t = 5.0
i16 = 0
while sh_t < 17.5:
    n = int(0.09 * SR); tt = np.arange(n) / SR
    env = np.minimum(1, tt / 0.012) * np.exp(-tt / 0.03)
    lvl = (0.55 if i16 % 2 else 1.0) * (0.6 if sh_t < 12.5 else 1.0)
    place(shaker, stereo(bp(rng.standard_normal(n), 5000, 11000, 2) * env * lvl, 0.35), sh_t)
    sh_t += BEAT / 4
    i16 += 1

# ── Effects, pitched to the harmony ──
fx = np.zeros((N, 2))


def thud(t0, lvl):
    n = int(0.9 * SR); tt = np.arange(n) / SR
    f = mtof(29) + 30 * np.exp(-tt / 0.05)  # F1
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.28)
    y += lp(rng.standard_normal(n), 900, 1) * np.exp(-tt / 0.03) * 0.15
    place(fx, stereo(y * lvl), t0)


for c in CUTS:
    thud(c, 0.55)


def tick(t0, m, lvl=0.35, pan=0.1):
    y = fm(mtof(m), 0.12, 1.0, 0.7, 0.01, 0.025, 0.001) * lvl
    y += lp(rng.standard_normal(len(y)) * np.exp(-np.arange(len(y)) / SR / 0.0015), 3000, 1) * lvl * 0.4
    place(fx, stereo(y, pan), t0)


for k, tt_ in enumerate([0.35, 0.45, 0.55, 0.65, 0.8]):   # "code." typing (keys on the F chord)
    tick(tt_, [77, 81, 84, 81, 89][k], 0.3, -0.2 + 0.1 * k)
tick(T["clickExplain"], 86, 0.4)                          # D6 over Dm
tick(T["clickLines"], 86, 0.4)


def bells(t0, notes, step, lvl, pan=0.0):
    for k, m in enumerate(notes):
        place(fx, stereo(fm(mtof(m), 1.8, 3.5, 1.0, 0.15, 0.6) * lvl, pan + 0.1 * k), t0 + k * step)


bells(T["rowHi"], [74, 77], 0.1, 0.24)          # D F over Bb: the highlighted line
bells(T["bugHi"], [72, 69], 0.14, 0.28)         # C -> A over F: "uh-oh"
bells(T["fixHi"], [65, 69, 72, 77], 0.08, 0.22)  # F A C F: the fix
for tt_, m in [(T["s5"], 72), (T["n2"], 76), (T["n3"], 77), (T["n4"], 79), (T["s6"], 81)]:
    bells(tt_, [m], 0, 0.3)                      # metrics climb, resolve to A5 on the ask
bells(T["s6"] + 0.02, [84, 89], 0.16, 0.14)

# ── Mix ──
def reverb_ir(sec=2.8, pre=0.025):
    n = int(sec * SR); tt = np.arange(n) / SR
    ir = lp(rng.standard_normal((n, 2)) * np.exp(-tt / (sec / 6.5))[:, None], 4500, 1)
    ir = np.concatenate([np.zeros((int(pre * SR), 2)), ir])
    return ir / np.sqrt((ir ** 2).sum(axis=0))


IR = reverb_ir()
verb = lambda x: np.stack([fftconvolve(x[:, c], IR[:, c])[:N] for c in range(2)], axis=1)
stems = {"piano": pno * 0.5, "pad": pad * 0.22, "bass": bass * 0.34, "drums": drums * 0.42, "shaker": shaker * 0.05, "fx": fx * 0.3}
wet = verb(stems["piano"] * 0.35 + stems["pad"] * 0.3 + stems["fx"] * 0.6 + stems["drums"] * 0.12) * 0.5
mix = hp(sum(stems.values()) + wet, 28, 2)
mix *= (np.clip((DUR - t_all) / 1.6, 0, 1) ** 1.5 * np.clip(t_all / 0.01, 0, 1))[:, None]
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.2) / np.tanh(1.2)
mix *= 10 ** (-GAIN_DB / 20) if (GAIN_DB := float(os.environ.get("GAIN_DB", "3.3"))) else 1.0
for k, v in list(stems.items()) + [("reverb", wet)]:
    wavfile.write(os.path.join(HERE, "stems", f"{k}.wav"), SR, (np.clip(v / max(1e-9, np.abs(v).max()), -1, 1) * 32767 * 0.9).astype(np.int16))
wavfile.write(os.path.join(HERE, "soundtrack.wav"), SR, (mix * 32767).astype(np.int16))
print("ok", float(np.abs(mix).max()))
