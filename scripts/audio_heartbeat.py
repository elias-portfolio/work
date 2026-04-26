#!/usr/bin/env python3
"""Audio heartbeat for 2AM RADIO.

Checks every configured audio stream independently from visual/video health.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
STREAM_DATA = ROOT / "stream-data.json"
REPORT_JSON = ROOT / "reports/audio_heartbeat_latest.json"
REPORT_MD = ROOT / "reports/audio_heartbeat_latest.md"


def run(cmd: list[str], timeout: int = 20) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)


def check_stream(url: str) -> tuple[bool, str]:
    evidence: list[str] = []
    working = False

    try:
        r = requests.get(url, headers={"Range": "bytes=0-2048", "User-Agent": "2am-radio-heartbeat/1.0"}, timeout=12, stream=True)
        chunk = next(r.iter_content(chunk_size=2048), b"")
        ctype = r.headers.get("content-type", "")
        evidence.append(f"http code={r.status_code} type={ctype} bytes={len(chunk)}")
        if r.status_code in (200, 206) and ("audio" in ctype.lower() or "mpegurl" in ctype.lower() or len(chunk) > 512):
            working = True
    except Exception as exc:
        evidence.append(f"http_error={exc}")

    ffprobe = shutil.which("ffprobe")
    if ffprobe:
        try:
            p = run([
                ffprobe,
                "-v", "error",
                "-rw_timeout", "7000000",
                "-show_entries", "format=format_name,bit_rate:format_tags=icy-name,icy-br",
                "-of", "json",
                url,
            ], timeout=14)
            if p.returncode == 0 and p.stdout.strip():
                d = json.loads(p.stdout)
                fmt = d.get("format", {})
                tags = fmt.get("tags", {}) or {}
                evidence.append(f"ffprobe format={fmt.get('format_name','?')} br={fmt.get('bit_rate','?')} icy={tags.get('icy-name','')}")
                working = True
            elif p.stderr:
                evidence.append("ffprobe_err=" + p.stderr.strip()[:180])
        except Exception as exc:
            evidence.append(f"ffprobe_error={exc}")

    return working, "; ".join(evidence)


def main() -> int:
    data = json.loads(STREAM_DATA.read_text(encoding="utf-8"))
    streams = data["audioStreams"]

    working: list[dict] = []
    broken: list[dict] = []
    for offset in sorted(streams, key=lambda x: int(x)):
        item = streams[offset]
        url = item["url"] if isinstance(item, dict) else item
        ok, evidence = check_stream(url)
        row = {
            "offset": offset,
            "location": data.get("streamLocations", {}).get(offset),
            "station": item.get("station") if isinstance(item, dict) else None,
            "url": url,
            "ok": ok,
            "evidence": evidence,
        }
        (working if ok else broken).append(row)

    report = {
        "tested_at": datetime.now(timezone.utc).isoformat(),
        "source": str(STREAM_DATA),
        "total": len(streams),
        "working_count": len(working),
        "broken_count": len(broken),
        "working": working,
        "broken": broken,
    }
    REPORT_JSON.parent.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# 2AM RADIO audio heartbeat",
        "",
        f"- tested_at: {report['tested_at']}",
        f"- total: {report['total']}",
        f"- working: {report['working_count']}",
        f"- broken: {report['broken_count']}",
        "",
    ]
    if broken:
        lines += ["## Broken audio", ""]
        for row in broken:
            lines.append(f"- {row['offset']} {row.get('location')}: {row['url']}")
            lines.append(f"  - {row['evidence']}")
    else:
        lines.append("All configured audio streams responded.")
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(json.dumps({"total": report["total"], "working": report["working_count"], "broken": report["broken_count"], "report": str(REPORT_JSON)}))
    return 2 if broken else 0


if __name__ == "__main__":
    raise SystemExit(main())
