#!/usr/bin/env bash
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
set +e
python3 scripts/audio_heartbeat.py
RC=$?
set -e
if [ -f reports/audio_heartbeat_latest.json ]; then
  python3 - <<'PY'
import json
from pathlib import Path
r=json.loads(Path('reports/audio_heartbeat_latest.json').read_text(encoding='utf-8'))
print(f"Audio heartbeat: total={r['total']} working={r['working_count']} broken={r['broken_count']}")
PY
fi
exit "$RC"
