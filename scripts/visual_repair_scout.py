#!/usr/bin/env python3
"""Scout replacement visual streams for 2AM RADIO fallback events.

This script is intentionally read-only. It uses the workspace Vertex grounded
search side-channel to gather candidate URLs, then writes raw JSON receipts and a
concise Markdown report. It never edits stream-data.json.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parents[1]
VERTEX_FALLBACK = WORKSPACE / "agents/main/scripts/search/vertex-fallback-search.sh"
REPORT_ROOT = ROOT / "reports/visual_repair_scout"


def iso_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return slug or "query"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--offset", required=True, help="Timezone offset, e.g. -3")
    parser.add_argument("--city", required=True, help="Slot city/label, e.g. Brasilia")
    parser.add_argument("--timezone-label", default="", help="Optional timezone label")
    parser.add_argument("--failed-id", default="", help="Failed primary YouTube/video id")
    parser.add_argument("--fallback-id", default="", help="Currently working fallback id")
    parser.add_argument("--failure", default="", help="Short failure summary")
    parser.add_argument("--limit", default="5", help="Results per Vertex query")
    parser.add_argument("--out-dir", default="", help="Output directory, defaults under reports/visual_repair_scout")
    parser.add_argument("--dry-run", action="store_true", help="Print queries only, do not call Vertex")
    return parser.parse_args()


def default_queries(city: str, offset: str, failed_id: str = "") -> list[str]:
    city_ascii = city.replace("í", "i").replace("í", "i").replace("ã", "a")
    queries = [
        f"{city} live webcam YouTube embeddable city night stream",
        f"{city} ao vivo câmera YouTube live webcam",
        f"site:youtube.com/watch {city} ao vivo câmera cidade live",
        f"{city_ascii} live cam city traffic skyline YouTube live",
        f"Brazil live webcam {city} city YouTube live stream",
    ]
    if offset == "-3" and city.lower().startswith(("brasil", "brasí")):
        queries.extend([
            "Brasília ao vivo câmera cidade YouTube live",
            "Brasília DF webcam ao vivo trânsito cidade",
            "site:youtube.com/watch Brasília DF ao vivo live cam",
        ])
    if failed_id:
        queries.append(f"replacement for failed YouTube live stream {failed_id} {city} live webcam")
    # Preserve order while deduping.
    seen: set[str] = set()
    out: list[str] = []
    for q in queries:
        key = q.lower()
        if key not in seen:
            seen.add(key)
            out.append(q)
    return out


def run_vertex(query: str, limit: str, out_path: Path) -> dict[str, Any]:
    if not VERTEX_FALLBACK.exists():
        raise FileNotFoundError(f"Vertex fallback script not found: {VERTEX_FALLBACK}")
    proc = subprocess.run(
        [str(VERTEX_FALLBACK), query, str(limit)],
        cwd=str(WORKSPACE),
        text=True,
        capture_output=True,
        timeout=150,
    )
    raw = proc.stdout.strip()
    out_path.write_text(raw + "\n", encoding="utf-8")
    result: dict[str, Any] = {
        "query": query,
        "returncode": proc.returncode,
        "stderr_tail": proc.stderr[-800:],
        "raw_path": str(out_path),
    }
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        result["parse_error"] = str(exc)
        result["raw_sample"] = raw[:500]
        return result
    result["http_status"] = payload.get("http_status")
    result["ok"] = payload.get("ok")
    result["partial"] = payload.get("partial")
    model_json = payload.get("model_json") if isinstance(payload, dict) else None
    if isinstance(model_json, dict):
        result["notes"] = model_json.get("notes")
        result["results"] = model_json.get("results") or []
    else:
        result["results"] = []
    result["grounding_chunks"] = len(((payload.get("grounding_metadata") or {}).get("groundingChunks") or [])) if isinstance(payload.get("grounding_metadata"), dict) else 0
    return result


def normalize_candidates(runs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    candidates: list[dict[str, Any]] = []
    for run in runs:
        for item in run.get("results") or []:
            if not isinstance(item, dict):
                continue
            url = str(item.get("url") or "").strip()
            if not url or url in seen:
                continue
            seen.add(url)
            candidates.append(
                {
                    "title": item.get("title") or "",
                    "url": url,
                    "snippet": item.get("snippet") or "",
                    "source_kind": item.get("source_kind") or "unknown",
                    "decision_hint": item.get("decision_hint") or "needs_review",
                    "query": run.get("query"),
                    "status": "UNVERIFIED",
                    "verification_needed": "run yt-dlp/embed/frame validation before editing stream-data.json",
                }
            )
    return candidates


def write_report(out_dir: Path, args: argparse.Namespace, queries: list[str], runs: list[dict[str, Any]], candidates: list[dict[str, Any]]) -> None:
    summary = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "slot": {
            "offset": args.offset,
            "city": args.city,
            "timezone_label": args.timezone_label,
            "failed_id": args.failed_id,
            "fallback_id": args.fallback_id,
            "failure": args.failure,
        },
        "queries": queries,
        "runs": runs,
        "candidates": candidates,
        "guardrail": "Candidates are UNVERIFIED. Do not edit stream-data.json until local validation passes.",
    }
    (out_dir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        f"# 2AM visual repair scout — offset {args.offset} {args.city}",
        "",
        f"- created_at: {summary['created_at']}",
        f"- failed_id: `{args.failed_id or 'unknown'}`",
        f"- fallback_id: `{args.fallback_id or 'unknown'}`",
        f"- failure: {args.failure or 'not provided'}",
        "- status: candidates are **UNVERIFIED**",
        "",
        "## Queries",
        "",
    ]
    lines += [f"- {q}" for q in queries]
    lines += ["", "## Candidates", ""]
    if candidates:
        lines.append("| title | url | source_kind | decision_hint | query | verification |")
        lines.append("|---|---|---|---|---|---|")
        for c in candidates:
            title = str(c["title"]).replace("|", "\\|")
            snippet_query = str(c.get("query") or "").replace("|", "\\|")
            lines.append(
                f"| {title} | {c['url']} | {c['source_kind']} | {c['decision_hint']} | {snippet_query} | {c['verification_needed']} |"
            )
    else:
        lines.append("No candidates returned.")
    lines += [
        "",
        "## Next validation steps",
        "",
        "1. Prefer direct YouTube/watch URLs over Vertex redirect URLs.",
        "2. Run `yt-dlp --skip-download --dump-single-json <url>` for YouTube candidates.",
        "3. Require `playable_in_embed: true`; require `live_status: is_live` for `type: youtube`.",
        "4. Capture a frame with the existing visual heartbeat before replacing a primary.",
        "5. Only then update `stream-data.json`, run `./scripts/visual_heartbeat_run.sh`, and commit.",
        "",
    ]
    (out_dir / "report.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    args = parse_args()
    stamp = iso_stamp()
    out_dir = Path(args.out_dir) if args.out_dir else REPORT_ROOT / f"{stamp}-offset-{slugify(args.offset)}-{slugify(args.city)}"
    out_dir.mkdir(parents=True, exist_ok=True)

    queries = default_queries(args.city, args.offset, args.failed_id)
    if args.dry_run:
        print(json.dumps({"out_dir": str(out_dir), "queries": queries}, ensure_ascii=False, indent=2))
        return 0

    runs: list[dict[str, Any]] = []
    raw_dir = out_dir / "raw"
    raw_dir.mkdir(exist_ok=True)
    for idx, query in enumerate(queries, start=1):
        raw_path = raw_dir / f"{idx:02d}-{slugify(query)[:80]}.json"
        try:
            runs.append(run_vertex(query, args.limit, raw_path))
        except Exception as exc:
            runs.append({"query": query, "error": str(exc), "raw_path": str(raw_path)})
            break

    candidates = normalize_candidates(runs)
    write_report(out_dir, args, queries, runs, candidates)
    print(json.dumps({"out_dir": str(out_dir), "queries": len(queries), "runs": len(runs), "candidates": len(candidates), "report": str(out_dir / "report.md")}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
