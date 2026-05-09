#!/bin/bash
# 2AM Radio Proxy Watchdog
# Kontrollerar att Node-proxyn (port 8089) körs och att Cloudflare-tunneln svarar.
# Om proxyn är nere, starta om den.
# Om tunneln är nere eller URL:en har ändrats, starta ny tunnel och uppdatera GitHub.

LOG="/Users/eliaskarlsson/2am-local-proxy/watchdog.log"
PROXY_DIR="/Users/eliaskarlsson/2am-local-proxy"
WORK_DIR="/Users/eliaskarlsson/openclaw/workspaces/projects/elias-portfolio-work"
TUNNEL_URL_FILE="/Users/eliaskarlsson/2am-local-proxy/.tunnel_url"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

TEST_VIDEO="vytmBNhc9ig"
HEALTH_URL="http://localhost:8089/healthz"
TARGET_FILES=("2amtext.html" "radiomp3.html" "stream-data.json")
STREAM_PROBE_PATH="/stream/${TEST_VIDEO}/index.m3u8"
FORCE_NEW_TUNNEL="${FORCE_NEW_TUNNEL:-false}"

validate_public_2amtext() {
    local f="2amtext.html"

    [ -f "$f" ] || return 0

    if grep -qE 'https://(www\.)?youtube\.com/embed' "$f"; then
        echo "[$TIMESTAMP] FAIL: 2amtext.html contains direct YouTube embeds; refusing to publish broken portfolio variant" >> "$LOG"
        return 1
    fi

    if ! grep -q 'id="bg-frame"' "$f" || grep -q 'id="bg-stream-iframe"' "$f" || grep -q '<title>Always 2AM Radio</title>' "$f"; then
        echo "[$TIMESTAMP] FAIL: 2amtext.html is not the desktop structure; refusing to publish mobile/radiomp3 variant" >> "$LOG"
        return 1
    fi

    if ! grep -qE 'https://[a-z0-9-]+\.trycloudflare\.com/stream/' "$f"; then
        echo "[$TIMESTAMP] FAIL: 2amtext.html has no Cloudflare HLS /stream/ URLs; refusing to publish" >> "$LOG"
        return 1
    fi
}

publish_tunnel_url() {
    local new_url="$1"
    local old_url="${2:-}"
    local new_host

    if [ -z "$new_url" ]; then
        echo "[$TIMESTAMP] FAIL: publish_tunnel_url saknar URL" >> "$LOG"
        return 1
    fi

    if [ ! -d "$WORK_DIR/.git" ]; then
        echo "[$TIMESTAMP] FAIL: WORK_DIR saknar git-repo: $WORK_DIR" >> "$LOG"
        return 1
    fi

    cd "$WORK_DIR" || return 1
    new_host=$(echo "$new_url" | sed 's|https://||')

    # Keep the portfolio checkout current before the watchdog edits/pushes.
    # This avoids stale local commits blocking tunnel URL publication.
    git fetch origin main >> "$LOG" 2>&1 || return 1
    git merge --ff-only origin/main >> "$LOG" 2>&1 || return 1

    for f in "${TARGET_FILES[@]}"; do
        if [ -f "$f" ]; then
            perl -0pi -e 's#https://[a-z0-9-]+\.trycloudflare\.com#'"$new_url"'#g' "$f"
        fi
    done

    validate_public_2amtext || return 1

    git add "${TARGET_FILES[@]}" 2>/dev/null
    if ! git diff --cached --quiet; then
        if [ -n "$old_url" ] && [ "$old_url" != "$new_url" ]; then
            echo "[$TIMESTAMP] URL ändrad: $old_url -> $new_url — uppdaterar GitHub" >> "$LOG"
        else
            echo "[$TIMESTAMP] Publicerad URL saknade aktuell tunnel — uppdaterar GitHub till $new_url" >> "$LOG"
        fi
        git commit -m "Update Cloudflare tunnel URL to ${new_host}" >> "$LOG" 2>&1
        git push origin main >> "$LOG" 2>&1
        echo "[$TIMESTAMP] GitHub uppdaterad med tunnel-URL" >> "$LOG"
    fi
}

host_from_url() {
    echo "$1" | sed -E 's#^https?://##; s#/.*$##'
}

resolve_host_via_cf() {
    local host="$1"
    dig @1.1.1.1 +short "$host" | grep -E '^[0-9.]+$' | head -1
}

check_tunnel_http_code() {
    local url="$1"
    local path="${2:-/healthz}"
    local host ip
    host=$(host_from_url "$url")
    [ -z "$host" ] && return 1
    ip=$(resolve_host_via_cf "$host")
    [ -z "$ip" ] && return 1
    curl -s --connect-timeout 5 --max-time 10 -o /dev/null -w "%{http_code}" --resolve "${host}:443:${ip}" "https://${host}${path}" 2>/dev/null
}

