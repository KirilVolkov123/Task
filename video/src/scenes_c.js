/* Part B (2/2) + finale — teamwork, deploy, humor, newcomers, convergence, title, slogan */
(function () {
  const { el, prog, ease, lerp, prng, op, tf, typed, cursorOn, codeHTML, esc, label, bgNavy, avatar, NAMES, COLORS } = E;

  /* ---------------- TEAMWORK ---------------- */
  const SCHED_JS = `// Автоматическое распределение служителей
export function распределить(служители, недели) {
  const график = [];
  for (const неделя of недели) {
    for (const роль of неделя.роли) {
      const свободные = служители.filter(с =>
        с.дары.includes(роль) && !с.занят(неделя.дата));
      график.push({ неделя, роль, кто: выбрать(свободные) });
    }
  }
  return график;
}

export function выбрать(список) {
  // кто дольше всех не служил — тот и служит
  return список.sort((a, b) => a.последний - b.последний)[0];
}`;
  const COMMITS = [[0, 'feat: расписание служений'], [1, 'fix: форма записи работает на телефоне'], [6, 'docs: инструкция для новичков'], [3, 'feat: напоминание о репетиции хора (наконец-то)'], [2, 'chore: удалил 47 лишних console.log'], [5, 'fix: кнопка «Записаться» теперь действительно записывает']];
  registerScene('teamwork', {
    build(root) {
      bgNavy(root, 'rgba(88,166,255,.3)'); label(root, '05', 'Команда · вместе');
      root.insertAdjacentHTML('beforeend', `
      <div class="win dark" style="left:110px;top:150px;width:1180px;height:830px">
        <div class="winbar"><span class="dot"></span><span class="dot y"></span><span class="dot g"></span><span class="ttl">расписание.js</span>
          <div style="margin-left:auto;display:flex;align-items:center;gap:8px"><div style="display:flex">${[0, 1, 6, 3].map((i, k) => `<span class="avatar" style="width:28px;height:28px;font-size:12px;background:${COLORS[i]};margin-left:${k ? -8 : 0}px;border:2px solid #0d1117">${NAMES[i][0]}</span>`).join('')}</div><span style="font-size:14px;color:#3fb950">● 4 онлайн</span></div></div>
        <div class="code" style="padding:22px 26px;font-size:19px;line-height:1.5;position:relative;height:calc(100% - 46px)"><div class="lnum" style="font-size:19px"></div><pre class="src" style="padding-left:50px"></pre>
          <div class="curs abs" style="inset:0;pointer-events:none"></div></div>
      </div>
      <div class="win dark" style="left:1330px;top:150px;width:480px;height:830px;padding:30px 28px">
        <div style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);font-weight:700">Активность</div>
        <div class="feed" style="margin-top:18px;display:flex;flex-direction:column;gap:12px"></div>
      </div>`);
      root.querySelector('.lnum').innerHTML = Array.from({ length: 18 }, (_, i) => i + 1).join('<br>');
      this.src = root.querySelector('.src');
      const curs = root.querySelector('.curs'); this.curs = [0, 1, 6, 3].map(i => { const c = el('div', 'abs', `<span style="display:block;width:2px;height:28px;background:${COLORS[i]}"></span><span style="position:absolute;left:0;top:-22px;background:${COLORS[i]};color:#fff;font-size:12px;font-weight:700;padding:2px 7px;border-radius:5px 5px 5px 0;white-space:nowrap">${NAMES[i]}</span>`, curs); c.style.opacity = 0; return c; });
      const feed = root.querySelector('.feed'); this.items = COMMITS.map(c => { const d = el('div', '', `<div style="display:flex;gap:12px;align-items:flex-start">${avatar(c[0], 34)}<div><div style="font-size:16px;line-height:1.3"><b style="color:#e6edf3">${NAMES[c[0]]}</b> <span style="color:var(--muted)">закоммитил(а)</span></div><div class="mono" style="font-size:15px;color:#a5d6ff;margin-top:5px;line-height:1.35">${c[1]}</div></div></div>`, feed); d.style.cssText = 'background:#0d1117;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:12px 14px;opacity:0'; return d; });
    },
    render(lt, t) {
      this.src.innerHTML = codeHTML(SCHED_JS, 'js', t, E.barT(10) + 0.25, E.barT(10) + 3.45, false);
      const lines = [1, 5, 9, 13];
      this.curs.forEach((c, i) => { const b = Math.floor(lt / 0.47); const ln = lines[i] + (Math.floor(prng(b, i) * 3) - 1), col = 60 + prng(b, i + 9) * 520; const on = prog(lt, 0.15 + i * 0.12, 0.4 + i * 0.12); c.style.opacity = on; c.style.transform = `translate(${col}px,${22 + ln * 28.5}px)`; });
      this.items.forEach((d, i) => { const p = prog(lt, 0.3 + i * 0.47, 0.65 + i * 0.47, ease.outBack); d.style.opacity = p; d.style.transform = `translateX(${(1 - p) * 60}px)`; });
    }
  });

  /* ---------------- DEPLOY ---------------- */
  registerScene('deploy', {
    build(root) {
      bgNavy(root, 'rgba(63,185,80,.25)'); label(root, '06', 'Запуск');
      root.insertAdjacentHTML('beforeend', `
      <div class="win dark" style="left:110px;top:170px;width:1120px;height:790px">
        <div class="winbar"><span class="dot"></span><span class="dot y"></span><span class="dot g"></span><span class="ttl">терминал — церковь-сайт</span></div>
        <div class="term lines"></div>
      </div>
      <div class="win dark stat" style="left:1290px;top:170px;width:520px;height:380px;padding:34px 36px;border-radius:18px">
        <div style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);font-weight:700">Открыли сайт сегодня</div>
        <div class="vis mono" style="font-size:120px;font-weight:700;letter-spacing:-.04em;line-height:1;margin-top:14px">0</div>
        <div class="mono" style="color:#3fb950;font-size:17px;margin-top:10px">▲ люди уже заходят</div>
      </div>
      <div class="phone dph" style="left:1340px;top:590px;width:420px;height:420px;border-radius:48px;opacity:0"><div class="notch"></div><div class="scr" style="background:linear-gradient(180deg,#1c2b3a,#0e1621)">
        <div class="ntf" style="position:absolute;left:14px;right:14px;top:70px;background:rgba(255,255,255,.96);color:#111;border-radius:20px;padding:14px 16px;box-shadow:0 20px 50px rgba(0,0,0,.4);opacity:0">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#555"><span style="width:18px;height:18px;border-radius:5px;background:#2ea6ff;display:inline-block"></span>Telegram · сейчас</div>
          <div style="font-weight:800;font-size:17px;margin-top:6px">Церковь «Вифания»</div>
          <div style="font-size:16px;line-height:1.3;margin-top:2px">🎉 Наш сайт запущен! Расписание, запись на встречи и новости — теперь в одном месте.</div>
        </div>
        <div class="mono" style="position:absolute;left:0;right:0;top:250px;text-align:center;color:#fff;font-size:64px;font-weight:300">10:24</div>
      </div></div>
      <div class="check abs" style="left:50%;top:50%;width:260px;height:260px;margin:-130px 0 0 -130px;border-radius:50%;background:#3fb950;color:#04120a;display:flex;align-items:center;justify-content:center;font-size:150px;font-weight:900;opacity:0;box-shadow:0 0 120px rgba(63,185,80,.6)">✓</div>`);
      this.lines = root.querySelector('.lines'); this.vis = root.querySelector('.vis'); this.ph = root.querySelector('.dph'); this.ntf = root.querySelector('.ntf'); this.check = root.querySelector('.check');
    },
    render(lt, t) {
      const L = [];
      const cmd1 = '$ npm run build';
      L.push(`<span class="p">${esc(typed(cmd1, lt, 0.1, 0.8))}</span>${lt < 0.85 && cursorOn(t, lt > .1) ? '<i class="caret"></i>' : ''}`);
      if (lt > 0.95) L.push(`<span class="dim">▸ Собираю 14 страниц, расписание и форму записи…</span>`);
      if (lt > 1.1) { const p = prog(lt, 1.1, 2.0, ease.inOut); const n = Math.round(p * 40); L.push(`<span class="dim">[</span><span style="color:#58a6ff">${'█'.repeat(n)}</span><span class="dim">${'░'.repeat(40 - n)}] ${Math.round(p * 100)}%</span>`); }
      if (lt > 2.05) L.push(`<span class="ok">✔ Готово за 1.2 с</span>`);
      if (lt > 2.2) L.push(`<span class="p">${esc(typed('$ git push origin main', lt, 2.2, 2.6))}</span>`);
      if (lt > 2.65) L.push(`<span class="dim">→ main  a3f9c1e..7b2d4f0</span>`);
      if (lt > 2.7) L.push(`<span class="ok" style="font-weight:700">✔ Опубликовано · сайт в сети</span>`);
      this.lines.innerHTML = L.join('<br>');
      const n = Math.round(lerp(0, 312, prog(lt, 2.7, 3.7, ease.out))); this.vis.textContent = n;
      const ph = prog(lt, 2.75, 3.2, ease.outBack); op(this.ph, prog(lt, 2.75, 2.95)); tf(this.ph, `translateY(${(1 - ph) * 80}px)`);
      const nt = prog(lt, 2.95, 3.3, ease.outBack); op(this.ntf, nt); tf(this.ntf, `translateY(${(1 - nt) * -40}px)`);
      const ck = lt > 2.7 ? Math.max(0, 1 - prog(lt, 2.7, 3.15, ease.in)) : 0; op(this.check, ck * 0.9); tf(this.check, `scale(${lerp(.4, 1.5, prog(lt, 2.7, 3.15, ease.out))})`);
    }
  });

  /* ---------------- HUMOR ---------------- */
  registerScene('humor', {
    build(root) {
      bgNavy(root, 'rgba(240,179,91,.22)'); label(root, '07', 'Поддержка · 24/7');
      root.insertAdjacentHTML('beforeend', `
      <div class="win dark hcam" style="left:360px;top:130px;width:1200px;height:860px;transform-origin:50% 50%">
        <div class="winbar"><span class="dot"></span><span class="dot y"></span><span class="dot g"></span><span class="ttl">чат · ИИ-ассистент</span><span style="margin-left:auto;font-size:14px;color:#3fb950">● онлайн</span></div>
        <div class="msgs" style="padding:34px 40px;display:flex;flex-direction:column;gap:18px;font-size:24px;line-height:1.4">
          <div class="msg me m0" style="opacity:0;font-size:24px;padding:16px 22px"><div class="who">Тимофей</div><span class="tx"></span></div>
          <div class="msg ai m1" style="opacity:0;font-size:24px;padding:16px 22px"><div class="who">Ассистент</div>Проверьте, сохранён ли файл 🙂</div>
          <div class="msg me m2" style="opacity:0;font-size:24px;padding:16px 22px"><div class="who">Тимофей</div>…</div>
          <div class="msg me m3" style="opacity:0;font-size:24px;padding:16px 22px"><div class="who">Тимофей</div><span class="tx"></span></div>
          <div class="msg ai m4" style="opacity:0;font-size:24px;padding:16px 22px"><div class="who">Ассистент</div>Всегда пожалуйста. <b>Ctrl+S</b> — тоже служение.</div>
          <div class="msg me m5" style="opacity:0;font-size:24px;padding:16px 22px;background:#2d2a1f"><div class="who">Андрей</div>😄 Записал в инструкцию для новичков.</div>
        </div>
      </div>`);
      this.cam = root.querySelector('.hcam'); this.m = [0, 1, 2, 3, 4, 5].map(i => root.querySelector('.m' + i)); this.tx0 = this.m[0].querySelector('.tx'); this.tx3 = this.m[3].querySelector('.tx');
    },
    render(lt, t) {
      const T = [0.1, 0.95, 1.65, 1.72, 2.45, 3.05];
      this.m.forEach((m, i) => { const p = prog(lt, T[i], T[i] + 0.25, ease.outBack); m.style.opacity = p; m.style.transform = `translateY(${(1 - p) * 20}px) scale(${lerp(.96, 1, p)})`; });
      const a = 'Почему ничего не работает?!', b = 'Теперь работает. Спасибо!';
      this.tx0.innerHTML = esc(typed(a, lt, 0.15, 0.85)) + (lt > .15 && lt < .9 ? '<i class="caret"></i>' : '');
      this.tx3.innerHTML = esc(typed(b, lt, 1.75, 2.35)) + (lt > 1.75 && lt < 2.4 ? '<i class="caret"></i>' : '');
      tf(this.cam, `scale(${1 + 0.02 * prog(lt, 0, 3.75)})`);
    }
  });

  /* ---------------- NEWCOMERS ---------------- */
  registerScene('newcomers', {
    build(root) {
      el('div', 'abs', '', root).style.cssText = 'inset:0;background:linear-gradient(160deg,#120f1a 0%,#1b1626 50%,#0e0c14 100%)';
      el('div', 'bg-grid', '', root);
      el('div', 'glow', '', root).style.cssText = 'left:-150px;top:-200px;width:900px;height:700px;background:rgba(240,179,91,.28)';
      el('div', 'glow', '', root).style.cssText = 'right:-200px;bottom:-300px;width:900px;height:700px;background:rgba(88,166,255,.22)';
      root.insertAdjacentHTML('beforeend', `
      <div class="big abs serif" style="left:120px;top:300px;width:760px;font-size:74px;line-height:1.12;color:var(--cream);font-weight:600;letter-spacing:-.01em;opacity:0">Достаточно желания <em style="color:var(--amber)">учиться</em> и <em style="color:var(--amber)">служить</em>.</div>
      <div class="sub abs caps" style="left:124px;top:660px;font-size:17px;color:rgba(246,231,200,.7);font-weight:700;opacity:0">Учимся вместе · каждый четверг · 19:00</div>
      <div class="phone nph" style="left:1180px;top:110px;width:560px;height:860px;border-radius:56px">
        <div class="notch"></div>
        <div class="scr">
          <div class="tg-hd"><div class="av" style="background:linear-gradient(135deg,#58a6ff,#7c3aed)">C</div><div><div class="nm">CODE:CODE · команда</div><div class="st">12 участников</div></div></div>
          <div class="tg-body" style="font-size:20px;gap:12px">
            <div class="tg-msg k0" style="opacity:0;font-size:20px"><b style="color:#f0b35b">Тимофей</b><br><span class="tx"></span><div class="tm">19:02</div></div>
            <div class="tg-msg out k1" style="opacity:0;font-size:20px"><b style="color:#9cc9f7">Андрей</b><br><span class="tx"></span><div class="tm">19:03</div></div>
            <div class="tg-msg k2" style="opacity:0;font-size:20px"><b style="color:#f0b35b">Тимофей</b><br>Буду! 🙌<div class="tm">19:03</div></div>
            <div class="k3" style="opacity:0;align-self:center;background:rgba(63,185,80,.15);border:1px solid rgba(63,185,80,.4);color:#8ff0a4;border-radius:14px;padding:12px 18px;font-size:17px;text-align:center;font-weight:700">✓ Новый участник служения: Тимофей</div>
          </div>
          <div class="tg-input">Сообщение…</div>
        </div>
      </div>`);
      this.big = root.querySelector('.big'); this.sub = root.querySelector('.sub'); this.k = [0, 1, 2, 3].map(i => root.querySelector('.k' + i)); this.t0 = this.k[0].querySelector('.tx'); this.t1 = this.k[1].querySelector('.tx'); this.ph = root.querySelector('.nph');
    },
    render(lt, t) {
      const bp = prog(lt, 0.25, 1.1, ease.out); op(this.big, bp); tf(this.big, `translateY(${(1 - bp) * 30}px)`);
      const sp = prog(lt, 1.2, 1.8, ease.out); op(this.sub, sp);
      const sl = prog(lt, 0, 0.6, ease.outBack); tf(this.ph, `translateX(${(1 - sl) * 400}px)`); op(this.ph, prog(lt, 0, .3));
      const T = [0.3, 1.6, 2.5, 2.9];
      this.k.forEach((m, i) => { const p = prog(lt, T[i], T[i] + 0.25, ease.outBack); m.style.opacity = p; m.style.transform = `translateY(${(1 - p) * 18}px)`; });
      const a = 'Я бухгалтер, не программист. Но очень хочу помогать.', b = 'Отлично! Нам как раз нужна таблица служений 😄 Завтра в 19:00?';
      this.t0.innerHTML = esc(typed(a, lt, 0.3, 0.9)) + (lt > .3 && lt < .95 ? '<i class="caret"></i>' : '');
      this.t1.innerHTML = esc(typed(b, lt, 1.6, 2.3)) + (lt > 1.6 && lt < 2.35 ? '<i class="caret"></i>' : '');
    }
  });

  /* ---------------- CONVERGENCE (build-up) ---------------- */
  registerScene('convergence', {
    build(root) {
      el('div', 'abs', '', root).style.cssText = 'inset:0;background:radial-gradient(ellipse 70% 70% at 50% 50%,#141c3a 0%,#0b1020 60%,#05070f 100%)';
      el('div', 'bg-grid', '', root);
      this.rays = el('div', 'abs', '', root); this.rays.style.cssText = 'left:50%;top:50%;width:3000px;height:3000px;margin:-1500px 0 0 -1500px;background:conic-gradient(from 0deg,rgba(255,255,255,0) 0deg,rgba(240,179,91,.14) 12deg,rgba(255,255,255,0) 24deg,rgba(88,166,255,.14) 50deg,rgba(255,255,255,0) 64deg,rgba(255,255,255,0) 110deg,rgba(240,179,91,.12) 124deg,rgba(255,255,255,0) 140deg,rgba(88,166,255,.14) 190deg,rgba(255,255,255,0) 206deg,rgba(255,255,255,0) 250deg,rgba(240,179,91,.14) 262deg,rgba(255,255,255,0) 276deg,rgba(88,166,255,.12) 320deg,rgba(255,255,255,0) 336deg);opacity:0';
      this.rings = [0, 1, 2].map(i => { const r = el('div', 'abs', '', root); r.style.cssText = 'left:50%;top:50%;width:300px;height:300px;margin:-150px 0 0 -150px;border-radius:50%;border:2px solid rgba(255,255,255,.7);opacity:0'; return r; });
      const items = [['Сайт церкви', '⟨/⟩', '#f0b35b'], ['Telegram-бот', '✈', '#2ea6ff'], ['Регистрация', '✓', '#a78bfa'], ['График служения', '▦', '#2dd4bf']];
      this.cards = items.map((it, i) => { const c = el('div', 'abs', `<div style="width:64px;height:64px;border-radius:16px;background:${it[2]}22;border:1px solid ${it[2]}66;color:${it[2]};display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800">${it[1]}</div><div style="font-size:26px;font-weight:700;margin-top:18px;color:#e6edf3">${it[0]}</div>`, root); c.style.cssText = `left:50%;top:50%;width:380px;height:220px;margin:-110px 0 0 -190px;background:#0d1117;border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:30px 32px;box-shadow:0 30px 80px rgba(0,0,0,.5);opacity:0`; return c; });
      this.words = ['ИДЕИ', 'ПРОЕКТЫ', 'ЛЮДИ', 'СЛУЖЕНИЕ'].map(w => { const d = el('div', 'abs caps', w, root); d.style.cssText = 'left:0;right:0;top:50%;margin-top:150px;text-align:center;font-size:60px;font-weight:800;color:#fff;letter-spacing:.32em;padding-left:.32em;opacity:0;text-shadow:0 0 40px rgba(255,255,255,.5)'; return d; });
      this.orb = el('div', 'abs', '', root); this.orb.style.cssText = 'left:50%;top:50%;width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;background:#fff;box-shadow:0 0 80px 30px rgba(240,179,91,.7),0 0 220px 90px rgba(88,166,255,.55);opacity:0';
      this.white = el('div', 'abs', '', root); this.white.style.cssText = 'inset:0;background:#fff;opacity:0';
    },
    render(lt, t, dur) {
      const pos = [[-520, -230], [520, -230], [-520, 230], [520, 230]];
      const gather = prog(lt, 1.0, 2.4, ease.inOut);
      this.cards.forEach((c, i) => { const ap = prog(lt, 0.05 + i * 0.12, 0.45 + i * 0.12, ease.outBack); const x = pos[i][0] * (1 - gather), y = pos[i][1] * (1 - gather); c.style.opacity = Math.min(ap, 1 - prog(lt, 2.1, 2.45)); c.style.transform = `translate(${x}px,${y}px) scale(${lerp(.8, 1, ap) * lerp(1, .3, gather)}) rotate(${gather * (i % 2 ? 25 : -25)}deg)`; });
      // words on beats 2.4–3.3 (one per beat)
      this.words.forEach((w, i) => { const a = 1.95 + i * E.BEAT; const p = prog(lt, a, a + 0.08); const out = prog(lt, a + E.BEAT - 0.1, a + E.BEAT); w.style.opacity = p * (1 - out) * (i === 3 ? 1 : 1); w.style.transform = `scale(${lerp(1.25, 1, prog(lt, a, a + E.BEAT, ease.out))})`; });
      op(this.rays, prog(lt, 0.3, 2.0) * 0.95); tf(this.rays, `rotate(${lt * 22}deg) scale(${1 + E.punch(t) * 0.06})`);
      this.rings.forEach((r, i) => { const b = E.beat(t) - i * 0.33; const ph = b - Math.floor(b); const s = lerp(0.3, 6, ph); r.style.opacity = (lt > 0.8 ? (1 - ph) * 0.6 : 0) * prog(lt, 0.8, 1.6); r.style.transform = `scale(${s})`; });
      const o = prog(lt, 1.6, 2.6, ease.out); op(this.orb, o); tf(this.orb, `scale(${lerp(0.4, 1.4, o) + E.punch(t) * 0.3 + lerp(0, 16, prog(lt, 3.1, dur, ease.in))})`);
      op(this.white, prog(lt, 3.3, dur, ease.in));
    }
  });

  /* ---------------- TITLE ---------------- */
  registerScene('title', {
    build(root) {
      el('div', 'abs', '', root).style.cssText = 'inset:0;background:radial-gradient(ellipse 60% 60% at 50% 45%,#1a2342 0%,#0b1020 55%,#030509 100%)';
      this.rays = el('div', 'abs', '', root); this.rays.style.cssText = 'left:50%;top:45%;width:3400px;height:3400px;margin:-1700px 0 0 -1700px;background:conic-gradient(from 0deg,rgba(255,255,255,0) 0deg,rgba(240,179,91,.12) 10deg,rgba(255,255,255,0) 22deg,rgba(88,166,255,.10) 70deg,rgba(255,255,255,0) 84deg,rgba(240,179,91,.08) 140deg,rgba(255,255,255,0) 152deg,rgba(88,166,255,.10) 210deg,rgba(255,255,255,0) 226deg,rgba(240,179,91,.10) 290deg,rgba(255,255,255,0) 304deg);mask-image:radial-gradient(circle,rgba(0,0,0,1) 0%,rgba(0,0,0,0) 45%);-webkit-mask-image:radial-gradient(circle,rgba(0,0,0,1) 0%,rgba(0,0,0,0) 45%)';
      this.ring = el('div', 'abs', '', root); this.ring.style.cssText = 'left:50%;top:45%;width:200px;height:200px;margin:-100px 0 0 -100px;border-radius:50%;border:3px solid rgba(255,255,255,.9);opacity:0';
      root.insertAdjacentHTML('beforeend', `
      <div class="wrap abs" style="left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:translateY(-30px)">
        <div class="k caps" style="font-size:26px;letter-spacing:.5em;color:var(--amber);font-weight:700;opacity:0;padding-left:.5em">Министерство</div>
        <div class="name" style="margin-top:22px;font-size:230px;font-weight:800;letter-spacing:-.03em;line-height:1;color:#fff;display:flex;align-items:center;gap:.04em;text-shadow:0 0 60px rgba(88,166,255,.35)"><span class="w1">CODE</span><span class="colon" style="display:inline-flex;flex-direction:column;justify-content:center;gap:48px;height:1em;padding:0 .02em"><i style="display:block;width:46px;height:46px;border-radius:10px;background:var(--amber);box-shadow:0 0 30px rgba(240,179,91,.8)"></i><i style="display:block;width:46px;height:46px;border-radius:10px;background:var(--amber);box-shadow:0 0 30px rgba(240,179,91,.8)"></i></span><span class="w2">CODE</span></div>
        <div class="line" style="width:420px;height:2px;background:linear-gradient(90deg,transparent,var(--amber),transparent);margin-top:34px;transform:scaleX(0)"></div>
        <div class="s caps" style="margin-top:30px;font-size:30px;letter-spacing:.42em;color:#e6edf3;font-weight:600;opacity:0;padding-left:.42em">Отдел вайб-кодинга</div>
      </div>`);
      this.k = root.querySelector('.k'); this.name = root.querySelector('.name'); this.line = root.querySelector('.line'); this.s = root.querySelector('.s'); this.colon = root.querySelector('.colon');
      const dust = el('div', 'abs', '', root); dust.style.cssText = 'inset:0'; this.dots = [];
      for (let i = 0; i < 50; i++) { const d = el('div', 'abs', '', dust); const sz = 2 + prng(i, 11) * 4; d.style.cssText = `width:${sz}px;height:${sz}px;border-radius:50%;background:${i % 3 ? '#ffe4b5' : '#9cc9f7'};filter:blur(1px)`; this.dots.push(d); }
    },
    render(lt, t) {
      const hit = prog(lt, 0, 0.55, ease.outExpo);
      tf(this.name, `scale(${lerp(1.35, 1, hit)})`); this.name.style.filter = `blur(${(1 - hit) * 18}px)`; op(this.name, prog(lt, 0, 0.2));
      this.colon.style.transform = `scale(${1 + E.punch(t) * 0.18})`;
      op(this.k, prog(lt, 0.35, 0.8, ease.out)); tf(this.k, `translateY(${(1 - prog(lt, 0.35, 0.8, ease.out)) * -16}px)`);
      this.line.style.transform = `scaleX(${prog(lt, 0.5, 1.1, ease.out)})`;
      const sp = prog(lt, 0.8, 1.4, ease.out); op(this.s, sp); this.s.style.letterSpacing = lerp(.9, .42, sp) + 'em';
      const rg = prog(lt, 0, 0.9, ease.out); op(this.ring, (1 - rg) * 0.9); tf(this.ring, `scale(${lerp(0.4, 12, rg)})`); this.ring.style.borderWidth = lerp(6, 1, rg) + 'px';
      tf(this.rays, `rotate(${lt * 6}deg)`); op(this.rays, 0.5 + 0.5 * prog(lt, 0, 1));
      this.dots.forEach((d, i) => { const u = prng(i, 12), v = prng(i, 13); d.style.left = (u * 1920 + Math.sin(t * 0.5 + i) * 20) + 'px'; d.style.top = (v * 1080 - lt * 18 * (0.5 + u)) + 'px'; d.style.opacity = 0.15 + 0.5 * Math.abs(Math.sin(t * 0.9 + i * 1.9)); });
    }
  });

  /* ---------------- SLOGAN ---------------- */
  registerScene('slogan', {
    build(root) {
      el('div', 'abs', '', root).style.cssText = 'inset:0;background:linear-gradient(180deg,#0d0805 0%,#1c120a 55%,#120b06 100%)';
      el('div', 'abs', '', root).style.cssText = 'left:1240px;top:-60px;width:300px;height:620px;border-radius:150px 150px 0 0;background:linear-gradient(180deg,#f7e6c6,#e0b476);filter:blur(60px);opacity:.35';
      el('div', 'abs', '', root).style.cssText = 'inset:0;background:radial-gradient(ellipse 60% 50% at 50% 55%,rgba(240,179,91,.10),rgba(0,0,0,0) 70%)';
      root.insertAdjacentHTML('beforeend', `
      <div class="wrap abs" style="inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div class="q serif" style="font-size:86px;font-style:italic;font-weight:400;color:var(--cream);letter-spacing:.01em;text-align:center;line-height:1.2;opacity:0">Технологии<br>на служении церкви</div>
        <div class="ln" style="width:140px;height:2px;background:var(--amber);margin-top:38px;transform:scaleX(0)"></div>
        <div class="c caps" style="margin-top:30px;font-size:19px;letter-spacing:.5em;color:rgba(246,231,200,.7);font-weight:700;opacity:0;padding-left:.5em">Code:Code · 1 Петра 4:10</div>
      </div>
      <div class="dust abs" style="inset:0"></div>`);
      this.q = root.querySelector('.q'); this.ln = root.querySelector('.ln'); this.c = root.querySelector('.c');
      const dust = root.querySelector('.dust'); this.dots = [];
      for (let i = 0; i < 40; i++) { const d = el('div', 'abs', '', dust); const sz = 2 + prng(i, 21) * 3; d.style.cssText = `width:${sz}px;height:${sz}px;border-radius:50%;background:#ffe4b5;filter:blur(1px)`; this.dots.push(d); }
    },
    render(lt, t) {
      const q = prog(lt, 0.15, 1.3, ease.out); op(this.q, q); tf(this.q, `translateY(${(1 - q) * 26}px) scale(${lerp(.97, 1, q)})`);
      this.ln.style.transform = `scaleX(${prog(lt, 1.0, 1.7, ease.out)})`;
      op(this.c, prog(lt, 1.5, 2.2, ease.out));
      this.dots.forEach((d, i) => { const u = prng(i, 22), v = prng(i, 23); d.style.left = (u * 1920 + Math.sin(t * 0.4 + i) * 16) + 'px'; d.style.top = (v * 1080 - lt * 10 * (0.5 + u)) + 'px'; d.style.opacity = 0.1 + 0.45 * Math.abs(Math.sin(t * 0.7 + i * 2.3)); });
    }
  });
})();
