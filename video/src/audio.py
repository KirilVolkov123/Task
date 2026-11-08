#!/usr/bin/env python3
"""Soundtrack for the CODE:CODE promo — fully synthesized with numpy/scipy.
Piano intro → 128 BPM cinematic-electronic drop → breakdown → build → climax → piano outro,
plus SFX (typing, whooshes, pops, dings, impact) and the Russian voiceover ducked in.
Usage: python3 audio.py [out_dir]   → music.wav, vo.wav, mix.wav (44.1 kHz stereo)"""
import json, os, sys, wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'out', 'audio')
os.makedirs(OUT, exist_ok=True)
TL = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
SR = 44100
DUR = TL['duration']; N = int(DUR * SR)
BPM = TL['bpm']; BEAT = 60 / BPM; BAR = 4 * BEAT; DROP = TL['drop']
bar = lambda n: DROP + n * BAR
rng = np.random.default_rng(7)
f_of = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# ---------------- primitives ----------------
def t_axis(n): return np.arange(n) / SR
def env_exp(n, tau): return np.exp(-t_axis(n) / tau)
def adsr(n, a, d, s, r):
    t = t_axis(n); e = np.ones(n)
    ai = int(a * SR); di = int(d * SR); ri = int(r * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if di: e[ai:ai + di] = np.linspace(1, s, min(di, max(0, n - ai)))[:max(0, min(di, n - ai))]
    e[ai + di:] = s
    if ri and ri < n: e[-ri:] *= np.linspace(1, 0, ri)
    return e
def lp(x, fc, order=2):
    b, a = butter(order, min(fc, SR / 2 - 100) / (SR / 2)); return lfilter(b, a, x)
def hp(x, fc, order=2):
    b, a = butter(order, max(fc, 20) / (SR / 2), btype='high'); return lfilter(b, a, x)
def bp(x, lo, hi, order=2):
    b, a = butter(order, [max(lo, 20) / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], btype='band'); return lfilter(b, a, x)
def saw(f, n, phase=0.0):
    t = t_axis(n); return 2 * ((t * f + phase) % 1) - 1
def sine(f, n): return np.sin(2 * np.pi * f * t_axis(n))
def supersaw(f, n, voices=7, detune=0.011):
    out = np.zeros(n)
    for v in range(voices):
        d = (v - (voices - 1) / 2) / ((voices - 1) / 2) * detune
        out += saw(f * (1 + d), n, rng.random())
    return out / voices
def make_ir(decay=1.8, tone=5000):
    n = int(decay * 2.5 * SR); t = t_axis(n)
    irL = rng.standard_normal(n) * np.exp(-t / decay * 3); irR = rng.standard_normal(n) * np.exp(-t / decay * 3)
    irL = lp(irL, tone); irR = lp(irR, tone); irL[:int(0.01 * SR)] *= 0.3; irR[:int(0.01 * SR)] *= 0.3
    g = 1 / (np.sqrt(np.sum(irL ** 2)) + 1e-9) * 0.35
    return irL * g, irR * g
def reverb(bus, ir):
    irL, irR = ir
    L = fftconvolve(bus[:, 0], irL)[:len(bus)]; R = fftconvolve(bus[:, 1], irR)[:len(bus)]
    return np.stack([L, R], 1)
def stereo_delay(bus, time, fb=0.35, wet=0.3):
    out = bus.copy(); d = int(time * SR); buf = bus.copy()
    for k in range(1, 6):
        g = wet * fb ** (k - 1); sh = np.zeros_like(bus); sh[d * k:] = buf[:len(bus) - d * k] * g
        if k % 2: sh = sh[:, ::-1]
        out += sh
    return out

class Bus:
    def __init__(self): self.buf = np.zeros((N, 2))
    def add(self, sig, t, gain=1.0, pan=0.0):
        i = int(round(t * SR))
        if i >= N: return
        if sig.ndim == 1:
            th = (pan + 1) * np.pi / 4; sig = np.stack([sig * np.cos(th), sig * np.sin(th)], 1)
        n = min(len(sig), N - i)
        self.buf[i:i + n] += sig[:n] * gain

# ---------------- instruments ----------------
def piano(midi, dur, vel=0.5):
    f = f_of(midi); n = int((dur + 2.5) * SR); t = t_axis(n); out = np.zeros(n)
    for k in range(1, 9):
        amp = (1 / k ** 1.15) * (1.0 if k < 5 else 0.6); inh = 1 + 0.0004 * k * k
        tau = (2.6 if midi < 60 else 1.8) / k ** 0.65
        out += amp * np.sin(2 * np.pi * f * k * inh * t + rng.random() * 6.28) * np.exp(-t / tau)
        out += 0.5 * amp * np.sin(2 * np.pi * f * k * inh * 1.0015 * t) * np.exp(-t / (tau * 0.8))
    hammer = hp(rng.standard_normal(n), 1500) * np.exp(-t / 0.012) * 0.6
    out = (out + hammer) * (1 - np.exp(-t / 0.004))
    # release: dampen after note duration
    rel = np.ones(n); ri = int(dur * SR); rel[ri:] = np.exp(-(t[ri:] - t[ri]) / 0.35)
    out = lp(out * rel, 6500 if midi > 60 else 4500)
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def pad(midis, dur, cutoff=1400, vel=0.3, a=0.6, r=1.2):
    n = int((dur + r) * SR); out = np.zeros(n)
    for m in midis: out += supersaw(f_of(m), n, 5, 0.008)
    out = lp(out, cutoff) * adsr(n, a, 0.2, 0.9, r)
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def pluck(midi, dur=0.25, vel=0.4, bright=1.0):
    n = int(0.45 * SR); t = t_axis(n); raw = saw(f_of(midi), n) + 0.4 * saw(f_of(midi) * 2.003, n)
    lo = lp(raw, 700 * bright); hi = lp(raw, 4500 * bright); mixk = np.exp(-t / 0.08)
    out = (lo * (1 - mixk) + hi * mixk) * np.exp(-t / 0.17) * (1 - np.exp(-t / 0.002))
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def bass(midi, dur=0.22, vel=0.6):
    n = int((dur + 0.08) * SR); t = t_axis(n); f = f_of(midi)
    out = lp(saw(f, n), 420) * 0.8 + sine(f, n) * 0.6 + sine(f / 2, n) * 0.25
    out *= adsr(n, 0.004, 0.08, 0.7, 0.06)
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def kick(vel=1.0):
    n = int(0.5 * SR); t = t_axis(n); f = 46 + 130 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR; body = np.sin(ph) * np.exp(-t / 0.22)
    click = hp(rng.standard_normal(n), 3000) * np.exp(-t / 0.004) * 0.5
    out = np.tanh((body + click) * 1.8)
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def clap(vel=0.6):
    n = int(0.45 * SR); t = t_axis(n); noise = rng.standard_normal(n); env = np.zeros(n)
    for k in range(3): env += np.exp(-np.clip(t - 0.011 * k, 0, None) / 0.012) * (t >= 0.011 * k)
    env += np.exp(-np.clip(t - 0.033, 0, None) / 0.11) * (t >= 0.033) * 0.9
    out = bp(noise * env, 900, 5000)
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def hat(vel=0.3, open_=False):
    n = int((0.35 if open_ else 0.08) * SR); t = t_axis(n)
    out = hp(rng.standard_normal(n), 7500) * np.exp(-t / (0.12 if open_ else 0.022))
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def snare(vel=0.6):
    n = int(0.3 * SR); t = t_axis(n)
    out = bp(rng.standard_normal(n), 1200, 7000) * np.exp(-t / 0.07) + sine(185, n) * np.exp(-t / 0.05) * 0.7
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def noise_sweep(dur, f0, f1, env_pow=2.0, vel=0.5, rev=False):
    n = int(dur * SR); noise = rng.standard_normal(n); out = np.zeros(n); blk = int(0.03 * SR)
    for i in range(0, n, blk):
        p = i / n; fc = f0 * (f1 / f0) ** p
        seg = noise[max(0, i - blk):i + blk]; filt = bp(seg, fc * 0.5, fc * 2)
        out[i:i + blk] = filt[-min(blk, n - i):] if i else filt[:blk]
    t = t_axis(n); e = (t / dur) ** env_pow
    if rev: e = e[::-1]
    out = out * e
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def riser(dur, vel=0.5):
    n = int(dur * SR); t = t_axis(n)
    out = noise_sweep(dur, 300, 6000, 2.2, 1.0)
    f = 110 * 2 ** (t / dur * 2.5); ph = 2 * np.pi * np.cumsum(f) / SR
    out += np.sin(ph) * (t / dur) ** 3 * 0.5
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def impact(vel=1.0):
    n = int(3.0 * SR); t = t_axis(n); f = 28 + 70 * np.exp(-t / 0.12)
    ph = 2 * np.pi * np.cumsum(f) / SR; sub = np.sin(ph) * np.exp(-t / 0.9)
    boom = lp(rng.standard_normal(n), 400) * np.exp(-t / 0.25) * 1.2
    out = np.tanh((sub * 1.4 + boom) * 1.3)
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def crash(vel=0.5, dur=2.8):
    n = int(dur * SR); t = t_axis(n); out = hp(rng.standard_normal(n), 4500) * np.exp(-t / (dur / 3.2))
    return out / (np.max(np.abs(out)) + 1e-9) * vel
# ---- SFX ----
def click_sfx(vel=0.25):
    n = int(0.035 * SR); t = t_axis(n); fc = 1800 + rng.random() * 2500
    out = bp(rng.standard_normal(n), fc * 0.6, fc * 1.8) * np.exp(-t / 0.004) + sine(fc, n) * np.exp(-t / 0.003) * 0.4
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def whoosh_sfx(vel=0.4):
    n = int(0.42 * SR); t = t_axis(n); out = noise_sweep(0.42, 400, 3500, 1.0, 1.0)
    e = np.sin(np.pi * np.clip(t / 0.42, 0, 1)) ** 1.5; out = out * e
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def pop_sfx(vel=0.45):
    n = int(0.12 * SR); t = t_axis(n); f = 520 + 500 * np.exp(-t / 0.02); ph = 2 * np.pi * np.cumsum(f) / SR
    out = np.sin(ph) * np.exp(-t / 0.035) + hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.003) * 0.4
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def ding_sfx(vel=0.4):
    n = int(1.2 * SR); t = t_axis(n)
    out = sine(1318.5, n) * np.exp(-t / 0.35) + sine(2637, n) * np.exp(-t / 0.18) * 0.5 + sine(1975, n) * np.exp(-t / 0.25) * 0.3
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def lid_sfx(vel=0.35):
    n = int(1.4 * SR); t = t_axis(n); creak = bp(rng.standard_normal(n), 600, 2200) * (0.2 + 0.8 * np.abs(np.sin(2 * np.pi * 9 * t))) * np.exp(-t / 0.5) * 0.4
    thump = lp(rng.standard_normal(n), 250) * np.exp(-np.clip(t - 1.25, 0, None) / 0.04) * (t > 1.25)
    out = creak + thump
    return out / (np.max(np.abs(out)) + 1e-9) * vel
