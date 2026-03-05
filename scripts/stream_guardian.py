#!/usr/bin/env python3
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

import requests

PAGES_2AM = "https://elias-portfolio.github.io/work/2amtext.html"
RAW_2AM = "https://raw.githubusercontent.com/elias-portfolio/work/main/2amtext.html"
PAGES_VIDEO = "https://elias-portfolio.github.io/work/2amvideo-source.html"
RAW_VIDEO = "https://raw.githubusercontent.com/elias-portfolio/work/main/2amvideo-source.html"

OUT_JSON = Path("reports/stream_guardian_latest.json")
OUT_FB = Path("reports/video_fallback_candidates.json")
OUT_MD = Path("reports/stream_guardian_latest.md")


def run(cmd, timeout=30):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)


def fetch_first(urls, must_contain=None):
    errs = []
    for u in urls:
        try:
            r = requests.get(u, timeout=25)
            if r.status_code == 200 and (must_contain is None or must_contain in r.text):
                return u, r.text
            errs.append(f"{u} -> {r.status_code}")
        except Exception as e:
            errs.append(f"{u} -> {e}")
    raise RuntimeError("fetch_first failed: " + " | ".join(errs))


def parse_pairs(block_name, html):
    m = re.search(rf"const\s+{re.escape(block_name)}\s*=\s*\{{(.*?)\}};", html, re.S)
    if not m:
        return {}
    return {k: v for k, v in re.findall(r'"([\-0-9]+)"\s*:\s*"([^"]+)"', m.group(1))}


def check_audio(url):
    evidence = []
    ok = False
    try:
        p = run([
            "curl", "-L", "--max-time", "12", "-r", "0-2048", "-o", "/dev/null", "-s", "-w",
            "%{http_code} %{content_type} %{size_download}", url
        ], timeout=18)
        out = (p.stdout or "").strip().split(" ")
        code = out[0] if out else ""
        ctype = out[1] if len(out) > 1 else ""
        size = int(float(out[2])) if len(out) > 2 and out[2] else 0
        evidence.append(f"curl_range code={code} type={ctype} size={size}")
        if code in ("200", "206") and ("audio" in ctype.lower() or size > 1024):
            ok = True
    except Exception as e:
        evidence.append(f"curl_err {e}")

    try:
        p = run([
            "ffprobe", "-v", "error", "-rw_timeout", "7000000",
            "-show_entries", "format=format_name,bit_rate:format_tags=icy-name,icy-br",
            "-of", "json", url
        ], timeout=14)
        if p.returncode == 0 and p.stdout.strip():
            d = json.loads(p.stdout)
            fmt = d.get("format", {})
            tags = fmt.get("tags", {}) or {}
            evidence.append(f"ffprobe format={fmt.get('format_name','?')} br={fmt.get('bit_rate','?')} icy={tags.get('icy-name','')}")
            ok = True
    except Exception as e:
        evidence.append(f"ffprobe_err {e}")

    return ok, "; ".join(evidence)


def yt_meta(video_id):
    try:
        p = run([
            "yt-dlp", "--skip-download", "--dump-single-json", "--no-warnings",
            f"https://www.youtube.com/watch?v={video_id}"
        ], timeout=25)
        if p.returncode != 0 or not p.stdout.strip():
            return {"ok": False, "error": (p.stderr or "yt-dlp failed")[:180]}
        d = json.loads(p.stdout)
        return {
            "ok": True,
            "live_status": d.get("live_status"),
            "playable_in_embed": d.get("playable_in_embed"),
            "title": d.get("title"),
            "channel": d.get("channel"),
        }
    except Exception as e:
        return {"ok": False, "error": str(e)}


def find_fallback(location_query, current_id):
    # Lightweight search lane: max 8 results
    try:
        p = run([
            "yt-dlp", "--flat-playlist", "--dump-single-json", "--no-warnings",
            f"ytsearch8:{location_query} live webcam"
        ], timeout=40)
        if p.returncode != 0 or not p.stdout.strip():
            return None
        data = json.loads(p.stdout)
        entries = data.get("entries") or []
        for e in entries:
            vid = e.get("id")
            if not vid or vid == current_id:
                continue
            m = yt_meta(vid)
            if m.get("ok") and m.get("live_status") == "is_live" and m.get("playable_in_embed") is True:
                return {
                    "youtube_id": vid,
                    "title": m.get("title", ""),
                    "channel": m.get("channel", ""),
                    "note": f"live+embeddable candidate for {location_query}",
                }
    except Exception:
        return None
    return None


