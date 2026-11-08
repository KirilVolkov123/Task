/* Part A — quiet church: prayer hall, Bible, laptop (0–14 s) */
(function () {
  const { el, prog, ease, lerp, prng, op, tf, typed, cursorOn, clamp01 } = E;

  /* ---------------- HALL ---------------- */
  registerScene('hall', {
    build(root) {
      root.innerHTML = `
      <div class="hall-cam abs" style="inset:0;transform-origin:62% 42%">
        <div class="abs" style="inset:0;background:linear-gradient(180deg,#0d0805 0%,#1c120a 45%,#2b1a0e 62%,#160d07 100%)"></div>
        <div class="abs" style="left:0;right:0;top:560px;bottom:0;background:linear-gradient(180deg,#2a190d,#120b06)"></div>
        <!-- wall verse -->
        <div class="serif abs" style="left:300px;top:250px;width:560px;text-align:center;font-size:52px;letter-spacing:.1em;color:rgba(246,231,200,.42);font-weight:600">БОГ ЕСТЬ<br>ЛЮБОВЬ</div>
        <!-- windows -->
        <div class="abs win-a" style="left:1190px;top:110px;width:300px;height:600px;border-radius:150px 150px 0 0;background:linear-gradient(180deg,#fff6e3 0%,#ffe2b0 45%,#f0b35b 100%);box-shadow:0 0 140px 50px rgba(243,194,122,.28),0 0 400px 120px rgba(243,194,122,.12)"></div>
        <div class="abs" style="left:1335px;top:110px;width:10px;height:600px;background:#2b1a0e;border-radius:4px"></div>
        <div class="abs" style="left:1190px;top:330px;width:300px;height:10px;background:#2b1a0e"></div>
        <div class="abs" style="left:1190px;top:520px;width:300px;height:10px;background:#2b1a0e"></div>
        <div class="abs win-b" style="left:900px;top:170px;width:200px;height:500px;border-radius:100px 100px 0 0;background:linear-gradient(180deg,#f3dcb5 0%,#e3b878 60%,#b8803e 100%);box-shadow:0 0 90px 30px rgba(243,194,122,.14);opacity:.85"></div>
        <div class="abs" style="left:996px;top:170px;width:8px;height:500px;background:#2b1a0e"></div>
        <div class="abs" style="left:900px;top:350px;width:200px;height:8px;background:#2b1a0e"></div>
        <!-- light rays -->
        <div class="rays abs" style="left:1340px;top:420px;width:0;height:0"></div>
        <!-- pulpit -->
        <div class="abs" style="left:560px;top:560px;width:120px;height:170px;background:linear-gradient(180deg,#7a4a22,#4a2c13);clip-path:polygon(18% 0,82% 0,100% 100%,0 100%)"></div>
        <div class="abs" style="left:548px;top:548px;width:144px;height:22px;background:linear-gradient(180deg,#9a6433,#6b3f1f);border-radius:4px;transform:skewX(-6deg)"></div>
        <div class="abs" style="left:566px;top:538px;width:52px;height:16px;background:#f6ead2;border-radius:2px;transform:rotate(-8deg)"></div>
        <div class="abs" style="left:620px;top:538px;width:52px;height:16px;background:#efe1c6;border-radius:2px;transform:rotate(8deg)"></div>
        <div class="pews abs" style="inset:0"></div>
        <div class="dust abs" style="inset:0"></div>
      </div>
      <div class="abs" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 70%,rgba(0,0,0,.45))"></div>
      <div class="lower3 l3"><small>Воскресенье · после служения</small>Обычный молитвенный дом</div>`;
      // rays
      const rays = root.querySelector('.rays');
      for (let i = 0; i < 4; i++) {
        const r = el('div', 'abs', '', rays);
        const w = 120 + i * 70;
        r.style.cssText = `left:${-w / 2}px;top:0;width:${w}px;height:1500px;transform-origin:50% 0;transform:rotate(${28 + i * 4}deg);background:linear-gradient(90deg,transparent,rgba(255,214,150,.16),transparent);filter:blur(22px)`;
        r.dataset.i = i;
      }
      // pews
      const pews = root.querySelector('.pews');
      for (let k = 0; k < 7; k++) {
        const y = 598 + 44 * k + 11 * k * k, w = 820 + 190 * k + 18 * k * k, h = 30 + 10 * k + 1.4 * k * k;
        const p = el('div', 'abs', '', pews);
        p.style.cssText = `left:${960 - w / 2}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${h * .3}px ${h * .3}px 6px 6px;background:linear-gradient(180deg,#9a6433 0%,#6b3f1f 22%,#4a2c13 100%);box-shadow:0 ${h * .5}px ${h}px rgba(0,0,0,.55)`;
        const edge = el('div', 'abs', '', p);
        edge.style.cssText = `left:0;right:0;top:0;height:${Math.max(3, h * .12)}px;background:rgba(255,220,170,.28);border-radius:inherit`;
        // seat
        const s = el('div', 'abs', '', pews);
        s.style.cssText = `left:${960 - w / 2 + 10}px;top:${y + h}px;width:${w - 20}px;height:${h * .55}px;background:linear-gradient(180deg,#3a2210,#2a180a)`;
      }
      // dust
      const dust = root.querySelector('.dust'); this.dots = [];
      for (let i = 0; i < 70; i++) {
        const d = el('div', 'abs', '', dust); const sz = 2 + prng(i, 3) * 4;
        d.style.cssText = `width:${sz}px;height:${sz}px;border-radius:50%;background:#ffe4b5;filter:blur(${sz * .25}px)`;
        this.dots.push(d);
      }
      this.cam = root.querySelector('.hall-cam'); this.l3 = root.querySelector('.l3'); this.rayEls = [...rays.children];
    },
    render(lt, t, dur) {
      const s = lerp(1.0, 1.075, prog(lt, 0, dur, ease.inOut));
      tf(this.cam, `scale(${s}) translate(${-8 * lt / dur}px, ${4 * lt / dur}px)`);
      this.rayEls.forEach((r, i) => { r.style.opacity = (0.75 + 0.25 * Math.sin(t * 0.7 + i * 1.3)).toFixed(3); });
      this.dots.forEach((d, i) => {
        const u = prng(i, 1), v = prng(i, 2);
        // beam region: parallelogram from the big window down-left
        const y = 300 + v * 720 + (t * 9 * (0.5 + u)) % 60;
        const x = 1330 - (y - 300) * 0.62 + (u - 0.5) * 420 + Math.sin(t * 0.8 + i) * 12;
        d.style.left = x + 'px'; d.style.top = y + 'px';
        d.style.opacity = (0.15 + 0.6 * Math.abs(Math.sin(t * 0.9 + i * 2.1))).toFixed(3);
      });
      const l3 = Math.min(prog(lt, 1.9, 2.7, ease.out), 1 - prog(lt, dur - .7, dur - .15, ease.in));
      op(this.l3, l3); tf(this.l3, `translateY(${(1 - prog(lt, 1.9, 2.7, ease.out)) * 24}px)`);
    }
  });

  /* ---------------- BIBLE ---------------- */
  const P1 = `<b>1</b> Итак, как Христос пострадал за нас плотию, то и вы вооружитесь тою же мыслью; ибо страдающий плотию перестает грешить, <b>2</b> чтобы остальное во плоти время жить уже не по человеческим похотям, но по воле Божией. <b>3</b> Ибо довольно, что вы в прошедшее время жизни поступали по воле языческой… <b>4</b> почему они и дивятся, что вы не участвуете с ними в том же распутстве, и злословят вас. <b>5</b> Они дадут ответ Имеющему вскоре судить живых и мертвых. <b>6</b> Ибо для того и мертвым было благовествуемо, чтобы они, подвергшись суду по человеку плотию, жили по Богу духом.`;
  const P2 = `<b>7</b> Впрочем близок всему конец. Итак будьте благоразумны и бодрствуйте в молитвах. <b>8</b> Более же всего имейте усердную любовь друг ко другу, потому что любовь покрывает множество грехов. <b>9</b> Будьте страннолюбивы друг ко другу без ропота.`;
  const V10 = `<b>10</b> Служите друг другу, каждый тем даром, какой получил, как добрые домостроители многоразличной благодати Божией.`;
  const P3 = `<b>11</b> Говорит ли кто, говори как слова Божии; служит ли кто, служи по силе, какую дает Бог, дабы во всем прославлялся Бог через Иисуса Христа, Которому слава и держава во веки веков. Аминь.`;
  const P4 = `<b>12</b> Возлюбленные! огненного искушения, для испытания вам посылаемого, не чуждайтесь, как приключения для вас странного, <b>13</b> но как вы участвуете в Христовых страданиях, радуйтесь, да и в явление славы Его возрадуетесь и восторжествуете. <b>14</b> Если злословят вас за имя Христово, то вы блаженны, ибо Дух Славы, Дух Божий почивает на вас.`;

  registerScene('bible', {
    build(root) {
      root.innerHTML = `
      <div class="abs" style="inset:0;background:radial-gradient(ellipse 60% 55% at 58% 42%,#3a2614 0%,#1a110a 55%,#0b0704 100%)"></div>
      <div class="bcam abs" style="inset:0;transform-origin:58% 44%">
        <div class="book abs" style="left:360px;top:160px;width:1240px;height:800px;transform:rotate(-3.5deg);filter:drop-shadow(0 60px 80px rgba(0,0,0,.7))">
          <div class="abs" style="left:-14px;top:-10px;width:1268px;height:820px;background:#2a1a10;border-radius:10px"></div>
          <div class="page abs" style="left:0;top:0;width:620px;height:800px;background:linear-gradient(90deg,#efe6d2 0%,#f7f0e0 70%,#d9ccb2 100%);border-radius:6px 0 0 6px;padding:54px 44px 50px 60px;color:#3a2a1a">
            <div class="caps serif" style="font-size:13px;letter-spacing:.26em;color:#8a7357;text-align:center;margin-bottom:22px">Первое послание Петра · 4</div>
            <div class="serif txt dim" style="font-size:19.5px;line-height:1.52;text-align:justify;color:#6a5a48">${P1}</div>
            <div class="serif txt" style="font-size:19.5px;line-height:1.52;text-align:justify;margin-top:10px">${P2}</div>
          </div>
          <div class="page abs" style="left:620px;top:0;width:620px;height:800px;background:linear-gradient(90deg,#d9ccb2 0%,#f7f0e0 25%,#f3eadb 100%);border-radius:0 6px 6px 0;padding:54px 56px 50px 48px;color:#3a2a1a">
            <div class="caps serif" style="font-size:13px;letter-spacing:.26em;color:#8a7357;text-align:center;margin-bottom:22px">Служение дарами</div>
            <div class="serif v10" style="font-size:21px;line-height:1.55;text-align:justify;color:#1e1408;font-weight:600;position:relative;padding:6px 8px;margin:-6px -8px"><span class="hl abs" style="left:0;top:0;right:0;bottom:0;background:linear-gradient(90deg,rgba(240,179,91,.0),rgba(240,179,91,.38) 8%,rgba(240,179,91,.38) 92%,rgba(240,179,91,0));border-radius:6px;transform-origin:0 50%"></span><span style="position:relative">${V10}</span></div>
            <div class="serif txt" style="font-size:19.5px;line-height:1.52;text-align:justify;margin-top:12px">${P3}</div>
            <div class="serif txt blur" style="font-size:19.5px;line-height:1.52;text-align:justify;margin-top:10px;color:#6a5a48;filter:blur(1.6px);opacity:.75">${P4}</div>
          </div>
          <div class="abs" style="left:590px;top:0;width:60px;height:800px;background:linear-gradient(90deg,rgba(0,0,0,0),rgba(60,40,20,.35) 50%,rgba(0,0,0,0))"></div>
          <div class="abs" style="left:0;top:0;width:620px;height:800px;background:linear-gradient(90deg,rgba(0,0,0,.28),rgba(0,0,0,0) 60%);border-radius:6px 0 0 6px;pointer-events:none"></div>
        </div>
      </div>
      <div class="abs" style="inset:0;background:radial-gradient(ellipse 50% 60% at 62% 40%,rgba(255,225,170,.10),rgba(0,0,0,0) 60%)"></div>
      <div class="abs" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,0) 25%,rgba(0,0,0,0) 70%,rgba(0,0,0,.5))"></div>
      <div class="ref abs caps" style="right:130px;bottom:96px;font-size:18px;color:var(--amber);font-weight:700;text-align:right"><span class="serif" style="display:block;font-size:30px;letter-spacing:.02em;text-transform:none;color:var(--cream);margin-bottom:8px;font-weight:400">«Служите друг другу, каждый тем даром, какой получил»</span>1 Петра 4:10</div>`;
      this.cam = root.querySelector('.bcam'); this.hl = root.querySelector('.hl'); this.ref = root.querySelector('.ref');
    },
    render(lt, t, dur) {
      const s = lerp(1.0, 1.16, prog(lt, 0, dur, ease.inOut));
      tf(this.cam, `scale(${s}) translateY(${-10 * lt / dur}px)`);
      tf(this.hl, `scaleX(${prog(lt, 0.9, 2.2, ease.out)})`);
      const r = Math.min(prog(lt, 1.4, 2.2, ease.out), 1 - prog(lt, dur - .6, dur - .1, ease.in));
      op(this.ref, r); tf(this.ref, `translateY(${(1 - prog(lt, 1.4, 2.2, ease.out)) * 20}px)`);
    }
  });

  /* ---------------- LAPTOP ---------------- */
  registerScene('laptop', {
    build(root) {
      root.innerHTML = `
      <div class="lcam abs" style="inset:0;transform-origin:1022px 400px">
        <div class="abs" style="inset:0;background:linear-gradient(180deg,#0c0805 0%,#1a110a 50%,#241509 100%)"></div>
        <div class="abs" style="left:1240px;top:-40px;width:260px;height:520px;border-radius:130px 130px 0 0;background:linear-gradient(180deg,#f7e6c6,#e0b476);filter:blur(26px);opacity:.55"></div>
        <div class="abs" style="left:0;right:0;top:300px;height:260px;background:linear-gradient(180deg,rgba(0,0,0,0),#1d1208)"></div>
        <!-- pew seat plank -->
        <div class="abs" style="left:-200px;top:620px;width:2320px;height:520px;background:linear-gradient(180deg,#7a4a22 0%,#5c3617 30%,#3a2210 100%);clip-path:polygon(9% 0,91% 0,100% 100%,0 100%)"></div>
        <div class="abs" style="left:-200px;top:620px;width:2320px;height:16px;background:rgba(255,220,170,.22);clip-path:polygon(9% 0,91% 0,91.4% 100%,8.6% 100%)"></div>
        <div class="abs" style="left:0;right:0;top:636px;height:460px;background:repeating-linear-gradient(90deg,rgba(0,0,0,0) 0 220px,rgba(0,0,0,.12) 220px 226px);opacity:.6"></div>
        <!-- closed Bible -->
        <div class="abs" style="left:300px;top:560px;width:330px;height:430px;perspective:1100px">
          <div class="abs" style="inset:0;transform:rotateX(62deg) rotateZ(-8deg);transform-origin:50% 100%;transform-style:preserve-3d">
            <div class="abs" style="inset:0;background:linear-gradient(135deg,#2b1b12,#140c08);border-radius:8px;box-shadow:0 30px 40px rgba(0,0,0,.6)"></div>
            <div class="abs serif caps" style="left:0;right:0;top:44%;text-align:center;font-size:30px;letter-spacing:.3em;color:#d8ad5c;font-weight:600;text-shadow:0 0 6px rgba(216,173,92,.3)">Библия</div>
            <div class="abs" style="left:14px;right:14px;top:16px;height:2px;background:rgba(216,173,92,.45)"></div>
            <div class="abs" style="left:14px;right:14px;bottom:16px;height:2px;background:rgba(216,173,92,.45)"></div>
          </div>
          <div class="abs" style="left:14px;right:14px;bottom:-8px;height:38px;background:linear-gradient(180deg,#f1e6cf,#cdbb9b);border-radius:0 0 6px 6px;transform:skewX(-8deg)"></div>
        </div>
        <!-- laptop -->
        <div class="abs" style="left:640px;top:250px;width:760px;height:600px;perspective:1700px;perspective-origin:50% 30%">
          <div class="abs base" style="left:0;top:330px;width:760px;height:470px;transform-origin:50% 0;transform:rotateX(-78deg);transform-style:preserve-3d">
            <div class="abs" style="inset:0;background:linear-gradient(180deg,#2b2d33,#1b1c20);border-radius:4px 4px 22px 22px;box-shadow:0 40px 60px rgba(0,0,0,.6)"></div>
            <div class="keys abs" style="left:48px;top:40px;right:48px;height:250px;display:grid;grid-template-columns:repeat(14,1fr);gap:7px"></div>
            <div class="abs" style="left:260px;top:320px;width:240px;height:120px;border-radius:10px;background:#202228;border:1px solid #33353c"></div>
            <div class="sglow abs" style="inset:-40px;background:radial-gradient(ellipse 60% 70% at 50% 0%,rgba(90,160,255,.55),rgba(0,0,0,0) 70%);opacity:0;border-radius:40px"></div>
          </div>
          <div class="abs lid" style="left:0;top:-140px;width:760px;height:470px;transform-origin:50% 100%;transform:rotateX(-92deg);transform-style:preserve-3d">
            <div class="abs" style="inset:0;background:linear-gradient(180deg,#30323a,#202127);border-radius:22px 22px 4px 4px;box-shadow:0 0 0 1px rgba(255,255,255,.06)"></div>
            <div class="scr abs" style="left:28px;top:26px;right:28px;bottom:24px;background:#04070d;border-radius:8px;overflow:hidden">
              <div class="boot abs" style="inset:0;background:radial-gradient(ellipse 70% 60% at 50% 50%,#1b3a63,#06101e 70%);opacity:0"></div>
              <div class="ui abs" style="inset:0;opacity:0;padding:34px 40px;color:#e6edf3">
                <div class="mono" style="font-size:14px;letter-spacing:.2em;color:#58a6ff;display:flex;gap:10px;align-items:center"><span style="width:8px;height:8px;border-radius:50%;background:#2dd4bf;display:inline-block;box-shadow:0 0 10px #2dd4bf"></span>CODE:CODE · АССИСТЕНТ</div>
                <div class="q" style="margin-top:110px;font-size:40px;font-weight:600;line-height:1.25;letter-spacing:-.01em"></div>
                <div class="mono" style="position:absolute;left:40px;right:40px;bottom:34px;height:56px;border-radius:12px;background:#0d1a2b;border:1px solid rgba(88,166,255,.35);display:flex;align-items:center;padding:0 18px;color:#8b949e;font-size:17px">Опишите идею… <i class="caret" style="margin-left:6px"></i></div>
              </div>
            </div>
          </div>
        </div>
        <div class="dust abs" style="inset:0"></div>
      </div>
      <div class="cool abs" style="inset:0;background:radial-gradient(ellipse 45% 50% at 53% 46%,rgba(70,130,230,.22),rgba(0,0,0,0) 70%);opacity:0"></div>
      <div class="abs" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.3),rgba(0,0,0,0) 25%,rgba(0,0,0,0) 75%,rgba(0,0,0,.4))"></div>`;
      const keys = root.querySelector('.keys');
      for (let i = 0; i < 70; i++) el('div', '', '', keys).style.cssText = 'background:#101115;border-radius:4px;border:1px solid #2a2b31';
      const dust = root.querySelector('.dust'); this.dots = [];
      for (let i = 0; i < 30; i++) { const d = el('div', 'abs', '', dust); const sz = 2 + prng(i, 7) * 3; d.style.cssText = `width:${sz}px;height:${sz}px;border-radius:50%;background:#ffe4b5;filter:blur(1px)`; this.dots.push(d); }
      this.cam = root.querySelector('.lcam'); this.lid = root.querySelector('.lid'); this.boot = root.querySelector('.boot'); this.ui = root.querySelector('.ui');
      this.q = root.querySelector('.q'); this.sglow = root.querySelector('.sglow'); this.cool = root.querySelector('.cool');
    },
    render(lt, t, dur) {
      const open = prog(lt, 0.7, 2.1, ease.inOut);            // 10.2–11.6
      tf(this.lid, `rotateX(${lerp(-92, -6, open)}deg)`);
      const boot = prog(lt, 2.2, 2.9, ease.out);               // 11.7–12.4
      op(this.boot, boot); op(this.ui, prog(lt, 2.6, 3.1, ease.out));
      op(this.sglow, boot * 0.9); op(this.cool, boot * 0.9);
      const Q = 'Что будем создавать сегодня?';
      const typing = lt > 2.9 && lt < 3.9;
      this.q.innerHTML = E.esc(typed(Q, lt, 2.9, 3.9)) + (cursorOn(t, typing) ? '<i class="caret" style="background:#f0b35b"></i>' : '');
      // camera: settle, then dive into the screen
      const dive = prog(lt, 2.9, dur, ease.inQuad);
      const s = lerp(1.02, 3.6, dive);
      tf(this.cam, `scale(${s.toFixed(4)}) translate(${(-6 * dive).toFixed(2)}px, ${(10 * dive).toFixed(2)}px)`);
      this.dots.forEach((d, i) => { const u = prng(i, 4), v = prng(i, 5); d.style.left = (1200 + (v * 500) * -0.5 + u * 500 + Math.sin(t + i) * 8) + 'px'; d.style.top = (120 + v * 520 + (t * 7) % 40) + 'px'; d.style.opacity = (0.1 + 0.5 * Math.abs(Math.sin(t * 0.8 + i * 1.7))) * (1 - dive); });
    }
  });
})();
