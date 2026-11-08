/* CODE:CODE promo — deterministic frame engine.
   Every scene is a pure function of time: render(t) sets DOM state for time t (seconds). */
(function () {
  const TL = window.TL;
  const BEAT = 60 / TL.bpm, BAR = BEAT * 4, DROP = TL.drop;
  const SCENES = {};
  const E = window.E = {};

  // ---------- math / easing ----------
  E.clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
  E.lerp = (a, b, x) => a + (b - a) * x;
  E.ease = {
    lin: x => x,
    in: x => x * x * x,
    out: x => 1 - Math.pow(1 - x, 3),
    inOut: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
    outExpo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
    outBack: x => { const c = 1.70158, d = c + 1; return 1 + d * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
    outQuad: x => 1 - (1 - x) * (1 - x),
    inQuad: x => x * x,
  };
  // progress of t within [a,b], eased
  E.prog = (t, a, b, fn) => (fn || E.ease.lin)(E.clamp01((t - a) / (b - a)));
  // deterministic pseudo random in [0,1)
  E.prng = (i, salt = 0) => { let x = Math.sin(i * 127.1 + salt * 311.7 + 1.3) * 43758.5453; return x - Math.floor(x); };
  E.beat = t => (t - DROP) / BEAT;             // beats since drop (float)
  E.bar = t => (t - DROP) / BAR;
  E.BEAT = BEAT; E.BAR = BAR; E.DROP = DROP;
  E.barT = n => DROP + n * BAR;
  // decaying pulse on each beat; strong on downbeat
  E.punch = (t, k = 1) => {
    if (t < DROP) return 0;
    const b = E.beat(t), ph = b - Math.floor(b), idx = Math.floor(b) % 4;
    const amp = idx === 0 ? 1 : idx === 2 ? .55 : .3;
    return amp * Math.exp(-ph * BEAT / 0.11) * k;
  };

  // ---------- DOM ----------
  E.el = (tag, cls, html, parent) => {
    const d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    if (parent) parent.appendChild(d);
    return d;
  };
  E.esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  E.show = (node, on) => { node.style.display = on ? '' : 'none'; };
  E.op = (node, v) => { node.style.opacity = E.clamp01(v); };
  E.tf = (node, s) => { node.style.transform = s; };

  // ---------- typing ----------
  const typeCache = new Map();
  function typeWeights(str) {
    if (typeCache.has(str)) return typeCache.get(str);
    const w = new Float64Array(str.length); let sum = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i]; let v = 0.55 + 0.9 * E.prng(i, str.length);
      if (ch === '\n') v += 2.2; else if (',.;:!?'.includes(ch)) v += 0.9; else if (ch === ' ') v += 0.25;
      w[i] = v; sum += v;
    }
    const cum = new Float64Array(str.length); let c = 0;
    for (let i = 0; i < str.length; i++) { c += w[i]; cum[i] = c / sum; }
    typeCache.set(str, cum); return cum;
  }
  // number of chars of str visible at time t when typed over [a,b]
  E.typedCount = (str, t, a, b) => {
    if (t <= a) return 0; if (t >= b) return str.length;
    const p = (t - a) / (b - a), cum = typeWeights(str);
    let lo = 0, hi = str.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] <= p) lo = m + 1; else hi = m; }
    return lo;
  };
  E.typed = (str, t, a, b) => str.slice(0, E.typedCount(str, t, a, b));
  E.cursorOn = (t, typing) => typing || (Math.floor(t * 2.2) % 2 === 0);

  // ---------- syntax highlighting ----------
  const KW = {
    py: /^(def|class|import|from|async|await|return|if|else|elif|for|in|not|and|or|with|as|try|except|None|True|False|lambda|pass|raise)\b/,
    js: /^(const|let|var|function|return|import|export|from|default|async|await|if|else|for|of|new|class|extends|this|true|false|null|=>)\b/,
    html: /^(doctype|html|head|body|header|nav|main|section|footer|div|span|h1|h2|h3|p|a|ul|li|img|button|form|input|label|script|link|meta|title)\b/,
    sh: /^(npm|git|npx|cd|node|python|pip|run|build|push|deploy|install)\b/,
  };
  E.highlight = (code, lang) => {
    const toks = []; let i = 0; const n = code.length;
    const push = (t, c) => { if (t) toks.push({ t, c }); };
    while (i < n) {
      const rest = code.slice(i); let m;
      if (lang === 'html') {
        if ((m = rest.match(/^<!--[\s\S]*?-->/))) { push(m[0], 'cmt'); i += m[0].length; continue; }
        if ((m = rest.match(/^<\/?[a-zA-Z][\w-]*/))) { push(m[0], 'tag'); i += m[0].length; continue; }
        if ((m = rest.match(/^\/?>/))) { push(m[0], 'tag'); i += m[0].length; continue; }
        if ((m = rest.match(/^[a-zA-Z-]+(?==)/))) { push(m[0], 'attr'); i += m[0].length; continue; }
        if ((m = rest.match(/^"[^"\n]*"?/))) { push(m[0], 'str'); i += m[0].length; continue; }
        if ((m = rest.match(/^[^<"\n]+/))) { push(m[0], 'txt'); i += m[0].length; continue; }
        push(rest[0], 'punc'); i++; continue;
      }
      if (lang === 'css') {
        if ((m = rest.match(/^\/\*[\s\S]*?\*\//))) { push(m[0], 'cmt'); i += m[0].length; continue; }
        if ((m = rest.match(/^[.#]?[a-zA-Z][\w-]*(?=[^;{}\n]*\{)/))) { push(m[0], 'tag'); i += m[0].length; continue; }
        if ((m = rest.match(/^[a-z-]+(?=\s*:)/))) { push(m[0], 'attr'); i += m[0].length; continue; }
        if ((m = rest.match(/^#[0-9a-fA-F]{3,8}|^-?\d+(\.\d+)?(px|rem|em|%|s|vh|vw)?/))) { push(m[0], 'num'); i += m[0].length; continue; }
        if ((m = rest.match(/^[^{};:#\d\n/]+/))) { push(m[0], 'txt'); i += m[0].length; continue; }
        push(rest[0], 'punc'); i++; continue;
      }
      // py / js / sh
      if ((m = rest.match(lang === 'py' || lang === 'sh' ? /^#[^\n]*/ : /^\/\/[^\n]*/))) { push(m[0], 'cmt'); i += m[0].length; continue; }
      if ((m = rest.match(/^(f?"[^"\n]*"?|f?'[^'\n]*'?|`[^`]*`?)/))) { push(m[0], 'str'); i += m[0].length; continue; }
      if ((m = rest.match(/^\d+(\.\d+)?/))) { push(m[0], 'num'); i += m[0].length; continue; }
      if ((m = rest.match(/^@[\w.]+/))) { push(m[0], 'attr'); i += m[0].length; continue; }
      if ((m = rest.match(/^[A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё]*/))) {
        const w = m[0];
        if (KW[lang] && KW[lang].test(w)) push(w, 'kw');
        else if (rest.slice(w.length).match(/^\s*\(/)) push(w, 'fn');
        else push(w, 'txt');
        i += w.length; continue;
      }
      if ((m = rest.match(/^\s+/))) { push(m[0], 'ws'); i += m[0].length; continue; }
      push(rest[0], 'punc'); i++;
    }
    return toks;
  };
  // html for first n chars of token list
  E.tokHTML = (toks, n) => {
    let out = '', used = 0;
    for (const tk of toks) {
      if (used >= n) break;
      const take = Math.min(tk.t.length, n - used);
      out += `<i class="c-${tk.c}">${E.esc(tk.t.slice(0, take))}</i>`; used += take;
    }
    return out;
  };
  E.codeHTML = (code, lang, t, a, b, withCursor = true) => {
    const toks = E.hlCache(code, lang);
    const n = E.typedCount(code, t, a, b);
    const typing = t > a && t < b;
    return E.tokHTML(toks, n) + (withCursor && (typing || t < b + 1.2) && E.cursorOn(t, typing) ? '<i class="caret"></i>' : '');
  };
  const hlCache = new Map();
  E.hlCache = (code, lang) => { const k = lang + '\u0000' + code; if (!hlCache.has(k)) hlCache.set(k, E.highlight(code, lang)); return hlCache.get(k); };

  // ---------- particles / grain ----------
  E.makeGrain = () => {
    const frames = [];
    for (let k = 0; k < 8; k++) {
      const c = document.createElement('canvas'); c.width = 960; c.height = 540;
      const ctx = c.getContext('2d'); const img = ctx.createImageData(960, 540); const d = img.data;
      let seed = 1234 + k * 999;
      for (let p = 0; p < d.length; p += 4) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff; const v = 110 + (seed % 90);
        d[p] = d[p + 1] = d[p + 2] = v; d[p + 3] = 255;
      }
      ctx.putImageData(img, 0, 0); frames.push(c.toDataURL('image/png'));
    }
    return frames;
  };

  // ---------- scene registry & master render ----------
  window.registerScene = (id, def) => { SCENES[id] = def; };
  let built = false, grainFrames, stage, grainEl, vignEl, flashEl, camEl, letterEl;
  function build() {
    stage = document.getElementById('stage');
    camEl = E.el('div', 'cam', '', stage);
    for (const sc of TL.scenes) {
      const def = SCENES[sc.id]; if (!def) { console.warn('missing scene', sc.id); continue; }
      const root = E.el('section', 'scene scene-' + sc.id, '', camEl); root.id = 'sc-' + sc.id;
      def.root = root; def.meta = sc; def.build(root, sc);
      root.style.display = 'none';
    }
    vignEl = E.el('div', 'vignette', '', stage);
    grainEl = E.el('div', 'grain', '', stage);
    flashEl = E.el('div', 'flash', '', stage);
    grainFrames = E.makeGrain();
    built = true;
  }
  window.render = function (t) {
    if (!built) build();
    const frame = Math.round(t * TL.fps);
    // scenes
    for (const sc of TL.scenes) {
      const def = SCENES[sc.id]; if (!def) continue;
      const hold = def.holdAfter || 0; // allow scene to linger for crossfade
      const on = t >= sc.start && t < sc.end + hold;
      def.root.style.display = on ? 'block' : 'none';
      if (on) def.render(t - sc.start, t, sc.end - sc.start, sc);
    }
    // beat punch zoom (montage only)
    let scale = 1;
    if (t >= DROP && t < E.barT(22)) scale += 0.028 * E.punch(t);
    camEl.style.transform = scale === 1 ? '' : `scale(${scale.toFixed(4)})`;
    // cut flash on montage scene boundaries
    let flash = 0;
    for (const sc of TL.scenes) {
      if (sc.start >= DROP - 0.01 && sc.start <= E.barT(20) + 0.01 && t >= sc.start) flash = Math.max(flash, (sc.id === 'title' ? 1 : 0.32) * Math.exp(-(t - sc.start) / (sc.id === 'title' ? 0.22 : 0.055)));
    }
    if (t >= DROP - 0.1 && t < DROP) flash = Math.max(flash, E.prog(t, DROP - 0.1, DROP, E.ease.in) * 0.9);
    flashEl.style.opacity = flash.toFixed(3);
    flashEl.style.background = t < DROP + 0.1 ? '#fff4df' : '#ffffff';
    // grain
    grainEl.style.backgroundImage = `url(${grainFrames[frame % grainFrames.length]})`;
    grainEl.style.opacity = t < DROP ? 0.16 : 0.10;
    // global fade in/out
    const fade = Math.min(E.prog(t, 0, 1.4, E.ease.out), 1 - E.prog(t, TL.duration - 1.2, TL.duration, E.ease.in));
    stage.style.filter = fade < 1 ? `brightness(${fade.toFixed(3)})` : '';
    return frame;
  };
  window.sceneList = () => Object.keys(SCENES);
})();
