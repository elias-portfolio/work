#!/usr/bin/env bash
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
set +e
python3 scripts/visual_heartbeat.py "$@"
RC=$?
set -e
if [ -f reports/visual_heartbeat_latest.json ]; then
  python3 - <<'PY'
import json
from pathlib import Path
r=json.loads(Path('reports/visual_heartbeat_latest.json').read_text(encoding='utf-8'))
print(f"Visual heartbeat: total={r['total']} ok={r['ok_count']} broken={r['broken_count']} fallback_used={r['fallback_used_count']}")
PY
fi
exit "$RC"