check_tunnel_ok() {
    local url="$1"
    local health_code stream_code

    health_code=$(check_tunnel_http_code "$url" "/healthz" || true)
    [ "$health_code" = "200" ] || return 1

    # Exercise the real HLS proxy route too. A 302 to Google HLS is the normal
    # healthy response, while 200 is accepted for any directly served probe.
    stream_code=$(check_tunnel_http_code "$url" "$STREAM_PROBE_PATH" || true)
    [ "$stream_code" = "200" ] || [ "$stream_code" = "302" ] || return 1
}

# 1. Kolla om Node-proxyn körs
if ! curl -s --max-time 5 -o /dev/null "$HEALTH_URL"; then
    echo "[$TIMESTAMP] Proxy nere — startar om" >> "$LOG"
    pkill -f "node.*2am-local-proxy/server.js" 2>/dev/null
    sleep 1
    cd "$PROXY_DIR"
    nohup node server.js >> server.log 2>&1 &
    sleep 3

    if ! curl -s --max-time 5 -o /dev/null "$HEALTH_URL"; then
        echo "[$TIMESTAMP] FAIL: Proxy startade inte" >> "$LOG"
        exit 1
    fi
    echo "[$TIMESTAMP] Proxy omstartad" >> "$LOG"
fi

# 2. Läs sparad tunnel-URL
CURRENT_URL=""
if [ -f "$TUNNEL_URL_FILE" ]; then
    CURRENT_URL=$(cat "$TUNNEL_URL_FILE")
fi

# 3. Kolla om tunneln svarar
TUNNEL_OK=false
if [ -n "$CURRENT_URL" ] && [ "$FORCE_NEW_TUNNEL" != "true" ]; then
    if check_tunnel_ok "$CURRENT_URL"; then
        TUNNEL_OK=true
    else
        # Quick Tunnels sometimes have short DNS/edge hiccups. Do not burn the
        # public URL on a single miss. Recheck once before rotating.
        sleep 15
        if check_tunnel_ok "$CURRENT_URL"; then
            TUNNEL_OK=true
        fi
    fi
fi

if [ "$TUNNEL_OK" = true ]; then
    publish_tunnel_url "$CURRENT_URL" "$CURRENT_URL"
    exit 0
fi

if [ "$FORCE_NEW_TUNNEL" = "true" ]; then
    echo "[$TIMESTAMP] Forcerar ny tunnel (gammal URL: ${CURRENT_URL:-ingen})" >> "$LOG"
else
    echo "[$TIMESTAMP] Tunnel nere efter dubbelkontroll (URL: ${CURRENT_URL:-ingen}) — startar ny" >> "$LOG"
fi

# 4. Döda gamla cloudflared-processer mot port 8089
pkill -f "cloudflared tunnel --url http://127.0.0.1:8089" 2>/dev/null
sleep 2

# 5. Starta ny Quick Tunnel och fånga URL
TUNNEL_LOG=$(mktemp)
nohup bash -lc 'cloudflared tunnel --url http://127.0.0.1:8089 > >(tee -a "'$PROXY_DIR'/cloudflared.log" "'$TUNNEL_LOG'") 2>&1' >/dev/null 2>&1 &
TUNNEL_PID=$!

# Vänta på att URL:en dyker upp i loggen (max 30 sek)
NEW_URL=""
for i in $(seq 1 30); do
    NEW_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | head -1)
    if [ -n "$NEW_URL" ]; then
        break
    fi
    sleep 1
done

rm -f "$TUNNEL_LOG"

if [ -z "$NEW_URL" ]; then
    echo "[$TIMESTAMP] FAIL: Kunde inte fånga ny tunnel-URL" >> "$LOG"
    exit 1
fi

echo "[$TIMESTAMP] Ny tunnel: $NEW_URL" >> "$LOG"

# Vänta tills tunneln faktiskt svarar innan vi publicerar den
NEW_TUNNEL_OK=false
for i in $(seq 1 20); do
    if check_tunnel_ok "$NEW_URL"; then
        NEW_TUNNEL_OK=true
        break
    fi
    sleep 2
done

if [ "$NEW_TUNNEL_OK" != true ]; then
    echo "[$TIMESTAMP] FAIL: Ny tunnel svarade inte stabilt på /healthz — publicerar inte URL" >> "$LOG"
    exit 1
fi

echo "$NEW_URL" > "$TUNNEL_URL_FILE"

# 6. Om URL:en ändrats, uppdatera publika filer och pusha till GitHub
if [ "$NEW_URL" != "$CURRENT_URL" ]; then
    publish_tunnel_url "$NEW_URL" "${CURRENT_URL:-ingen}" || exit 1
fi
