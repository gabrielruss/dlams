#!/bin/sh
file=$(jq -r '.tool_input.file_path // empty')
case "$file" in
  "$CLAUDE_PROJECT_DIR"/dlams-fastapi/*.py) ;;
  *) exit 0 ;;
esac
ruff="$CLAUDE_PROJECT_DIR/dlams-fastapi/.venv/bin/ruff"
[ -x "$ruff" ] || exit 0
cd "$CLAUDE_PROJECT_DIR/dlams-fastapi" || exit 0
"$ruff" format --quiet "$file"
