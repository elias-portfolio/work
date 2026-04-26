#!/usr/bin/env python3
"""Visual heartbeat for 2AM RADIO.

Validates primary and fallback visual sources independently from audio.  For YouTube
streams it verifies live+embeddable metadata and, when possible, grabs a real frame
with yt-dlp + ffmpeg. For image-refresh sources it downloads the live image.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
STREAM_DATA = ROOT / "stream-data.json"
REPORT_JSON = ROOT / "reports/visual_heartbeat_latest.json"
REPORT_MD = ROOT / "reports/visual_heartbeat_latest.md"
FRAME_DIR = ROOT / "reports/visual_heartbeat_frames"


def run(cmd: list[str], timeout: int = 30) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)


def yt_id_from_url(url: str) -> str | None:
    m = re.search(r"(?:youtube\.com/embed/|youtube\.com/watch\?v=|youtu\.be/)([^?&/]+)", url)
    return m.group(1) if m else None


def source_url(source: dict[str, Any] | str) -> str | None:
    if isinstance(source, str):
        return source
    return source.get("embed_url") or source.get("image_url") or source.get("url")


def normalized_sources(primary: Any, fallbacks: list[Any]) -> list[Any]:
    seen: set[str] = set()
    out: list[Any] = []
    for item in [primary, *fallbacks]:
        key = json.dumps(item, sort_keys=True, ensure_ascii=False) if not isinstance(item, str) else item
        if item and key not in seen:
            seen.add(key)
            out.append(item)
    return out


def capture_url_frame(url: str, out_path: Path, timeout: int = 35) -> tuple[bool, str]:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        return False, "ffmpeg missing"
    p = run([ffmpeg, "-y", "-hide_banner", "-loglevel", "error", "-rw_timeout", "12000000", "-i", url, "-frames:v", "1", str(out_path)], timeout=timeout)
    if p.returncode == 0 and out_path.exists() and out_path.stat().st_size > 1000:
        return True, f"frame={out_path} bytes={out_path.stat().st_size}"
    return False, (p.stderr or p.stdout or "ffmpeg failed")[:220]


def check_youtube(video_id: str, out_path: Path, capture_frames: bool) -> tuple[bool, dict[str, Any]]:
    yt_dlp = shutil.which("yt-dlp")
    if not yt_dlp:
        return False, {"reason": "yt-dlp missing"}

    url = f"https://www.youtube.com/watch?v={video_id}"
    p = run([yt_dlp, "--skip-download", "--dump-single-json", "--no-warnings", url], timeout=45)
    if p.returncode != 0 or not p.stdout.strip():
        return False, {"reason": (p.stderr or p.stdout or "yt-dlp metadata failed")[:220]}

    meta = json.loads(p.stdout)
    ok_meta = meta.get("live_status") == "is_live" and meta.get("playable_in_embed") is True
    evidence: dict[str, Any] = {
        "id": video_id,
        "title": meta.get("title"),
        "channel": meta.get("channel"),
        "live_status": meta.get("live_status"),
        "playable_in_embed": meta.get("playable_in_embed"),
    }
    if not ok_meta:
        evidence["reason"] = "not live+embeddable"
        return False, evidence

    if capture_frames:
        gp = run([yt_dlp, "-g", "-f", "best[height<=720]/best", "--no-warnings", url], timeout=45)
        media_url = (gp.stdout or "").splitlines()[0].strip() if gp.returncode == 0 else ""
        if media_url:
            frame_ok, frame_evidence = capture_url_frame(media_url, out_path)
            evidence["frame"] = frame_evidence
            return frame_ok, evidence
        evidence["frame"] = (gp.stderr or "could not resolve media url")[:220]
        return False, evidence

    return True, evidence


def check_image(url: str, out_path: Path) -> tuple[bool, dict[str, Any]]:
    try:
        r = requests.get(url, headers={"User-Agent": "2am-radio-visual-heartbeat/1.0"}, timeout=20)
        out_path.write_bytes(r.content)
        ctype = r.headers.get("content-type", "")
        ok = r.status_code == 200 and "image" in ctype.lower() and out_path.stat().st_size > 1000
        return ok, {"url": url, "status": r.status_code, "content_type": ctype, "frame": str(out_path), "bytes": out_path.stat().st_size}
    except Exception as exc:
        return False, {"url": url, "reason": str(exc)}


def check_iframe(url: str) -> tuple[bool, dict[str, Any]]:
    try:
        r = requests.get(url, headers={"User-Agent": "2am-radio-visual-heartbeat/1.0"}, timeout=20)
        ctype = r.headers.get("content-type", "")
        ok = r.status_code == 200 and ("html" in ctype.lower() or len(r.content) > 1000)
        return ok, {"url": url, "status": r.status_code, "content_type": ctype, "bytes": len(r.content)}
    except Exception as exc:
        return False, {"url": url, "reason": str(exc)}


def check_source(offset: str, idx: int, source: Any, capture_frames: bool) -> tuple[bool, dict[str, Any]]:
    safe_offset = offset.replace("-", "minus")
    out_path = FRAME_DIR / f"offset-{safe_offset}-candidate-{idx}.jpg"
    url = source_url(source)
    source_type = source.get("type") if isinstance(source, dict) else None

    if source_type == "image-refresh" or (url and re.search(r"\.(jpg|jpeg|png)(\?|$)", url, re.I)):
        ok, ev = check_image(url, out_path)
        ev["kind"] = "image-refresh"
        return ok, ev

    video_id = source.get("id") if isinstance(source, dict) and source.get("type") == "youtube" else (yt_id_from_url(url or ""))
    if video_id:
        ok, ev = check_youtube(video_id, out_path, capture_frames)
        ev["kind"] = "youtube"
        return ok, ev

    if url and url.endswith(".m3u8"):
        ok, ev = capture_url_frame(url, out_path)
        return ok, {"kind": "hls", "url": url, "frame": ev}

    if url == "shors-refresh":
        return check_image("https://www.shors.ru/images/camera/image96.jpg", out_path)

    if url and source_type in {"iframe", "generic"}:
        ok, ev = check_iframe(url)
        ev["kind"] = source_type
        return ok, ev

    return False, {"kind": "unknown", "url": url, "reason": "no visual checker for this source"}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--no-frames", action="store_true", help="Only validate metadata/HTTP, do not grab YouTube frames")
    args = parser.parse_args()

    data = json.loads(STREAM_DATA.read_text(encoding="utf-8"))
    videos = data["videoStreams"]
    fallbacks = data.get("videoFallbackStreams", {})
    FRAME_DIR.mkdir(parents=True, exist_ok=True)

    results: list[dict[str, Any]] = []
    broken: list[dict[str, Any]] = []
    fallback_used: list[dict[str, Any]] = []

    for offset in sorted(videos, key=lambda x: int(x)):
        sources = normalized_sources(videos[offset], fallbacks.get(offset, []))
        attempts: list[dict[str, Any]] = []
        chosen = None
        for idx, src in enumerate(sources):
            ok, evidence = check_source(offset, idx, src, capture_frames=not args.no_frames)
            attempts.append({"candidate_index": idx, "ok": ok, "evidence": evidence})
            if ok:
                chosen = idx
                break
        row = {
            "offset": offset,
            "location": data.get("streamLocations", {}).get(offset),
            "ok": chosen is not None,
            "chosen_candidate": chosen,
            "attempts": attempts,
        }
        results.append(row)
        if chosen is None:
            broken.append(row)
        elif chosen > 0:
            fallback_used.append(row)

    report = {
        "tested_at": datetime.now(timezone.utc).isoformat(),
        "source": str(STREAM_DATA),
        "capture_frames": not args.no_frames,
        "total": len(results),
        "ok_count": len(results) - len(broken),
        "broken_count": len(broken),
        "fallback_used_count": len(fallback_used),
        "results": results,
        "broken": broken,
        "fallback_used": fallback_used,
    }
    REPORT_JSON.parent.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# 2AM RADIO visual heartbeat",
        "",
        f"- tested_at: {report['tested_at']}",
        f"- total: {report['total']}",
        f"- ok: {report['ok_count']}",
        f"- broken: {report['broken_count']}",
        f"- fallback used: {report['fallback_used_count']}",
        f"- frames: {FRAME_DIR}",
        "",
    ]
    if broken:
        lines += ["## Broken visual slots", ""]
        for row in broken:
            lines.append(f"- {row['offset']} {row.get('location')}: all candidates failed")
    if fallback_used:
        lines += ["", "## Fallbacks used", ""]
        for row in fallback_used:
            lines.append(f"- {row['offset']} {row.get('location')}: candidate {row['chosen_candidate']}")
    if not broken and not fallback_used:
        lines.append("All visual primaries passed.")
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(json.dumps({"total": report["total"], "ok": report["ok_count"], "broken": report["broken_count"], "fallback_used": report["fallback_used_count"], "report": str(REPORT_JSON)}))
    return 2 if broken else 0


if __name__ == "__main__":
    raise SystemExit(main())