def boot_sfx(vel=0.35):
    n = int(1.4 * SR); t = t_axis(n); out = np.zeros(n)
    for k, m in enumerate([72, 76, 79, 84]):
        s = int(k * 0.11 * SR); seg = sine(f_of(m), n - s) * np.exp(-t_axis(n - s) / 0.45); out[s:] += seg * 0.6
    return lp(out, 6000) / (np.max(np.abs(out)) + 1e-9) * vel

# ---------------- arrangement ----------------
music = Bus(); drums = Bus(); sfx = Bus(); pianoB = Bus()
# Chord vocabulary (F major / D minor)
CH = {'F': [53, 57, 60, 65], 'C/E': [52, 55, 60, 64], 'Dm': [50, 53, 57, 62], 'Bb': [46, 50, 53, 58], 'C': [48, 52, 55, 60]}
ROOT = {'Dm': 38, 'Bb': 34, 'F': 41, 'C': 36}

# -- Part A: piano (0–14 s), chord every 3.5 s, gentle 8th-note arpeggio
piano_chords = [('F', 0.0), ('C/E', 3.5), ('Dm', 7.0), ('Bb', 10.5)]
E8 = 0.4375
pattern = [0, 1, 2, 3, 2, 1, 2, 1]
for name, t0 in piano_chords:
    notes = CH[name]
    for k, idx in enumerate(pattern):
        t = t0 + k * E8; vel = 0.34 if k == 0 else 0.2 + 0.05 * rng.random()
        pianoB.add(piano(notes[idx], E8 * 1.6, vel), t, pan=(idx - 1.5) * 0.25)
    pianoB.add(piano(notes[0] - 12, 3.5, 0.3), t0, pan=-0.2)  # bass note
