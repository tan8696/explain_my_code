#!/bin/bash
# Poster -> brag.jpg, baked in as frame 0 (replacing it, so duration and sync are unchanged), then mux the soundtrack.
set -euo pipefail
cd "$(dirname "$0")"
F=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
POSTER_T=${1:-4.8}
node render.js stills "$POSTER_T" > /dev/null 2>&1
P=stills/t-$(printf '%.3f' "$POSTER_T").png
$F -y -loglevel error -i "$P" -q:v 2 ../brag.jpg
$F -y -loglevel error -i silent.mp4 -loop 1 -i "$P" -i soundtrack.wav \
  -filter_complex "[1:v]format=yuv420p[p];[0:v][p]overlay=enable='eq(n,0)':shortest=1,format=yuv420p[v]" \
  -map "[v]" -map 2:a -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest ../brag.mp4
echo done
