#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

OUT_DIR="/Users/eliaskarlsson/.openclaw/workspace/work/hls-temp"
LOG_DIR="./logs"
mkdir -p "$OUT_DIR" "$LOG_DIR"

# keep it geographically relevant (no lofi)
STREAM1="https://www.youtube.com/watch?v=cVpdwCQ7LEc"  # Kingston
STREAM2="https://www.youtube.com/watch?v=yuIm1V7Ne7I"  # London

URL1=$(yt-dlp -g -f "best[height<=480]" "$STREAM1" 2>/dev/null | head -1 || true)
URL2=$(yt-dlp -g -f "best[height<=480]" "$STREAM2" 2>/dev/null | head -1 || true)

if [[ -z "$URL1" || -z "$URL2" ]]; then
  echo "[$(date)] FAIL: could not fetch source URLs" | tee -a "$LOG_DIR/hls_live.log"
  exit 1
fi

rm -f "$OUT_DIR"/*.ts "$OUT_DIR"/*.m3u8 "$OUT_DIR"/test.html

cat > "$OUT_DIR/test.html" << 'HTML'
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>2AM live temp</title><style>html,body{margin:0;background:#000;height:100%}video{width:100vw;height:100vh;object-fit:cover}</style></head><body><video id="v" autoplay muted playsinline controls></video><script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script><script>const v=document.getElementById('v');const src='stream.m3u8';if(v.canPlayType('application/vnd.apple.mpegurl')){v.src=src;v.play()}else if(Hls.isSupported()){const h=new Hls();h.loadSource(src);h.attachMedia(v);h.on(Hls.Events.MANIFEST_PARSED,()=>v.play())}</script></body></html>
HTML

FILTER="
[0:v]scale=1280:720,setsar=1[v0];
[1:v]scale=1280:720,setsar=1[v1];
[v0][v1]xfade=transition=fade:duration=1:offset=29[outv];
[0:a][1:a]acrossfade=d=1[outa]
"

echo "[$(date)] START hls_live -> $OUT_DIR/stream.m3u8" | tee -a "$LOG_DIR/hls_live.log"
exec ffmpeg \
  -re -i "$URL1" \
  -i "$URL2" \
  -filter_complex "$FILTER" \
  -map "[outv]" -map "[outa]" \
  -c:v libx264 -preset veryfast -tune zerolatency \
  -b:v 2000k -maxrate 2000k -bufsize 4000k \
  -pix_fmt yuv420p -g 60 -keyint_min 60 \
  -c:a aac -b:a 128k -ar 44100 \
  -f hls -hls_time 2 -hls_list_size 6 -hls_flags delete_segments+append_list \
  -hls_segment_filename "$OUT_DIR/segment_%03d.ts" \
  "$OUT_DIR/stream.m3u8" \
  2>> "$LOG_DIR/ffmpeg_hls_live.log"
