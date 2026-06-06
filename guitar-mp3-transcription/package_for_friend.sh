#!/usr/bin/env bash
set -euo pipefail

# Builds a clean zip to send to a tester. Run from the project folder:
#   ./package_for_friend.sh
#
# Excludes: virtualenvs, caches, generated uploads/outputs, git data,
# *.backup_* snapshots (external-tool artifacts, not source), and the
# internal project-memory.md.

ROOT="$(cd "$(dirname "$0")" && pwd)"
NAME="guitar-mp3-transcription"

# Zip the folder by name (from its parent) so the tester gets a single
# top-level directory when they unzip, rather than loose files. The zip is
# written to the parent dir so it is never inside the folder being zipped.
cd "$ROOT/.."
OUT="$(pwd)/${NAME}-test-package.zip"

rm -f "$OUT"
zip -r "$OUT" "$NAME" \
  -x "*/.venv/*" \
  -x "*/__pycache__/*" \
  -x "*/outputs/*" \
  -x "*/uploads/*" \
  -x "*/.git/*" \
  -x "*.backup_*" \
  -x "*.zip" \
  -x "*/project-memory.md"

echo "Created: $OUT"