melody = [(69, 0.0, 1.6), (72, 1.75, 1.6), (67, 3.5, 1.6), (64, 5.25, 1.6), (65, 7.0, 1.6), (69, 8.75, 1.6), (74, 10.5, 1.6), (72, 12.25, 1.6)]
for m, t, d in melody: pianoB.add(piano(m, d, 0.42), t, pan=0.15)
for name, t0 in piano_chords[1:]: music.add(pad([m - 12 for m in CH[name][:3]], 3.5, 900, 0.10, 1.0, 1.5), t0)
# transition into the drop
music.add(riser(2.0, 0.45), 12.0); music.add(crash(0.45, 1.5)[::-1], 12.5)
for k in range(8): drums.add(snare(0.25 + 0.05 * k), 13.0 + k * 0.125)
drums.add(impact(0.7), DROP); drums.add(crash(0.6), DROP)

# -- Part B: 128 BPM drop (bars 0–16), breakdown (16–18), build (18–20), climax (20–22), outro
PROG = ['Dm', 'Bb', 'F', 'C']
def drum_bar(b, hats=True, claps=True, kicks=True, hat_vel=0.34):
    t0 = bar(b)
    for q in range(4):
        if kicks: drums.add(kick(0.72), t0 + q * BEAT)
        if claps and q in (1, 3): drums.add(clap(0.62), t0 + q * BEAT)
        if hats:
            drums.add(hat(hat_vel * 0.7), t0 + q * BEAT, pan=0.25)
            drums.add(hat(hat_vel if q != 3 else 0.0, open_=False), t0 + (q + 0.5) * BEAT, pan=0.25)
    if hats: drums.add(hat(hat_vel * 1.1, open_=True), t0 + 3.5 * BEAT, pan=0.25)
