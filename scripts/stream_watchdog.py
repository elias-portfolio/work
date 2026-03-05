#!/usr/bin/env python3
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

PAGES_URL = "https://elias-portfolio.github.io/work/2amtext.html"
RAW_URL = "https://raw.githubusercontent.com/elias-portfolio/work/main/2amtext.html"
REPORT_JSON = Path("reports/stream_watchdog_latest.json")
REPORT_MD = Path("reports/stream_watchdog_latest.md")


def fetch_html():
    errors = []
    for url in (PAGES_URL, RAW_URL):
        try:
            r = requests.get(url, timeout=25)
            if r.status_code == 200 and "const radioStreams" in r.text:
                return url, r.text
            errors.append(f"{url} -> {r.status_code}")
        except Exception as e:
            errors.append(f"{url} -> {e}")
    raise RuntimeError("Could not fetch online 2amtext with radioStreams: " + " | ".join(errors))


def parse_radio_streams(html: str):
    m = re.search(r"const\s+radioStreams\s*=\s*\{(.*?)\};", html, re.S)
    if not m:
        raise RuntimeError("radioStreams block not found")
    body = m.group(1)
    pairs = {k: v for k, v in re.findall(r'"([\-0-9]+)"\s*:\s*"([^"]+)"', body)}
    return pairs


def run(cmd, timeout=20):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)


def check_stream(url: str):
    evidence = []
    working = False

    # Primary check: GET/range (not HEAD only)
    try:
        p = run([
            "curl", "-L", "--max-time", "12", "-r", "0-2048", "-o", "/dev/null", "-s", "-w",
            "%{http_code} %{content_type} %{size_download} %{url_effective}", url
        ], timeout=16)
        out = (p.stdout or "").strip()
        parts = out.split(" ", 3)
        code = parts[0] if len(parts) > 0 else ""
        ctype = parts[1] if len(parts) > 1 else ""
        size = 0
        try:
            size = int(float(parts[2])) if len(parts) > 2 else 0
        except Exception:
            size = 0
        evidence.append(f"curl_range: code={code} type={ctype} size={size}")

        if code in ("200", "206") and (
            "audio" in ctype.lower() or "mpegurl" in ctype.lower() or "octet-stream" in ctype.lower() or size > 1024
        ):
            working = True
    except Exception as e:
        evidence.append(f"curl_error: {e}")

    # Optional ffprobe confidence check
    ffprobe_path = shutil.which("ffprobe")
    if ffprobe_path:
        try:
            p = run([
                ffprobe_path,
                "-v", "error",
                "-rw_timeout", "7000000",
                "-show_entries", "format=format_name,bit_rate:format_tags=icy-name,icy-br",
                "-of", "json",
                url,
            ], timeout=14)
            if p.returncode == 0 and (p.stdout or "").strip():
                d = json.loads(p.stdout)
                fmt = d.get("format", {})
                tags = fmt.get("tags", {}) or {}
                evidence.append(
                    f"ffprobe: format={fmt.get('format_name','?')} br={fmt.get('bit_rate','?')} icy={tags.get('icy-name','')}"
                )
                working = True
            elif p.stderr:
                evidence.append("ffprobe_err: " + p.stderr.strip()[:180])
        except Exception as e:
            evidence.append(f"ffprobe_exc: {e}")

    return working, "; ".join(evidence)


def main():
    source_url, html = fetch_html()
    streams = parse_radio_streams(html)

    working = []
    broken = []
    for offset in sorted(streams.keys(), key=lambda x: int(x)):
        url = streams[offset]
        ok, ev = check_stream(url)
        row = {"offset": offset, "url": url, "evidence": ev}
        if ok:
            working.append(row)
        else:
            row["reason"] = "No playable response (GET/range+ffprobe)"
            broken.append(row)

    report = {
        "tested_at": datetime.now(timezone.utc).isoformat(),
        "source_url": source_url,
        "total": len(streams),
        "working_count": len(working),
        "broken_count": len(broken),
        "working": working,
        "broken": broken,
    }

    REPORT_JSON.parent.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    md = [
        "# Stream watchdog latest report",
        "",
        f"- tested_at: {report['tested_at']}",
        f"- source_url: {source_url}",
        f"- total: {report['total']}",
        f"- working: {report['working_count']}",
        f"- broken: {report['broken_count']}",
        "",
    ]
    if broken:
        md.append("## Broken streams")
        md.append("")
        for b in broken:
            md.append(f"- offset {b['offset']}: {b['url']}")
            md.append(f"  - {b.get('reason','')}")
            md.append(f"  - {b['evidence']}")
    else:
        md.append("All streams responding.")
    REPORT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")

    print(json.dumps({
        "total": report["total"],
        "working": report["working_count"],
        "broken": report["broken_count"],
        "report": str(REPORT_JSON),
    }))

    if broken:
        sys.exit(2)
    sys.exit(0)


if __name__ == "__main__":
    main()
