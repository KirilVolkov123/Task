# CODE:CODE — промо-ролик (60 с, 1920×1080, 30 fps)

Рекламный ролик вайб-кодинг-служения **CODE:CODE** для консервативной протестантской церкви.
Готовый файл: **`video/out/codecode_promo_60s.mp4`** (H.264 + AAC). Постер: `video/out/poster.jpg`.

Структура:

- 0:00–0:14 — тихий молитвенный дом, Библия (1 Петра 4:10), ноутбук открывается, фортепиано;
- 0:14–0:51.5 — дроп (128 BPM), монтаж: сайт церкви, Telegram-бот, регистрация, график служения,
  команда, запуск, юмор, новички, билд-ап;
- 0:51.5 — кульминация и титр «МИНИСТЕРСТВО CODE:CODE — ОТДЕЛ ВАЙБ-КОДИНГА»;
- 0:55.3 — слоган «Технологии на служении церкви», затухание.

Русская озвучка — нейросетевой голос Piper (`ru_RU-ruslan-medium`), текст и таймкоды в
`docs/voiceover_script.md`, субтитры — `docs/subtitles_ru.srt`.

## Что здесь честно, а что нет

Это **motion-graphics-аниматик**: все сцены — интерфейсы, типографика и стилизованные пространства,
без живых людей. Фотореалистичные лица и документальные кадры требуют генеративной видеомодели
(Veo / Kling / Runway), которой в среде сборки не было. Готовые покадровые промпты для замены сцен
живым видео при том же тайминге — `docs/shotlist_ai_prompts.md`.

## Как пересобрать

```bash
cd video/src
python3 -m pip install numpy scipy        # звук
python3 audio.py ../out/audio             # → music.wav, vo.wav, mix.wav
node render.js --out ../out/frames        # нужен playwright + chromium (require('playwright'))
ffmpeg -y -framerate 30 -i ../out/frames/f%05d.png -i ../out/audio/mix.wav \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest \
  -movflags +faststart ../out/codecode_promo_60s.mp4
```

Проверить отдельный кадр: `node render.js --stills 7.2,15.6,52.9 --out ../out/stills`
или открыть `src/index.html?t=15.6` в браузере (`?play=1` — воспроизведение в реальном времени).

Озвучку можно перегенерировать Piper'ом (голоса `ru_RU-ruslan-medium` / `ru_RU-dmitri-medium`):

```bash
pip install piper-tts
echo "В нашей церкви начинается новое служение." | piper -m ru_RU-ruslan-medium.onnx -f vo_1_ruslan.wav
```

## Файлы

| Путь | Что это |
|------|---------|
| `src/timeline.json` | единая сетка: сцены, BPM, дроп, озвучка, SFX |
| `src/engine.js` | детерминированный рендер `render(t)`: easing, печать кода, подсветка, зерно |
| `src/scenes_a.js`, `scenes_b.js`, `scenes_c.js` | 15 сцен |
| `src/style.css`, `src/index.html` | стили и оболочка |
| `src/render.js` | Playwright-рендер кадров и стоп-кадров |
| `src/audio.py` | синтез музыки и SFX, дакинг под голос |
| `assets/fonts` | Playfair Display, Manrope, JetBrains Mono (Google Fonts, OFL) |
| `assets/vo` | озвучка (4 реплики × 2 голоса) |
| `docs/` | сценарий, субтитры, шот-лист с промптами |