def bass_bar(b, root, vel=0.36):
    t0 = bar(b); pat = [0, 0, 12, 0, 0, 12, 0, 7]
    for k, off in enumerate(pat): music.add(bass(root + off, 0.2, vel * (1 if k % 2 == 0 else 0.8)), t0 + k * BEAT / 2)
def arp_bar(b, notes, vel=0.28, bright=1.0):
    t0 = bar(b); up = [n + 12 for n in notes]; pat = [0, 1, 2, 3, 2, 1, 0, 2, 1, 2, 3, 2, 1, 0, 1, 2]
    for k, idx in enumerate(pat): music.add(pluck(up[idx], 0.2, vel * (1.0 if k % 4 == 0 else 0.75), bright), t0 + k * BEAT / 4, pan=((k % 4) - 1.5) * 0.3)
def chord_bar(b, notes, vel=0.26, cutoff=1600, bars=1):
    music.add(pad(notes, BAR * bars - 0.05, cutoff, vel, 0.05, 0.4), bar(b))

for b in range(0, 16):
    name = PROG[b % 4]
    drum_bar(b, hats=True, claps=True, kicks=True)
    bass_bar(b, ROOT[name])
    chord_bar(b, CH[name][:3], 0.32, 1700 + 700 * (b >= 8))
    arp_bar(b, CH[name], 0.36 if b < 8 else 0.42, 1.1 if b < 8 else 1.35)
    if b % 4 == 3: drums.add(crash(0.25, 1.8), bar(b + 1))
