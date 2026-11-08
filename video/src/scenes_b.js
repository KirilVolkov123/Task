/* Part B (1/2) — montage: editor, website, telegram, registration, schedule */
(function () {
  const { el, prog, ease, lerp, prng, op, tf, typed, cursorOn, codeHTML, esc } = E;
  const label = (root, n, t) => el('div', 'scene-label', `<span class="n">${n}</span><span class="ln"></span><span class="t">${t}</span>`, root);
  const bgNavy = (root, accent) => {
    el('div', 'abs', '', root).style.cssText = 'inset:0;background:linear-gradient(160deg,#0b1020 0%,#0e1530 55%,#0a0f1f 100%)';
    el('div', 'bg-grid', '', root);
    const g1 = el('div', 'glow', '', root); g1.style.cssText = `left:-200px;bottom:-300px;width:900px;height:700px;background:${accent || 'rgba(88,166,255,.35)'}`;
    const g2 = el('div', 'glow', '', root); g2.style.cssText = 'right:-250px;top:-300px;width:800px;height:600px;background:rgba(240,179,91,.16)';
  };
  const NAMES = ['Андрей', 'Мария', 'Пётр', 'Анна', 'Давид', 'Лидия', 'Тимофей', 'Руфь', 'Степан', 'Вера', 'Илья', 'Марфа'];
  const COLORS = ['#2563eb', '#db2777', '#16a34a', '#ea580c', '#7c3aed', '#0891b2', '#ca8a04', '#be123c', '#059669', '#4f46e5', '#c2410c', '#0d9488'];
  const avatar = (i, sz = 34) => `<span class="avatar" style="width:${sz}px;height:${sz}px;background:${COLORS[i % 12]};font-size:${sz * .42}px">${NAMES[i % 12][0]}</span>`;
  E.NAMES = NAMES; E.COLORS = COLORS; E.avatar = avatar; E.label = label; E.bgNavy = bgNavy;

  /* ---------------- EDITOR ---------------- */
  const SITE_HTML = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Церковь «Вифания» — Расписание служений</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="hero">
    <h1>Добро пожаловать!</h1>
    <p>Воскресное богослужение — 10:00</p>
    <a class="btn" href="#register">Записаться на встречу</a>
  </header>
  <section id="schedule">
    <h2>Расписание служений</h2>
    <ul>
      <li>Воскресенье · 10:00 — Богослужение</li>
      <li>Среда · 19:00 — Разбор Библии</li>
      <li>Пятница · 18:00 — Молодёжная встреча</li>
    </ul>
  </section>
</body>
</html>`;
  const PROMPT1 = 'Сделай сайт нашей церкви: расписание служений, форма записи на встречу, адаптивный дизайн.';
  registerScene('editor', {
    build(root) {
      bgNavy(root); label(root, '01', 'Сайт церкви');
      root.insertAdjacentHTML('beforeend', `
      <div class="win dark" style="left:110px;top:150px;width:1700px;height:830px">
        <div class="winbar"><span class="dot"></span><span class="dot y"></span><span class="dot g"></span><span class="ttl">церковь-сайт — index.html</span></div>
        <div class="editor">
          <div class="side"><div class="sec">Проект</div>
            <div class="f on">⟨/⟩ index.html</div><div class="f">¶ style.css</div><div class="f">{} расписание.json</div><div class="f">λ bot.py</div><div class="f">≡ README.md</div></div>
          <div class="code"><div class="lnum"></div><pre class="src"></pre></div>
          <div class="aipanel"><div class="hd"><b></b>ИИ-ассистент</div><div class="msgs">
            <div class="msg me"><div class="who">Андрей</div><span class="p1"></span></div>
            <div class="msg ai a1" style="opacity:0"><div class="who">Ассистент</div>Хорошая идея. Создаю <span class="mono" style="color:#7ee787">index.html</span> и <span class="mono" style="color:#7ee787">style.css</span> — расписание возьму из <span class="mono" style="color:#d2a8ff">расписание.json</span>.</div>
            <div class="msg ai a2" style="opacity:0"><div class="who">Ассистент</div>Готово ✔ Открой предпросмотр: <span class="mono" style="color:#58a6ff">localhost:3000</span></div>
          </div></div>
        </div>
      </div>`);
      this.ln = root.querySelector('.lnum'); this.src = root.querySelector('.src'); this.p1 = root.querySelector('.p1'); this.a1 = root.querySelector('.a1'); this.a2 = root.querySelector('.a2');
      this.ln.innerHTML = Array.from({ length: 24 }, (_, i) => i + 1).join('<br>');
    },
    render(lt, t) {
      const typing = lt > 0.05 && lt < 1.2;
      this.p1.innerHTML = esc(typed(PROMPT1, lt, 0.05, 1.2)) + (typing ? '<i class="caret" style="height:.9em;width:.45em"></i>' : '');
      op(this.a1, prog(lt, 1.25, 1.5, ease.out)); tf(this.a1, `translateY(${(1 - prog(lt, 1.25, 1.5, ease.out)) * 14}px)`);
      op(this.a2, prog(lt, 3.5, 3.7, ease.out));
      this.src.innerHTML = codeHTML(SITE_HTML, 'html', t, E.DROP + 1.25, E.DROP + 3.55);
    }
  });

  /* ---------------- WEBSITE ---------------- */
  const SITE = (scale) => `
    <div style="transform:scale(${scale});transform-origin:0 0;width:${1200}px;font-family:Manrope;color:#1f2328">
      <div style="height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 56px;border-bottom:1px solid #eee">
        <div class="serif" style="font-size:24px;font-weight:700;color:#3b2a1a">Церковь «Вифания»</div>
        <div style="display:flex;gap:30px;font-size:16px;font-weight:600;color:#4b5563"><span>О церкви</span><span style="color:#b45309">Расписание</span><span>Служения</span><span>Контакты</span></div>
      </div>
      <div style="padding:64px 56px 56px;background:linear-gradient(135deg,#fdf6e8,#f6e3c2);position:relative;overflow:hidden">
        <div style="position:absolute;right:-60px;top:-80px;width:420px;height:420px;border-radius:50%;background:rgba(240,179,91,.35)"></div>
        <div class="serif" style="font-size:54px;font-weight:700;color:#2b1d10;line-height:1.1;position:relative">Добро пожаловать!</div>
        <div style="font-size:22px;color:#5b4631;margin-top:14px;position:relative">Воскресное богослужение — 10:00 · ул. Садовая, 12</div>
        <div class="btn-reg" style="display:inline-block;margin-top:28px;padding:16px 30px;border-radius:12px;background:#b45309;color:#fff;font-weight:700;font-size:19px;position:relative;box-shadow:0 10px 30px rgba(180,83,9,.35)">Записаться на встречу</div>
      </div>
      <div style="padding:44px 56px"><div class="serif" style="font-size:30px;font-weight:700;color:#2b1d10">Расписание служений</div>
        <div class="cards" style="display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:24px">
          ${[['Воскресенье', '10:00', 'Богослужение', '#fde68a'], ['Среда', '19:00', 'Разбор Библии', '#bfdbfe'], ['Пятница', '18:00', 'Молодёжная встреча', '#bbf7d0']].map(c => `
          <div class="sc" style="border:1px solid #eee;border-radius:16px;padding:22px;background:#fff;box-shadow:0 10px 30px rgba(0,0,0,.05)">
            <div style="display:inline-block;padding:5px 11px;border-radius:8px;background:${c[3]};font-weight:700;font-size:14px">${c[0]}</div>
            <div style="font-size:34px;font-weight:800;margin-top:12px;letter-spacing:-.02em">${c[1]}</div>
            <div style="font-size:17px;color:#4b5563;margin-top:4px">${c[2]}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  registerScene('website', {
    build(root) {
      bgNavy(root, 'rgba(240,179,91,.25)'); label(root, '01', 'Сайт церкви · предпросмотр');
      root.insertAdjacentHTML('beforeend', `
      <div class="win light wsite" style="left:150px;top:150px;width:1280px;height:830px;transform-origin:50% 50%">
        <div class="winbar"><span class="dot"></span><span class="dot y"></span><span class="dot g"></span><div class="urlbar"><span class="lock"></span><span class="url">localhost:3000</span></div></div>
        <div class="page abs" style="left:0;right:0;top:46px;bottom:0;overflow:hidden;background:#fff"><div class="pg" style="position:absolute;left:0;top:0;width:1280px">${SITE(1280 / 1200)}</div></div>
        <div class="toast abs" style="left:50%;bottom:30px;transform:translateX(-50%);background:#14532d;color:#bbf7d0;padding:14px 22px;border-radius:12px;font-weight:700;font-size:18px;opacity:0;box-shadow:0 10px 30px rgba(0,0,0,.3)">✔ Вы записаны на встречу</div>
        <div class="ptr abs" style="left:0;top:0;width:28px;height:28px;opacity:0"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 3l7 17 2.5-6.5L20 11z" fill="#111" stroke="#fff" stroke-width="1.6"/></svg></div>
      </div>
      <div class="phone mph" style="left:1480px;top:240px;width:320px;height:660px;border-radius:40px;transform-origin:50% 50%">
        <div class="notch" style="width:90px;height:24px;top:10px"></div>
        <div class="scr" style="inset:10px;border-radius:32px;background:#fff;color:#1f2328"><div style="position:absolute;left:0;top:0;width:300px;overflow:hidden">${SITE(300 / 1200).replace('grid-template-columns:repeat(3,1fr)', 'grid-template-columns:1fr')}</div></div>
      </div>
      <div class="badge bd" style="left:150px;top:1000px;opacity:0"><span class="ck">✓</span>Сайт опубликован</div>`);
      this.win = root.querySelector('.wsite'); this.pg = root.querySelector('.pg'); this.cards = [...root.querySelectorAll('.wsite .sc')];
      this.toast = root.querySelector('.toast'); this.ptr = root.querySelector('.ptr'); this.btn = root.querySelector('.wsite .btn-reg'); this.ph = root.querySelector('.mph'); this.bd = root.querySelector('.bd'); this.url = root.querySelector('.url');
    },
    render(lt) {
      const pop = prog(lt, 0, 0.55, ease.outBack); tf(this.win, `scale(${lerp(.9, 1, pop)})`); op(this.win, prog(lt, 0, .25));
      const scroll = prog(lt, 1.0, 1.9, ease.inOut) * 300; tf(this.pg, `translateY(${-scroll}px)`);
      this.cards.forEach((c, i) => { const p = prog(lt, 1.3 + i * .22, 1.75 + i * .22, ease.outBack); c.style.opacity = p; c.style.transform = `translateY(${(1 - p) * 40}px)`; });
      // pointer travels to the button and clicks (page scrolled 300 up → button at ~y 330+?)
      const mv = prog(lt, 2.0, 2.55, ease.inOut);
      const bx = lerp(900, 330, mv), by = lerp(700, 335 - 0, mv) + 46 - 0;
      op(this.ptr, prog(lt, 1.9, 2.1)); tf(this.ptr, `translate(${bx}px,${by - scroll + 300 - 300}px)`);
      const click = lt > 2.6 && lt < 2.75;
      this.btn.style.transform = click ? 'scale(.96)' : ''; this.btn.style.filter = click ? 'brightness(.85)' : '';
      const tst = Math.min(prog(lt, 2.75, 2.95, ease.outBack), 1 - prog(lt, 3.6, 3.75));
      op(this.toast, tst); this.toast.style.transform = `translateX(-50%) translateY(${(1 - tst) * 20}px)`;
      const ph = prog(lt, 1.9, 2.5, ease.outBack); op(this.ph, prog(lt, 1.9, 2.2)); tf(this.ph, `translateX(${(1 - ph) * 260}px) rotate(${(1 - ph) * 6}deg)`);
      const bd = prog(lt, 3.1, 3.4, ease.outBack); op(this.bd, bd); tf(this.bd, `translateY(${(1 - bd) * 30}px)`);
      this.url.textContent = lt > 3.1 ? 'вифания.церковь · опубликовано' : 'localhost:3000';
    }
  });

  /* ---------------- TELEGRAM ---------------- */
  const BOT_PY = `from aiogram import Bot, Dispatcher, types
from aiogram.utils.keyboard import InlineKeyboardBuilder

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(commands=["start"])
async def start(message: types.Message):
    kb = InlineKeyboardBuilder()
    kb.button(text="Записаться", callback_data="join")
    kb.button(text="Расписание", callback_data="schedule")
    await message.answer(
        "Мир вам! Я бот церкви «Вифания».\\n"
        "Напомню о служениях и встречах.",
        reply_markup=kb.as_markup(),
    )

async def announce(text: str):
    for chat_id in subscribers:
        await bot.send_message(chat_id, text)`;
  registerScene('telegram', {
    build(root) {
      bgNavy(root, 'rgba(45,212,191,.28)'); label(root, '02', 'Telegram-бот объявлений');
      root.insertAdjacentHTML('beforeend', `
      <div class="win dark" style="left:110px;top:150px;width:1110px;height:830px">
        <div class="winbar"><span class="dot"></span><span class="dot y"></span><span class="dot g"></span><span class="ttl">bot.py</span><span class="mono" style="margin-left:auto;color:#3fb950;font-size:14px">● запущен</span></div>
        <div class="code" style="padding:22px 26px;font-size:19px;line-height:1.5;position:relative"><div class="lnum" style="font-size:19px"></div><pre class="src" style="padding-left:50px"></pre></div>
      </div>
      <div class="phone ph" style="left:1360px;top:110px">
        <div class="notch"></div>
        <div class="scr">
          <div class="tg-hd"><div class="av">В</div><div><div class="nm">Церковь «Вифания»</div><div class="st">бот · онлайн</div></div></div>
          <div class="tg-body">
            <div class="tg-msg m1" style="opacity:0">Мир вам! 🙏 Я бот церкви «Вифания». Буду напоминать о служениях и встречах.<div class="tm">10:02</div></div>
            <div class="tg-msg m2" style="opacity:0">📅 <b>Напоминание</b><br>Воскресенье, 10:00 — богослужение.<br>Пятница, 18:00 — молодёжная встреча.<div class="tg-btns" style="margin-top:10px"><div class="tg-btn b1">Записаться</div><div class="tg-btn">Расписание</div></div><div class="tm">10:02</div></div>
            <div class="tg-msg out m3" style="opacity:0">Записаться<div class="tm">10:03</div></div>
            <div class="tg-msg m4" style="opacity:0">✅ Вы записаны. До встречи в пятницу!<div class="tm">10:03</div></div>
          </div>
          <div class="tg-input">Сообщение…</div>
        </div>
      </div>`);
      root.querySelector('.lnum').innerHTML = Array.from({ length: 22 }, (_, i) => i + 1).join('<br>');
      this.src = root.querySelector('.src'); this.ph = root.querySelector('.ph'); this.b1 = root.querySelector('.b1');
      this.m = [1, 2, 3, 4].map(i => root.querySelector('.m' + i));
    },
    render(lt, t) {
      this.src.innerHTML = codeHTML(BOT_PY, 'py', t, E.barT(4) + 0.1, E.barT(4) + 2.5);
      const sl = prog(lt, 0, 0.6, ease.outBack); tf(this.ph, `translateX(${(1 - sl) * 500}px)`); op(this.ph, prog(lt, 0, 0.3));
      const times = [0.6, 2.0, 2.85, 3.1];
      this.m.forEach((m, i) => { const p = prog(lt, times[i], times[i] + 0.25, ease.outBack); m.style.opacity = p; m.style.transform = `translateY(${(1 - p) * 18}px) scale(${lerp(.95, 1, p)})`; });
      this.b1.className = 'tg-btn b1' + (lt > 2.65 && lt < 3.0 ? ' hot' : '');
    }
  });

  /* ---------------- REGISTRATION ---------------- */
  registerScene('registration', {
    build(root) {
      bgNavy(root, 'rgba(167,139,250,.28)'); label(root, '03', 'Система регистрации');
      const fields = [['Имя и фамилия', 'Анна Ковальчук'], ['Телефон', '+380 67 123 45 67'], ['Церковь / город', '«Вифания», Ровно'], ['Возраст', '19']];
      root.insertAdjacentHTML('beforeend', `
      <div class="card frm" style="position:absolute;left:120px;top:170px;width:900px;height:790px;padding:46px 52px;transform-origin:50% 50%">
        <div class="kicker" style="color:#7c3aed">Молодёжный лагерь «Источник»</div>
        <div class="serif" style="font-size:40px;font-weight:700;margin-top:10px;color:#1f1030">Регистрация участника</div>
        <div style="font-size:17px;color:#6b7280;margin-top:6px">12–18 июля · заезд с 14:00</div>
        <div class="fields" style="margin-top:32px;display:flex;flex-direction:column;gap:18px">
          ${fields.map((f, i) => `<div><div style="font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:8px">${f[0]}</div><div class="fld f${i} mono" style="height:60px;border:2px solid #e5e7eb;border-radius:12px;padding:0 18px;display:flex;align-items:center;font-size:21px;color:#111827" data-v="${f[1]}"></div></div>`).join('')}
        </div>
        <div class="sub" style="margin-top:28px;height:66px;border-radius:14px;background:#6d28d9;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:21px;box-shadow:0 14px 40px rgba(109,40,217,.35)">Зарегистрировать</div>
        <div class="ok abs" style="inset:0;border-radius:18px;background:rgba(255,255,255,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0">
          <div style="width:120px;height:120px;border-radius:50%;background:#16a34a;color:#fff;font-size:64px;display:flex;align-items:center;justify-content:center;font-weight:900;box-shadow:0 20px 60px rgba(22,163,74,.35)">✓</div>
          <div class="serif" style="font-size:38px;font-weight:700;margin-top:26px;color:#14532d">Анна, вы зарегистрированы!</div>
          <div style="font-size:19px;color:#6b7280;margin-top:8px">Подтверждение отправлено в Telegram</div>
        </div>
      </div>
      <div class="win dark st" style="left:1080px;top:170px;width:720px;height:790px;padding:40px 44px;border-radius:18px">
        <div class="kicker" style="color:#a78bfa">Статистика</div>
        <div style="display:flex;align-items:baseline;gap:16px;margin-top:10px"><div class="num mono" style="font-size:110px;font-weight:700;letter-spacing:-.04em;line-height:1">47</div><div style="color:var(--muted);font-size:20px">зарегистрировано</div></div>
        <div style="margin-top:18px;height:14px;border-radius:7px;background:#1f2937;overflow:hidden"><div class="bar" style="height:100%;width:30%;background:linear-gradient(90deg,#7c3aed,#2dd4bf);border-radius:7px"></div></div>
        <div class="cap mono" style="margin-top:10px;color:var(--muted);font-size:16px">Мест: 47 / 150</div>
        <div style="margin-top:34px;font-size:14px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);font-weight:700">Последние</div>
        <div class="list" style="margin-top:14px;display:flex;flex-direction:column;gap:12px"></div>
        <div class="badge ab" style="left:44px;bottom:40px;opacity:0;font-size:20px;padding:12px 20px"><span class="ck" style="width:28px;height:28px;font-size:16px">✓</span>Таблица обновлена автоматически</div>
      </div>`);
      const list = root.querySelector('.list'); this.rows = [];
      [[3, 'Анна К.', 'Ровно'], [2, 'Пётр С.', 'Луцк'], [5, 'Лидия М.', 'Ровно'], [4, 'Давид Р.', 'Здолбунов'], [1, 'Мария В.', 'Ровно'], [6, 'Тимофей Г.', 'Дубно']].forEach(r => {
        const d = el('div', '', `${avatar(r[0], 38)}<div style="flex:1"><div style="font-weight:700;font-size:18px">${r[1]}</div><div style="font-size:14px;color:var(--muted)">${r[2]}</div></div><div class="mono" style="color:#3fb950;font-size:15px">оплачено</div>`, list);
        d.style.cssText = 'display:flex;align-items:center;gap:14px;background:#0d1117;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:10px 14px;opacity:0'; this.rows.push(d);
      });
      this.frm = root.querySelector('.frm'); this.flds = [0, 1, 2, 3].map(i => root.querySelector('.f' + i)); this.sub = root.querySelector('.sub'); this.ok = root.querySelector('.ok');
      this.num = root.querySelector('.num'); this.bar = root.querySelector('.bar'); this.cap = root.querySelector('.cap'); this.ab = root.querySelector('.ab');
    },
    render(lt, t) {
      const pop = prog(lt, 0, 0.5, ease.outBack); tf(this.frm, `scale(${lerp(.92, 1, pop)})`); op(this.frm, prog(lt, 0, .2));
      const starts = [0.3, 0.9, 1.5, 2.1];
      this.flds.forEach((f, i) => {
        const a = starts[i], b = a + 0.5, typing = lt > a && lt < b; const v = f.dataset.v;
        f.innerHTML = esc(typed(v, lt, a, b)) + (typing ? '<i class="caret" style="background:#6d28d9"></i>' : '');
        f.style.borderColor = typing ? '#7c3aed' : lt >= b ? '#c4b5fd' : '#e5e7eb'; f.style.boxShadow = typing ? '0 0 0 4px rgba(124,58,237,.15)' : '';
      });
      const press = lt > 2.75 && lt < 2.9; this.sub.style.transform = press ? 'scale(.97)' : ''; this.sub.style.filter = press ? 'brightness(.85)' : '';
      op(this.ok, prog(lt, 2.95, 3.2, ease.out));
      const n = Math.round(lerp(47, 128, prog(lt, 0.5, 3.1, ease.inOut))) + (lt > 3.0 ? 1 : 0);
      this.num.textContent = n; this.bar.style.width = (n / 150 * 100).toFixed(1) + '%'; this.cap.textContent = `Мест: ${n} / 150`;
      this.rows.forEach((r, i) => { const p = prog(lt, 0.5 + i * 0.42, 0.85 + i * 0.42, ease.outBack); r.style.opacity = p; r.style.transform = `translateX(${(1 - p) * 40}px)`; });
      const ab = prog(lt, 3.05, 3.35, ease.outBack); op(this.ab, ab); tf(this.ab, `translateY(${(1 - ab) * 20}px)`);
    }
  });

  /* ---------------- SCHEDULE ---------------- */
  registerScene('schedule', {
    build(root) {
      bgNavy(root, 'rgba(45,212,191,.25)'); label(root, '04', 'График служения');
      const cols = ['Вс · 10:00', 'Ср · 19:00', 'Пт · 18:00', 'Вс · 10:00 (след.)'];
      const rows = ['Звук', 'Проектор и слайды', 'Встреча гостей', 'Детское служение', 'Кухня и чай', 'Уборка зала'];
      root.insertAdjacentHTML('beforeend', `
      <div class="card grid" style="position:absolute;left:110px;top:160px;width:1700px;height:810px;padding:40px 48px;transform-origin:50% 50%">
        <div style="display:flex;align-items:flex-end;justify-content:space-between">
          <div><div class="kicker" style="color:#0f766e">Неделя 14–20 июля</div><div class="serif" style="font-size:40px;font-weight:700;margin-top:8px;color:#0f1f1c">График служения</div></div>
          <div class="mono" style="font-size:16px;color:#6b7280">учтены занятость, дары и отпуск · <span class="cnt" style="color:#0f766e;font-weight:700">0</span>/24 назначено</div>
        </div>
        <div class="tbl" style="position:absolute;left:48px;right:48px;top:150px;bottom:40px;display:grid;grid-template-columns:260px repeat(4,1fr);grid-template-rows:56px repeat(6,1fr);gap:10px">
          <div></div>${cols.map(c => `<div class="mono" style="display:flex;align-items:center;justify-content:center;font-weight:700;font-size:17px;color:#0f766e;background:#ecfeff;border-radius:10px">${c}</div>`).join('')}
          ${rows.map(r => `<div style="display:flex;align-items:center;font-weight:700;font-size:19px;color:#1f2328;padding-left:6px">${r}</div>` + cols.map(() => `<div class="cell" style="background:#f8fafc;border:1.5px dashed #e2e8f0;border-radius:12px"></div>`).join('')).join('')}
        </div>
        <div class="chips abs" style="inset:0;pointer-events:none"></div>
        <div class="badge sb" style="right:48px;top:36px;opacity:0;font-size:20px;padding:12px 20px"><span class="ck" style="width:28px;height:28px;font-size:16px">✓</span>График отправлен в Telegram</div>
      </div>`);
      this.grid = root.querySelector('.grid'); this.cells = [...root.querySelectorAll('.cell')]; this.cnt = root.querySelector('.cnt'); this.sb = root.querySelector('.sb');
      const chips = root.querySelector('.chips'); this.chips = [];
      // deterministic assignment: 24 cells, people cycling with an offset per column
      const order = [0, 5, 10, 15, 20, 1, 6, 11, 16, 21, 2, 7, 12, 17, 22, 3, 8, 13, 18, 23, 4, 9, 14, 19];
      order.forEach((ci, k) => {
        const person = (k * 5 + Math.floor(k / 6)) % 12;
        const c = el('div', 'chip', `${avatar(person, 26)}${NAMES[person]}`, chips);
        c.style.cssText = `position:absolute;left:0;top:0;background:${COLORS[person]}22;color:${COLORS[person]};border:1.5px solid ${COLORS[person]}55;font-size:16px;padding:6px 12px 6px 6px;opacity:0`;
        this.chips.push({ el: c, cell: ci, t: 0.5 + k * 0.1 });
      });
    },
    render(lt, t) {
      const pop = prog(lt, 0, 0.5, ease.outBack); tf(this.grid, `scale(${lerp(.93, 1, pop)})`); op(this.grid, prog(lt, 0, .2));
      const gr = this.grid.getBoundingClientRect();
      let done = 0;
      this.chips.forEach(ch => {
        const p = prog(lt, ch.t, ch.t + 0.38, ease.outBack); if (p >= 1) done++;
        const r = this.cells[ch.cell].getBoundingClientRect();
        const cx = r.left - gr.left + r.width / 2, cy = r.top - gr.top + r.height / 2;
        const w = ch.el.offsetWidth || 120, h = ch.el.offsetHeight || 38;
        const sx = lerp(cx - 300 * (ch.cell % 2 ? 1 : -1), cx, p), sy = lerp(cy + 120, cy, p);
        ch.el.style.opacity = Math.min(1, p * 1.5); ch.el.style.transform = `translate(${sx - w / 2}px,${sy - h / 2}px) scale(${lerp(.7, 1, p)})`;
        this.cells[ch.cell].style.borderColor = p >= 1 ? '#99f6e4' : '#e2e8f0'; this.cells[ch.cell].style.background = p >= 1 ? '#f0fdfa' : '#f8fafc';
      });
      this.cnt.textContent = done;
      const sb = prog(lt, 3.1, 3.4, ease.outBack); op(this.sb, sb); tf(this.sb, `translateY(${(1 - sb) * -20}px)`);
    }
  });
})();
