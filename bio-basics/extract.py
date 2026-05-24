#!/usr/bin/env python3
"""One-shot extractor: bio-basics.html -> bio-basics/src/* fragments.

This script is throwaway. After it runs cleanly and `build.py` produces
a bio-basics.html that's semantically identical to the original, it can
be deleted (the source-of-truth is now src/, and build.py regenerates
the deployed file).

Strategy:
  - Read bio-basics.html
  - Find the <style>, <script>, and module-section blocks
  - Carve them out into separate source files
  - Build a template.html with __CSS__, __MODULES__, __JS__ placeholders
  - The CSS gets subdivided by hardcoded module-block markers (codon-picker,
    gene-grid, mutation-stage)
  - The JS gets subdivided so each module's quiz lives alongside its
    data + renderers (re-organizing the original "all quizzes in one block"
    layout to a per-module layout)
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / 'bio-basics.html'
SRC = ROOT / 'src'

text = SOURCE.read_text()

# -----------------------------------------------------------------------
# 1. Carve out the three big blocks
# -----------------------------------------------------------------------
style_start = text.find('<style>')
style_end = text.find('</style>')
assert style_start != -1 and style_end != -1, '<style> block not found'
css_open = text.index('\n', style_start) + 1
css_close = style_end
css_text = text[css_open:css_close]

script_start = text.find('<script>')
script_end = text.find('</script>')
assert script_start != -1 and script_end != -1, '<script> block not found'
js_open = text.index('\n', script_start) + 1
js_close = script_end
js_text = text[js_open:js_close]

# Module sections (six of them, in source order).
module_pattern = re.compile(
    r'        <div class="module-section" data-module="(\w+)"[^>]*>.*?</div><!-- /module-section data-module="\1" -->',
    re.DOTALL,
)
module_matches = list(module_pattern.finditer(text))
EXPECTED_MODULES = ['cell', 'dna', 'transcription', 'translation', 'regulation', 'evolve']
found_ids = [m.group(1) for m in module_matches]
assert found_ids == EXPECTED_MODULES, (
    f'Module order/IDs unexpected: {found_ids} (expected {EXPECTED_MODULES})'
)

# -----------------------------------------------------------------------
# 2. Subdivide CSS by hardcoded section headers
# -----------------------------------------------------------------------
def find_block_start(s: str, marker: str) -> int:
    """Find the first occurrence of `marker` and walk back to the start of
    the surrounding `/* ====... */` comment block (the line that opens the
    comment, recognized by `/*` on that line)."""
    idx = s.find(marker)
    assert idx != -1, f'CSS marker {marker!r} not found'
    # Start of the line containing the marker.
    line_start = s.rfind('\n', 0, idx) + 1
    while line_start > 0:
        prev_nl = s.rfind('\n', 0, line_start - 1)
        prev_start = prev_nl + 1 if prev_nl != -1 else 0
        prev_line = s[prev_start:line_start]
        if '/*' in prev_line:
            return prev_start
        if prev_start == 0:
            return prev_start
        line_start = prev_start
    return 0

m4_start = find_block_start(css_text, 'Codon picker (Module 4')
m5_start = find_block_start(css_text, 'Gene-grid + cell-type toggle (Module 5')
m6_start = find_block_start(css_text, 'Mutation classifier (Module 6')

# Each chunk gets stripped of trailing whitespace and ends with one newline.
def normalize(chunk: str) -> str:
    return chunk.rstrip() + '\n'

(SRC / 'css' / '00-base.css').write_text(normalize(css_text[:m4_start]))
(SRC / 'css' / '40-translation.css').write_text(normalize(css_text[m4_start:m5_start]))
(SRC / 'css' / '50-regulation.css').write_text(normalize(css_text[m5_start:m6_start]))
(SRC / 'css' / '60-evolve.css').write_text(normalize(css_text[m6_start:]))

# -----------------------------------------------------------------------
# 3. Module HTML (one file per module-section, in display order)
# -----------------------------------------------------------------------
PREFIXES = {
    'cell': '00', 'dna': '10', 'transcription': '20',
    'translation': '30', 'regulation': '40', 'evolve': '50',
}
for m in module_matches:
    modid = m.group(1)
    out = SRC / 'modules' / f'{PREFIXES[modid]}-{modid}.html'
    out.write_text(m.group(0) + '\n')

# -----------------------------------------------------------------------
# 4. JS subdivision
#
# Original layout (post-state/helpers):
#   [SVG factories + cell renderers]   <- becomes 10-cell.js (sans QUIZ)
#   [QUIZ, DNA_QUIZ, TRANS_QUIZ, TRANSL_QUIZ, REG_QUIZ all in one block]
#   [MODULE 2 — DNA: data + renderers]
#   [MODULE 3 — TRANSCRIPTION ...]
#   [MODULE 4 — TRANSLATION ...]
#   [MODULE 5 — REGULATION ...]
#   [MODULE 6 — MUTATIONS — has its own MUT_QUIZ inline already]
#   [MODULES registry]
#   [routing + quiz engine + boot]
#
# Reorganization: pull each XXX_QUIZ from the grouped block and prepend
# it to the corresponding module file so each module is self-contained.
# -----------------------------------------------------------------------
def line_start(s: str, marker: str, start: int = 0) -> int:
    idx = s.find(marker, start)
    assert idx != -1, f'JS marker {marker!r} not found (from offset {start})'
    return s.rfind('\n', 0, idx) + 1

b_svg_factories_inner = line_start(js_text, '// SVG factories')
# Walk back one line to include the surrounding `// ====` ruling.
b_svg_factories = js_text.rfind('\n', 0, b_svg_factories_inner - 1) + 1
b_quiz_block = line_start(js_text, 'const QUIZ = [')
# Walk back to the leading blank/comment lines so the file starts cleanly.
# (We just take the line that starts `      const QUIZ = [`; preceding whitespace
# stays with the cell.js file.)
b_module2 = line_start(js_text, '// MODULE 2 — DNA')
b_module2 = js_text.rfind('\n', 0, b_module2 - 1) + 1  # include `// ====` line above
b_module3 = line_start(js_text, '// MODULE 3 — TRANSCRIPTION')
b_module3 = js_text.rfind('\n', 0, b_module3 - 1) + 1
b_module4 = line_start(js_text, '// MODULE 4 — TRANSLATION')
b_module4 = js_text.rfind('\n', 0, b_module4 - 1) + 1
b_module5 = line_start(js_text, '// MODULE 5 — REGULATION')
b_module5 = js_text.rfind('\n', 0, b_module5 - 1) + 1
b_module6 = line_start(js_text, '// MODULE 6 — MUTATIONS')
b_module6 = js_text.rfind('\n', 0, b_module6 - 1) + 1
b_modules_dict = line_start(js_text, '// MODULES — registry of all built modules')
b_modules_dict = js_text.rfind('\n', 0, b_modules_dict - 1) + 1

# Find end of MODULES block by walking braces from `const MODULES = {`.
md_open = js_text.find('const MODULES = {', b_modules_dict)
i = md_open + len('const MODULES = ')
brace = 0
started = False
while i < len(js_text):
    c = js_text[i]
    if c == '{':
        brace += 1
        started = True
    elif c == '}':
        brace -= 1
        if started and brace == 0:
            i += 1  # past }
            # Consume `;` and any trailing whitespace through end of line.
            while i < len(js_text) and js_text[i] in ' ;\t':
                i += 1
            if i < len(js_text) and js_text[i] == '\n':
                i += 1
            break
    i += 1
b_routing = i

# Now pull individual quizzes out of the QUIZ block.
quiz_block_text = js_text[b_quiz_block:b_module2]
quiz_const_re = re.compile(r'^      const (\w+) = \[', re.MULTILINE)
matches = list(quiz_const_re.finditer(quiz_block_text))
quizzes: dict[str, str] = {}
for idx, m in enumerate(matches):
    name = m.group(1)
    chunk_start = quiz_block_text.rfind('\n', 0, m.start())
    chunk_start = chunk_start + 1 if chunk_start != -1 else 0
    if idx + 1 < len(matches):
        chunk_end = quiz_block_text.rfind('\n', 0, matches[idx + 1].start()) + 1
    else:
        chunk_end = len(quiz_block_text)
    quizzes[name] = quiz_block_text[chunk_start:chunk_end]

REQUIRED_QUIZZES = {'QUIZ', 'DNA_QUIZ', 'TRANS_QUIZ', 'TRANSL_QUIZ', 'REG_QUIZ'}
assert REQUIRED_QUIZZES.issubset(quizzes.keys()), (
    f'Missing quizzes: {REQUIRED_QUIZZES - quizzes.keys()}'
)

# Assemble per-module JS files.
core_js = js_text[:b_svg_factories]
cell_js = js_text[b_svg_factories:b_quiz_block] + quizzes['QUIZ']
dna_js = quizzes['DNA_QUIZ'].rstrip() + '\n\n' + js_text[b_module2:b_module3]
trans_js = quizzes['TRANS_QUIZ'].rstrip() + '\n\n' + js_text[b_module3:b_module4]
transl_js = quizzes['TRANSL_QUIZ'].rstrip() + '\n\n' + js_text[b_module4:b_module5]
reg_js = quizzes['REG_QUIZ'].rstrip() + '\n\n' + js_text[b_module5:b_module6]
evolve_js = js_text[b_module6:b_modules_dict]
registry_js = js_text[b_modules_dict:b_routing]
boot_js = js_text[b_routing:]

(SRC / 'js' / '00-core.js').write_text(normalize(core_js))
(SRC / 'js' / '10-cell.js').write_text(normalize(cell_js))
(SRC / 'js' / '20-dna.js').write_text(normalize(dna_js))
(SRC / 'js' / '30-transcription.js').write_text(normalize(trans_js))
(SRC / 'js' / '40-translation.js').write_text(normalize(transl_js))
(SRC / 'js' / '50-regulation.js').write_text(normalize(reg_js))
(SRC / 'js' / '60-evolve.js').write_text(normalize(evolve_js))
(SRC / 'js' / '90-registry.js').write_text(normalize(registry_js))
(SRC / 'js' / '99-boot.js').write_text(normalize(boot_js))

# -----------------------------------------------------------------------
# 5. Template — everything that ISN'T CSS/modules/JS, with placeholders.
# -----------------------------------------------------------------------
# Linear assembly using the offsets we already have.
first_mod_start = module_matches[0].start()
last_mod_end = module_matches[-1].end()

template = (
    text[:css_open]
    + '__CSS__\n'
    + text[css_close:first_mod_start]
    + '__MODULES__'
    + text[last_mod_end:js_open]
    + '__JS__\n'
    + text[js_close:]
)

# Replace the now-stale FILE INDEX header comment with a "GENERATED" notice.
old_header_re = re.compile(
    r'<!--\n=+\n  Bio Basics — molecular biology for everyone\n=+.*?-->\n',
    re.DOTALL,
)
new_header = (
    '<!--\n'
    '  ==========================================================================\n'
    '  GENERATED FILE — DO NOT EDIT DIRECTLY.\n'
    '\n'
    '  Source files live under bio-basics/src/. To rebuild this file from\n'
    '  source:\n'
    '\n'
    '      python3 bio-basics/build.py\n'
    '\n'
    '  See bio-basics/README.md for the source-tree layout.\n'
    '  ==========================================================================\n'
    '-->\n'
)
template, n_subs = old_header_re.subn(new_header, template, count=1)
assert n_subs == 1, 'Failed to replace header comment'

(SRC / 'template.html').write_text(template)

# -----------------------------------------------------------------------
print('Extracted to', SRC.relative_to(ROOT.parent))
print(f'  CSS files:    {len(list((SRC / "css").glob("*")))}')
print(f'  Module HTML:  {len(list((SRC / "modules").glob("*")))}')
print(f'  JS files:     {len(list((SRC / "js").glob("*")))}')
print(f'  template.html: {len(template.splitlines())} lines')