def main():
    src2am_url, html2am = fetch_first([PAGES_2AM, RAW_2AM], must_contain="const radioStreams")
    srcvideo_url, htmlvideo = fetch_first([PAGES_VIDEO, RAW_VIDEO], must_contain="const backgroundStreams")

    radio = parse_pairs("radioStreams", html2am)
    locations = parse_pairs("streamLocations", html2am)
    bgs = parse_pairs("backgroundStreams", htmlvideo)

    # host url check from online page const
    mhost = re.search(r'HOSTED_VIDEO_SOURCE_URL\s*=\s*"([^"]+)"', html2am)
    hosted_url = mhost.group(1) if mhost else None
    hosted_ok = False
    hosted_status = None
    hosted_error = None
    if hosted_url:
        try:
            r = requests.get(hosted_url, timeout=20)
            hosted_status = r.status_code
            hosted_ok = r.status_code == 200 and "backgroundStreams" in r.text
        except Exception as e:
            hosted_error = str(e)

    # audio health
    audio_working, audio_broken = [], []
    for off in sorted(radio.keys(), key=lambda x: int(x)):
        ok, ev = check_audio(radio[off])
        row = {"offset": off, "url": radio[off], "evidence": ev}
        (audio_working if ok else audio_broken).append(row)

    # video health + fallback discovery
    video_ok, video_bad = [], []
    fallbacks = {}

    # Keep discovery bounded so cron stays fast/stable.
    discovery_priority = ["-11", "-9", "2", "4", "5", "6", "7", "11"]
    slot = datetime.now(timezone.utc).hour % len(discovery_priority)
    # rotate two offsets each run
    DISCOVERY_OFFSETS = {
        discovery_priority[slot],
        discovery_priority[(slot + 1) % len(discovery_priority)],
    }

    for off in sorted(bgs.keys(), key=lambda x: int(x)):
        val = bgs[off]
        vm = re.search(r'/embed/([^?"&/]+)', val)
        if not vm:
            continue
        vid = vm.group(1)
        meta = yt_meta(vid)
        row = {"offset": off, "youtube_id": vid, "location": locations.get(off, ""), "meta": meta}
        if meta.get("ok") and meta.get("live_status") == "is_live" and meta.get("playable_in_embed") is True:
            video_ok.append(row)
        else:
            video_bad.append(row)

        # Build fallback candidates for priority offsets only (bounded runtime).
        if off in DISCOVERY_OFFSETS:
            loc_query = locations.get(off, "") or f"GMT {off} city webcam"
            fb = find_fallback(loc_query, vid)
            if fb:
                fallbacks[off] = fb

    report = {
        "tested_at": datetime.now(timezone.utc).isoformat(),
        "sources": {"2am": src2am_url, "video": srcvideo_url},
        "hosted_video_source": {
            "url": hosted_url,
            "ok": hosted_ok,
            "status": hosted_status,
            "error": hosted_error,
        },
        "audio": {
            "total": len(radio),
            "working_count": len(audio_working),
            "broken_count": len(audio_broken),
            "broken": audio_broken,
        },
        "video": {
            "total": len(bgs),
            "ok_count": len(video_ok),
            "bad_count": len(video_bad),
            "bad": video_bad,
        },
        "fallback_candidates_file": str(OUT_FB),
        "fallback_discovery_offsets_this_run": sorted(DISCOVERY_OFFSETS, key=lambda x: int(x)),
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_FB.write_text(json.dumps({
        "generated_at": report["tested_at"],
        "source_video_file": srcvideo_url,
        "candidates": fallbacks,
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    md = [
        "# Stream guardian report",
        "",
        f"- tested_at: {report['tested_at']}",
        f"- audio broken: {report['audio']['broken_count']} / {report['audio']['total']}",
        f"- video bad: {report['video']['bad_count']} / {report['video']['total']}",
        f"- hosted video source ok: {report['hosted_video_source']['ok']}",
        f"- fallback candidates: {len(fallbacks)} offsets",
        "",
    ]
    if report['audio']['broken_count']:
        md.append("## Broken audio")
        for b in report['audio']['broken']:
            md.append(f"- {b['offset']}: {b['url']}")
    if report['video']['bad_count']:
        md.append("## Bad video")
        for b in report['video']['bad']:
            md.append(f"- {b['offset']}: {b['youtube_id']} ({b['meta'].get('live_status')} embed={b['meta'].get('playable_in_embed')})")
    OUT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")

    print(json.dumps({
        "audio_broken": report['audio']['broken_count'],
        "video_bad": report['video']['bad_count'],
        "hosted_ok": report['hosted_video_source']['ok'],
        "fallback_offsets": len(fallbacks),
        "report": str(OUT_JSON)
    }))

    # non-zero if health issue
    if report['audio']['broken_count'] or report['video']['bad_count'] or not report['hosted_video_source']['ok']:
        raise SystemExit(2)


if __name__ == '__main__':
    main()
