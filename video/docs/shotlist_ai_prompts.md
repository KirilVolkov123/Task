# Shot list + prompts for live-action regeneration (Veo 3 / Kling 2 / Runway Gen-4)

Рендер в репозитории — motion-graphics-аниматик: реальных людей и фотореалистичных лиц в нём нет (в этой
среде нет генеративной видеомодели). Ниже — покадровый план с готовыми промптами, чтобы заменить сцены
живыми кадрами, не меняя тайминг, музыку и озвучку (`video/out/audio/mix.wav`, таймкоды — `src/timeline.json`).

Общие ограничения для каждого промпта (добавлять в конец):

> Realistic documentary cinematography, 16:9, natural window light, warm color grade, handheld-steady,
> shallow depth of field, modest Eastern European Protestant prayer hall (plain walls, wooden pews, Bibles,
> no crucifix, no icons, no stained-glass saints, no candles). Volunteers in their 20s: men in plain shirts,
> women in modest dresses with headscarves. Ordinary laptops. No cyberpunk, no neon clothing, no charismatic
> worship gestures, no text overlays. Realistic faces, natural motion.

| # | Время | Длит. | Сцена (аниматик) | Промпт для генерации живого кадра | Движение камеры |
|---|-------|-------|------------------|-----------------------------------|-----------------|
| 1 | 0:00–0:05 | 5 с | Молитвенный зал, свет из окон | Wide shot of a quiet, simple Protestant prayer hall after the service: rows of wooden pews, soft morning light through tall plain windows, dust in the sunbeam, an open Bible left on a pew, painted verse "БОГ ЕСТЬ ЛЮБОВЬ" on the plain back wall. Empty, peaceful. | Slow push-in |
| 2 | 0:05–0:09.5 | 4.5 с | Библия, 1 Петра 4:10 | Macro close-up of hands of a young man in a plain shirt turning a page of a worn Russian Synodal Bible; the verse 1 Peter 4:10 is underlined in pencil; warm window light falls across the page. | Slow tilt down, rack focus |
| 3 | 0:09.5–0:14 | 4.5 с | Ноутбук открывается на скамье | A young woman in a modest dress and headscarf sits on a wooden pew, sets an ordinary laptop beside her Bible and opens the lid; the screen lights her face with a soft blue glow while warm window light fills the hall behind. | Static, then push-in toward the screen (ends tight on screen) |
| 4 | 0:14–0:17.75 | 3.75 с | Редактор + ИИ-ассистент | Over-the-shoulder of a young man typing a request into an AI coding assistant on a laptop in the church side room; lines of HTML appear quickly on screen; Bible and notebook on the table. | Handheld, fast punch-ins on the beat |
| 5 | 0:17.75–0:21.5 | 3.75 с | Сайт церкви запущен | Two volunteers (a man and a woman in a headscarf) look at a laptop showing a clean, warm church website with a service schedule; the woman taps "Записаться" and smiles; a phone shows the same page. | Slow dolly in |
| 6 | 0:21.5–0:25.25 | 3.75 с | Telegram-бот | Close-up of a smartphone held by a young volunteer: a Telegram bot for the church sends a service reminder with two buttons; in the background a laptop with Python code. | Rack focus phone → laptop |
| 7 | 0:25.25–0:29 | 3.75 с | Система регистрации | A young woman volunteer at a folding table in the church foyer registers a teenager for a youth camp on a laptop; a counter on a second screen rises; a list of names fills; both smile. | Medium, slight handheld |
| 8 | 0:29–0:32.75 | 3.75 с | График служения | A young man shows a volunteer-schedule grid on a laptop to an older deacon in a plain suit; name cards fill the cells automatically; the deacon nods approvingly. | Two-shot, slow push |
| 9 | 0:32.75–0:36.5 | 3.75 с | Команда | Four young volunteers around one table with laptops in the church hall, pointing at a screen, one explaining, another laughing quietly; a kettle and tea cups nearby. | Orbit 30° |
| 10 | 0:36.5–0:40.25 | 3.75 с | Запуск | A terminal shows a deploy finishing; a young man presses Enter; the team quietly fist-bumps; a phone on the table lights up with a Telegram notification "Сайт запущен". | Snap zoom on Enter key |
| 11 | 0:40.25–0:44 | 3.75 с | Юмор: «сохраните файл» | A puzzled young man stares at a laptop, reads the assistant's reply "Проверьте, сохранён ли файл", presses Ctrl+S, the page works; he laughs and covers his face; a friend pats his shoulder. | Static medium close-up |
| 12 | 0:44–0:47.75 | 3.75 с | Новичок | A middle-aged accountant in a plain sweater shyly sits down next to the young team; a volunteer hands him a laptop and shows the first step; warm light, gentle smiles. | Slow push-in |
| 13 | 0:47.75–0:51.5 | 3.75 с | Сборка (билд-ап) | Rapid montage of close-ups: hands on keyboards, a screen scrolling code, a phone notification, the schedule grid, the Bible on the pew, faces lit by screens — accelerating to a white flash. | Whip pans, accelerating cuts |
| 14 | 0:51.5–0:55.25 | 3.75 с | Титр | (Keep the rendered title card: МИНИСТЕРСТВО CODE:CODE — ОТДЕЛ ВАЙБ-КОДИНГА.) Optional plate: the empty prayer hall at dusk, laptops closed on the front pew. | Static |
| 15 | 0:55.25–1:00 | 4.75 с | Слоган | (Keep the rendered slogan card: Технологии на служении церкви.) | Static, fade to black |

Монтаж: жёсткие склейки на долях такта (128 BPM, такт 1.875 с, дроп на 14.0 с), короткая белая вспышка на
каждой склейке монтажной части, «панч-зум» ~3 % на сильную долю. Кульминация и титр — 51.5 с.
