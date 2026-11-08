#!/usr/bin/env bash
# Assemble the final MP4 from rendered frames + mixed audio, plus poster, contact sheet and mp3.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; OUT="$HERE/../out"
FR="$OUT/frames"; AU="$OUT/audio/mix.wav"; MP4="$OUT/codecode_promo_60s.mp4"
ffmpeg -y -loglevel error -framerate 30 -i "$FR/f%05d.png" -i "$AU" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -level 4.1 \
  -x264-params "keyint=60:min-keyint=30" -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 44100 -shortest -movflags +faststart "$MP4"
ffmpeg -y -loglevel error -ss 52.9 -i "$MP4" -frames:v 1 -q:v 2 "$OUT/poster.jpg"
ffmpeg -y -loglevel error -i "$MP4" -vf "fps=1/2,scale=320:-1,tile=6x5" -frames:v 1 "$OUT/contact_sheet.jpg"
ffmpeg -y -loglevel error -i "$AU" -c:a libmp3lame -b:a 192k "$OUT/audio/soundtrack_mix.mp3"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of default=nw=1 "$MP4"
ls -la "$MP4" "$OUT/poster.jpg" "$OUT/contact_sheet.jpg"
