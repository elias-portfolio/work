#!/usr/bin/env bash
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
set +e
python3 scripts/stream_guardian.py
RC=$?
set -e
if [ -f reports/stream_guardian_latest.json ]; then
  python3 - <<'PY'
import json
from pathlib import Path
r=json.loads(Path('reports/stream_guardian_latest.json').read_text(encoding='utf-8'))
print(f"Guardian: audio_broken={r['audio']['broken_count']} video_bad={r['video']['bad_count']} hosted_ok={r['hosted_video_source']['ok']}")
PY
fi
exit "$RC"
