#!/usr/bin/env python3
"""Validate every .html file in the repo parses without errors.

Walks the tree, skipping `.git`, `node_modules`, and any path containing
"backup" (escape-room-simulator and others ship `.backup_<timestamp>`
artifacts from external tooling). Parses each `.html` file with the
stdlib `html.parser`. Any parse exception fails the script.

This is a structural check — it does not validate HTML5 semantics. It
catches the kinds of issues a single-file vanilla playground will run
into: unterminated tags, broken attribute quoting, accidental binary
contents, etc.

Usage:
    python ci/check_html.py             # check whole repo
    python ci/check_html.py path/...    # check specific paths
"""
from __future__ import annotations

import html.parser
import sys
from pathlib import Path


class StrictHTMLParser(html.parser.HTMLParser):
    """Collects parse errors instead of silently ignoring them."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.errors: list[str] = []

    def error(self, message: str) -> None:  # pragma: no cover (stdlib never calls)
        self.errors.append(message)


SKIP_PARTS = {".git", "node_modules", "__pycache__", ".venv", "venv"}


def should_skip(path: Path) -> bool:
    parts = set(path.parts)
    if parts & SKIP_PARTS:
        return True
    if "backup" in str(path).lower():
        return True
    return False


def check_one(path: Path) -> tuple[bool, str]:
    try:
        content = path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        return False, f"not valid UTF-8: {exc}"
    parser = StrictHTMLParser()
    try:
        parser.feed(content)
        parser.close()
    except Exception as exc:  # noqa: BLE001 — we want any parse exception
        return False, f"parse error: {exc.__class__.__name__}: {exc}"
    if parser.errors:
        return False, f"parser reported errors: {parser.errors}"
    return True, "ok"


def collect(roots: list[Path]) -> list[Path]:
    out: list[Path] = []
    for root in roots:
        if root.is_file() and root.suffix.lower() == ".html":
            if not should_skip(root):
                out.append(root)
        else:
            for p in root.rglob("*.html"):
                if not should_skip(p):
                    out.append(p)
    return sorted(set(out))


def main(argv: list[str]) -> int:
    repo_root = Path(__file__).resolve().parent.parent
    if len(argv) > 1:
        roots = [Path(a).resolve() for a in argv[1:]]
    else:
        roots = [repo_root]

    files = collect(roots)
    if not files:
        print("No HTML files found.")
        return 0

    failed: list[tuple[Path, str]] = []
    for f in files:
        ok, msg = check_one(f)
        rel = f.relative_to(repo_root) if f.is_relative_to(repo_root) else f
        mark = "ok" if ok else "FAIL"
        print(f"  [{mark}] {rel}: {msg}")
        if not ok:
            failed.append((f, msg))

    print()
    print(f"Checked {len(files)} HTML file(s); {len(failed)} failed.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
