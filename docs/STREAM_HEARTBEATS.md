# 2AM RADIO heartbeats

2AM RADIO now has separate checks for audio and visuals.

## Audio heartbeat

```bash
cd /Users/eliaskarlsson/openclaw/workspaces/projects/elias-portfolio-work
./scripts/audio_heartbeat_run.sh
```

Outputs:

- `reports/audio_heartbeat_latest.json`
- `reports/audio_heartbeat_latest.md`

Exit codes:

- `0`: all configured audio streams responded
- `2`: one or more audio streams failed

## Visual heartbeat

Cheap metadata mode:

```bash
./scripts/visual_heartbeat_run.sh --no-frames
```

Frame evidence mode:

```bash
./scripts/visual_heartbeat_run.sh
```

Frame mode validates YouTube live + embeddable metadata, then uses `yt-dlp -g` and `ffmpeg` to grab a real frame where possible. Image-refresh sources are downloaded as still frames. This gives the same operational evidence as screenshots without launching a full browser for every slot.

Outputs:

- `reports/visual_heartbeat_latest.json`
- `reports/visual_heartbeat_latest.md`
- `reports/visual_heartbeat_frames/offset-*-candidate-*.jpg`

Exit codes:

- `0`: every visual slot has at least one working primary or fallback
- `2`: one or more visual slots have no working candidate

## Fallback system

Fallbacks live in `stream-data.json` under `videoFallbackStreams`, and in `2amtext.html` under `backgroundFallbackStreams` for the static page runtime.

Runtime behavior in `2amtext.html`:

1. Try the primary background source for the timezone.
2. If an HLS/video/image/iframe source errors or stays slow for ~18 seconds, try the next fallback.
3. Keep the first candidate that plays or loads.

The legacy `scripts/stream_guardian.py` still exists as an aggregate wrapper for old cron callers, but new cron jobs should call the two heartbeat scripts separately.
