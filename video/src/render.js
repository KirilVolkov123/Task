/* Renders frames (or QA stills) of the CODE:CODE promo with Playwright/Chromium.
   node render.js --out ../out/frames                 # all frames
   node render.js --stills 0.5,7,12,15 --out ../out/stills
   node render.js --start 14 --end 18 --out ../out/frames   # range (seconds)             */
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path'); const os = require('os');

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true] : null).filter(Boolean));
const TL = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf8'));
fs.writeFileSync(path.join(__dirname, 'timeline.js'), 'window.TL = ' + JSON.stringify(TL) + ';\n');
const OUT = path.resolve(__dirname, args.out || '../out/frames'); fs.mkdirSync(OUT, { recursive: true });
const WORKERS = parseInt(args.workers || Math.max(1, Math.min(os.cpus().length, 6)), 10);
const FPS = TL.fps;
const url = 'file://' + path.join(__dirname, 'index.html');

async function newPage(browser) {
  const page = await browser.newPage({ viewport: { width: TL.width, height: TL.height }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto(url); await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.render(0)); await page.waitForTimeout(100);
  return page;
}
(async () => {
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-gpu-vsync'] });
  const t0 = Date.now();
  if (args.stills) {
    const page = await newPage(browser);
    for (const s of String(args.stills).split(',')) {
      const t = parseFloat(s); await page.evaluate(t => window.render(t), t);
      const f = path.join(OUT, `still_${t.toFixed(2).replace('.', '_')}.png`);
      await page.screenshot({ path: f, type: 'png' }); console.log('still', t, f);
    }
    await browser.close(); return;
  }
  const start = Math.round((parseFloat(args.start) || 0) * FPS);
  const end = Math.round((args.end ? parseFloat(args.end) : TL.duration) * FPS);
  const frames = []; for (let f = start; f < end; f++) frames.push(f);
  const chunk = Math.ceil(frames.length / WORKERS); let done = 0;
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const mine = frames.slice(w * chunk, (w + 1) * chunk); if (!mine.length) return;
    // one Chromium per worker: screenshots of several pages in one browser serialize on the compositor
    const own = w === 0 ? browser : await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-gpu-vsync'] });
    const page = await newPage(own);
    for (const f of mine) {
      const t = f / FPS;
      await page.evaluate(t => window.render(t), t);
      await page.screenshot({ path: path.join(OUT, `f${String(f).padStart(5, '0')}.png`), type: 'png' });
      if (++done % 100 === 0) console.log(`${done}/${frames.length} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    await page.close(); if (own !== browser) await own.close();
  }));
  await browser.close();
  console.log(`done ${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s → ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
