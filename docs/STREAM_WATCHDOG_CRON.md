# Stream watchdog cron

The current 2AM radio runtime has two watchdog lanes.

## Cloudflare tunnel watchdog

The public 2AM radio pages use a local MacBook proxy on port `8089`, exposed through a Cloudflare Quick Tunnel. The launchd job on Elias’s Mac runs:

```bash
/Users/eliaskarlsson/2am-local-proxy/watchdog.sh
```

That local wrapper mirrors the repo script:

```bash
./scripts/2am_tunnel_watchdog.sh
```

Current behavior:

- checks local proxy health at `http://localhost:8089/healthz`
- checks the published `trycloudflare.com` tunnel through both `/healthz` and a real HLS route
- waits and rechecks once before rotating, so a single DNS/Cloudflare edge hiccup does not burn the public URL
- when a tunnel is genuinely dead, starts a new Quick Tunnel, patches `2amtext.html` and `radiomp3.html`, commits, and pushes `main`
- `FORCE_NEW_TUNNEL=true ./scripts/2am_tunnel_watchdog.sh` intentionally rotates to a fresh tunnel

Important: account-less Cloudflare Quick Tunnels have no uptime guarantee. The durability trick here is not a permanent URL, it is keeping one healthy process alive and rotating only after a double failure. For a truly permanent endpoint, replace this with a Cloudflare named tunnel.

## Audio heartbeat

The old audio-only watchdog remains, but the preferred heartbeat entrypoint is:

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
