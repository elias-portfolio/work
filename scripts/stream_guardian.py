#!/usr/bin/env python3
"""Compatibility guardian for 2AM RADIO.

The old guardian mixed audio, video, and fallback discovery in one script.  The
current model deliberately separates audio and visual heartbeats; this wrapper
runs both and writes the legacy aggregate report path for existing cron callers.
"""
from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIO_REPORT = ROOT / "reports/audio_heartbeat_latest.json"
VISUAL_REPORT = ROOT / "reports/visual_heartbeat_latest.json"
OUT_JSON = ROOT / "reports/stream_guardian_latest.json"
OUT_MD = ROOT / "reports/stream_guardian_latest.md"
OUT_FB = ROOT / "reports/video_fallback_candidates.json"


def run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=900)


def read_json(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    audio = run([sys.executable, "scripts/audio_heartbeat.py"])
    # Compatibility guardian uses metadata-only visual checks by default.  Run
    # scripts/visual_heartbeat.py without --no-frames when screenshot/frame
    # evidence is desired.
    visual = run([sys.executable, "scripts/visual_heartbeat.py", "--no-frames"])

    audio_report = read_json(AUDIO_REPORT)
    visual_report = read_json(VISUAL_REPORT)
    fallback_used = visual_report.get("fallback_used", [])
    fallback_candidates = {
        row.get("offset"): row for row in fallback_used if row.get("offset") is not None
    }

    report = {
        "tested_at": datetime.now(timezone.utc).isoformat(),
        "audio_command_rc": audio.returncode,
        "visual_command_rc": visual.returncode,
        "audio": {
            "total": audio_report.get("total", 0),
            "working_count": audio_report.get("working_count", 0),
            "broken_count": audio_report.get("broken_count", 0),
            "broken": audio_report.get("broken", []),
        },
        "video": {
            "total": visual_report.get("total", 0),
            "ok_count": visual_report.get("ok_count", 0),
            "bad_count": visual_report.get("broken_count", 0),
            "bad": visual_report.get("broken", []),
            "fallback_used_count": visual_report.get("fallback_used_count", 0),
        },
        "reports": {
            "audio": str(AUDIO_REPORT),
            "visual": str(VISUAL_REPORT),
        },
        "notes": [
            "Audio and visual checks are now separated; this is a legacy aggregate wrapper.",
            "Run visual_heartbeat.py without --no-frames for frame evidence.",
        ],
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_FB.write_text(json.dumps({
        "generated_at": report["tested_at"],
        "source": str(VISUAL_REPORT),
        "fallback_used": fallback_candidates,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Stream guardian aggregate report",
        "",
        f"- tested_at: {report['tested_at']}",
        f"- audio broken: {report['audio']['broken_count']} / {report['audio']['total']}",
        f"- visual bad: {report['video']['bad_count']} / {report['video']['total']}",
        f"- visual fallback used: {report['video']['fallback_used_count']}",
        "",
        "This wrapper exists for old cron callers. Prefer separate audio and visual heartbeats.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(json.dumps({
        "audio_broken": report["audio"]["broken_count"],
        "video_bad": report["video"]["bad_count"],
        "fallback_used": report["video"]["fallback_used_count"],
        "report": str(OUT_JSON),
    }))
    return 2 if report["audio"]["broken_count"] or report["video"]["bad_count"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
