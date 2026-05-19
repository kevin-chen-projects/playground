#!/usr/bin/env python3
"""Concatenate bio-basics/src/* fragments into ../bio-basics.html.

Trivial single-pass build: read template, substitute three placeholders
with concatenated CSS / module-HTML / JS, write the result.

  __CSS__       <-  cat src/css/*.css       (sorted by filename)
  __MODULES__   <-  cat src/modules/*.html  (sorted by filename)
  __JS__        <-  cat src/js/*.js         (sorted by filename)

File ordering is by filename — that's why fragments are prefixed
with two-digit numbers. Adding a new module means dropping new
files into the right places and renumbering nothing existing.

No dependencies. Run from anywhere:

    python3 bio-basics/build.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / 'src'
OUT = ROOT.parent / 'bio-basics.html'


def gather(subdir: str) -> str:
    """Read every file under SRC/<subdir> in sorted-filename order and
    join with one blank line between fragments. Each fragment's trailing
    newline is stripped before joining, so the join yields exactly one
    blank line between fragments and no trailing whitespace — the
    template provides the closing newline before the wrapping tag."""
    files = sorted((SRC / subdir).glob('*'))
    return '\n\n'.join(f.read_text().rstrip('\n') for f in files)


def main() -> None:
    template = (SRC / 'template.html').read_text()
    output = (
        template
        .replace('__CSS__', gather('css'))
        .replace('__MODULES__', gather('modules'))
        .replace('__JS__', gather('js'))
    )
    OUT.write_text(output)
    rel = OUT.relative_to(ROOT.parent)
    print(f'Built {rel} ({len(output.splitlines())} lines, {len(output)} bytes)')


if __name__ == '__main__':
    main()
