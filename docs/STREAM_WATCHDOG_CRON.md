# Stream watchdog cron

## What it does
- Fetches online `2amtext.html` (Pages first, raw GitHub fallback)
- Extracts `radioStreams`
- Tests each stream with GET/range (not HEAD-only)
- Optional ffprobe confidence check
- Writes reports:
  - `reports/stream_watchdog_latest.json`
  - `reports/stream_watchdog_latest.md`

## Run manually
```bash
cd /Users/eliaskarlsson/.openclaw/workspace/work
./scripts/stream_watchdog_run.sh
```

Exit code:
- `0` = all streams OK
- `2` = one or more broken streams

## Kimi cron job prompt pattern
Use a Kimi isolated cron with a message like:

```text
Run:
cd /Users/eliaskarlsson/.openclaw/workspace/work && ./scripts/stream_watchdog_run.sh

If broken_count > 0:
- return short alert with broken offsets + URLs
If all OK:
- return exactly: STREAMS_OK
```
