# Stream guardian cron

`stream_guardian.py` is now a compatibility aggregate wrapper. The real checks are split:

- audio: `scripts/audio_heartbeat_run.sh`
- visual: `scripts/visual_heartbeat_run.sh --no-frames` for cheap metadata mode
- visual with frame evidence: `scripts/visual_heartbeat_run.sh`

See `docs/STREAM_HEARTBEATS.md` for the current runbook.

Legacy command:

```bash
cd /Users/eliaskarlsson/openclaw/workspaces/projects/elias-portfolio-work
./scripts/stream_guardian_run.sh
```

Outputs:

- `reports/stream_guardian_latest.json`
- `reports/stream_guardian_latest.md`
- `reports/video_fallback_candidates.json`

Exit code:

- `0`: aggregate clean
- `2`: audio or visual issues found
