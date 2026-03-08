# HLS temp live (MacBook source)

Temporary live feed generated locally on MacBook and served from `work/`.

## Start

```bash
/Users/eliaskarlsson/.openclaw/workspace/work/scripts/hls_live.sh
```

This writes HLS output to:

- `hls-temp/stream.m3u8`
- `hls-temp/segment_*.ts`
- `hls-temp/test.html`

## Playback

- Local: `http://localhost:8765/hls-temp/test.html`
- Playlist: `http://localhost:8765/hls-temp/stream.m3u8`

## Notes

- Source is streamed from MacBook (ffmpeg + yt-dlp).
- Keep `hls-temp/` ignored in git (runtime artifacts).
- Use cron watchdog to auto-restart when down.
