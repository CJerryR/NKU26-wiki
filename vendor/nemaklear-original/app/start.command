#!/bin/zsh
set -eu
DEMO_DIR="${0:A:h}"
if [[ -x "$DEMO_DIR/.venv/bin/python" ]]; then
  DEMO_PYTHON="$DEMO_DIR/.venv/bin/python"
elif [[ -x "$DEMO_DIR/../../.venv/bin/python" ]]; then
  DEMO_PYTHON="$DEMO_DIR/../../.venv/bin/python"
else
  DEMO_PYTHON="python3"
fi
print '启动后在浏览器打开 http://127.0.0.1:8765'
print '停止运行：在这个终端按 Control+C。'
exec "$DEMO_PYTHON" -B "$DEMO_DIR/server.py" "$@"
