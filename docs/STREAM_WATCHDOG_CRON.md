# Stream watchdog cron

The old audio-only watchdog remains, but the current preferred entrypoint is:

```bash
cd /Users/eliaskarlsson/openclaw/workspaces/projects/elias-portfolio-work
./scripts/audio_heartbeat_run.sh
```

See `docs/STREAM_HEARTBEATS.md`.

Current audio heartbeat outputs:

- `reports/audio_heartbeat_latest.json`
- `reports/audio_heartbeat_latest.md`

Exit code:

- `0`: all configured audio streams responded
- `2`: one or more audio streams failed
