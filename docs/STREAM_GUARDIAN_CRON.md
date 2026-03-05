# Stream guardian cron

## Purpose
`stream_guardian` does three things in one run:
1. Checks for broken links in online `2amtext.html` audio streams.
2. Verifies the hosted video source URL (Tailscale/Cloudflare-facing source) is reachable.
3. Scans selected location offsets for new embeddable live YouTube fallback candidates and writes JSON.

## Commands
Run manually:

```bash
cd /Users/eliaskarlsson/.openclaw/workspace/work
./scripts/stream_guardian_run.sh
```

Outputs:
- `reports/stream_guardian_latest.json`
- `reports/stream_guardian_latest.md`
- `reports/video_fallback_candidates.json`

Exit code:
- `0`: no health issues found
- `2`: one or more issues found (audio/video/hosted source)

## Kimi cron pattern
Use an isolated Kimi cron job message like:

```text
Run:
cd /Users/eliaskarlsson/.openclaw/workspace/work && ./scripts/stream_guardian_run.sh

Then read reports/stream_guardian_latest.json and reports/video_fallback_candidates.json.
If audio.broken_count > 0 OR video.bad_count > 0 OR hosted_video_source.ok is false:
- return ALERT with short bullets.
Else:
- return GUARDIAN_OK plus number of fallback candidates discovered this run.
```
