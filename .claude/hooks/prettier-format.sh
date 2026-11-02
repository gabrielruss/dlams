#!/bin/sh
file=$(jq -r '.tool_input.file_path // empty')
case "$file" in
  "$CLAUDE_PROJECT_DIR"/dlams-ui/*.ts | "$CLAUDE_PROJECT_DIR"/dlams-ui/*.tsx | \
  "$CLAUDE_PROJECT_DIR"/dlams-ui/*.css | "$CLAUDE_PROJECT_DIR"/dlams-ui/*.json) ;;
  *) exit 0 ;;
esac
prettier="$CLAUDE_PROJECT_DIR/dlams-ui/node_modules/.bin/prettier"
[ -x "$prettier" ] || exit 0
cd "$CLAUDE_PROJECT_DIR/dlams-ui" || exit 0
"$prettier" --write --log-level warn "$file"