# fill at the end of bar 15
for k in range(4): drums.add(snare(0.4 + 0.1 * k), bar(15) + 3 * BEAT + k * BEAT / 4)
# breakdown (bars 16–18): pad + piano motif, no drums
for b in range(16, 18):
    name = ['Dm', 'Bb'][b - 16]; chord_bar(b, [m - 12 for m in CH[name][:3]], 0.16, 900)
    for k, idx in enumerate([0, 2, 3, 2]): pianoB.add(piano(CH[name][idx], 0.9, 0.36), bar(b) + k * BEAT, pan=(idx - 1.5) * 0.2)
pianoB.add(piano(74, 1.5, 0.45), bar(16) + 2 * BEAT); pianoB.add(piano(72, 1.5, 0.45), bar(17) + 2 * BEAT)
# build (bars 18–20)
music.add(riser(2 * BAR, 0.6), bar(18)); music.add(crash(0.5, 1.6)[::-1], bar(20) - 1.6)
for b in (18, 19):
    name = ['F', 'C'][b - 18]; chord_bar(b, CH[name][:3], 0.28, 1800 + 1200 * (b - 18)); bass_bar(b, ROOT[name], 0.5)
    for q in range(4): drums.add(kick(0.7), bar(b) + q * BEAT)
# snare roll: 8ths → 16ths → 32nds
roll = [bar(18) + k * BEAT / 2 for k in range(8)] + [bar(19) + k * BEAT / 4 for k in range(12)] + [bar(19) + 3 * BEAT + k * BEAT / 8 for k in range(8)]
for i, t in enumerate(roll): drums.add(snare(0.25 + 0.5 * i / len(roll)), t)
# climax (bars 20–22): F major, everything
drums.add(impact(0.85), bar(20)); drums.add(crash(0.7), bar(20))
chord_bar(20, [53, 57, 60, 65, 69], 0.34, 3200, 2)
music.add(pad([41, 48, 53], 2 * BAR, 500, 0.18, 0.02, 1.0), bar(20))
for b in (20, 21):
    drum_bar(b, hats=True, claps=True, kicks=True, hat_vel=0.38); bass_bar(b, 41, 0.4); arp_bar(b, [53, 57, 60, 65], 0.44, 1.5)
# outro (bar 22 → end): piano resolution + pad tail
T_OUT = bar(22)
drums.add(crash(0.4), T_OUT)
for k, m in enumerate([41, 53, 57, 60, 65, 69]): pianoB.add(piano(m, 4.0, 0.42), T_OUT + k * 0.07, pan=(k - 2.5) * 0.15)
pianoB.add(piano(77, 3.5, 0.4), T_OUT + 1.0); pianoB.add(piano(72, 3.5, 0.36), T_OUT + 1.9); pianoB.add(piano(69, 3.0, 0.3), T_OUT + 2.6)
music.add(pad([41, 48, 53, 57], 4.0, 700, 0.18, 1.2, 1.0), T_OUT)

# -- SFX from the timeline
S = TL['sfx']
for a, b_, cnt in S['typing']:
    times = np.sort(a + rng.random(cnt) * (b_ - a))
    for t in times: sfx.add(click_sfx(0.22 + 0.1 * rng.random()), t, pan=(rng.random() - 0.5) * 0.4)
for t in S['whoosh']: sfx.add(whoosh_sfx(0.35), t - 0.25)
for t in S['pop']: sfx.add(pop_sfx(0.4), t)
for t in S['ding']: sfx.add(ding_sfx(0.3), t)
sfx.add(lid_sfx(0.3), S['lid_open']); sfx.add(boot_sfx(0.3), S['boot'])

# ---------------- sidechain pump during the beat sections ----------------
t_all = np.arange(N) / SR
pump = np.ones(N)
for b in list(range(0, 16)) + [18, 19, 20, 21]:
    t0 = bar(b)
    for q in range(4):
        i0 = int((t0 + q * BEAT) * SR); i1 = min(N, i0 + int(BEAT * SR)); seg = t_all[i0:i1] - (t0 + q * BEAT)
        pump[i0:i1] = 1 - 0.55 * np.exp(-seg / 0.09) * (1 - np.exp(-seg / 0.004))
