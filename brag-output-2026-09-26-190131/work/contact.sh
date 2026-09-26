#!/bin/bash
# contact.sh out.png t1 t2 ... (even count) -> 2-column contact sheet at half size
F=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
out=$1; shift; n=$#; ins=""; fc=""; i=0
for t in "$@"; do ins="$ins -i stills/t-$(printf '%.3f' $t).png"; fc="$fc[$i]scale=960:540[s$i];"; i=$((i+1)); done
rows=""; r=0
for ((j=0;j<n;j+=2)); do fc="$fc[s$j][s$((j+1))]hstack[r$r];"; rows="$rows[r$r]"; r=$((r+1)); done
fc="$fc${rows}vstack=inputs=$r"
$F -y -loglevel error $ins -filter_complex "$fc" "$out" && echo "$out"
