#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

set +e
python3 scripts/stream_watchdog.py
RC=$?
set -e

if [ -f reports/stream_watchdog_latest.json ]; then
  python3 - <<'PY'
import json
from pathlib import Path
p = Path('reports/stream_watchdog_latest.json')
d = json.loads(p.read_text(encoding='utf-8'))
print(f"Stream watchdog: total={d['total']} working={d['working_count']} broken={d['broken_count']}")
if d['broken_count']:
    print('Broken offsets:', ', '.join(x['offset'] for x in d['broken']))
PY
fi

exit "$RC"