music.buf *= pump[:, None]

# ---------------- buses, reverbs ----------------
ir_hall = make_ir(2.6, 4000); ir_room = make_ir(0.9, 6000)
pianoB.buf = pianoB.buf * 0.6 + reverb(pianoB.buf, ir_hall) * 0.7
music.buf = music.buf + reverb(music.buf, ir_room) * 0.25
drums.buf = drums.buf + reverb(drums.buf, ir_room) * 0.12
sfx.buf = sfx.buf + reverb(sfx.buf, ir_room) * 0.15
MUSIC = pianoB.buf * 0.95 + music.buf * 0.8 + drums.buf * 0.9 + sfx.buf * 0.9
# gentle fade at the very end
fade = np.ones(N); fi = int(1.6 * SR); fade[-fi:] = np.linspace(1, 0, fi) ** 1.5
MUSIC *= fade[:, None]

# ---------------- voiceover ----------------
def read_wav(path):
    w = wave.open(path, 'rb'); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    if w.getnchannels() == 2: x = x.reshape(-1, 2).mean(1)
    if sr != SR:
        n2 = int(len(x) * SR / sr); x = np.interp(np.linspace(0, len(x) - 1, n2), np.arange(len(x)), x)
    return x
VO = np.zeros(N)
for v in TL['voiceover']:
    x = read_wav(os.path.join(HERE, '..', 'assets', 'vo', v['file']))
    x = hp(x, 80); x = x / (np.max(np.abs(x)) + 1e-9) * 0.95
    # tiny room so the voice sits in the picture
    i = int(v['start'] * SR); n = min(len(x), N - i); VO[i:i + n] += x[:n]
VO_st = np.stack([VO, VO], 1); VO_st = VO_st + reverb(VO_st, make_ir(0.6, 5000)) * 0.08
# duck music under the voice
env = np.abs(VO); k = int(0.25 * SR); kern = np.ones(k) / k
env = np.convolve(env, kern, mode='same'); env = env / (env.max() + 1e-9)
# attack/release smoothing
sm = np.zeros(N); a_c = np.exp(-1 / (0.02 * SR)); r_c = np.exp(-1 / (0.5 * SR)); cur = 0.0
for i in range(0, N, 64):
    tgt = env[i:i + 64].max(); c = a_c if tgt > cur else r_c; cur = c * cur + (1 - c) * tgt; sm[i:i + 64] = cur
duck = 1 - 0.74 * np.clip(sm * 1.8, 0, 1)
MIX = MUSIC * duck[:, None] * 0.75 + VO_st * 1.45
# report voice-over vs music bed during speech
for v in TL['voiceover']:
    i0 = int(v['start'] * SR); i1 = min(N, i0 + int(2.5 * SR))
    m = np.sqrt(np.mean((MUSIC[i0:i1] * duck[i0:i1, None] * 0.75) ** 2)); s = np.sqrt(np.mean((VO_st[i0:i1] * 1.45) ** 2))
    print(f"VO {v['start']:5.1f}s: voice {20*np.log10(s+1e-9):6.1f} dB  music bed {20*np.log10(m+1e-9):6.1f} dB  margin {20*np.log10(s/(m+1e-9)):5.1f} dB")

def write(path, buf, peak=0.95):
    buf = np.tanh(buf * 1.1) / np.tanh(1.1)                 # soft limiter
    buf = buf / (np.max(np.abs(buf)) + 1e-9) * peak
    pcm = (np.clip(buf, -1, 1) * 32767).astype(np.int16)
    w = wave.open(path, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
    print('wrote', path, f'{len(buf) / SR:.2f}s peak-norm {peak}')
write(os.path.join(OUT, 'music.wav'), MUSIC)
write(os.path.join(OUT, 'vo.wav'), VO_st, 0.9)
write(os.path.join(OUT, 'mix.wav'), MIX)
