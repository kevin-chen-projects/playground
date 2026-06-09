# CodeSignal Python Prep Kit

A self-contained 5-day prep kit for a **90-minute CodeSignal Industry Coding (IMC)**
assessment in Python. Built for someone rebuilding Python reflexes who needs **speed and
completion**, not elegant code.

> **What the test is.** One toy-app problem, **four cumulative levels**, each extending the
> last. You must pass a level's tests to unlock the next. Later levels take longer. **The
> test suite is the real spec** — prompts can be ambiguous; only the tests are authoritative.
> You're given an **interface class** (method stubs + docstrings) to copy and fill in. Core
> language + standard library only (`dataclasses`, `collections`, `copy` are worth knowing).
> **Sacrifice readability, efficiency, comments, type hints — anything not in service of
> passing tests fast.** Run tests early and often; there's no penalty.

---

## What's in the kit

| File / folder | What it's for |
|---|---|
| [cheatsheet.md](cheatsheet.md) | Python idiom reference — the "fundamentals" you'll lean on. Skim Day 1, re-skim Day 5. |
| [warmups/](warmups/) | ~30 tiny "write one idiom" drills to rebuild syntax reflexes. |
| [problems/](problems/) | Four full 4-level practice problems (the main event). |
| [blank-line-drills.md](blank-line-drills.md) | Recall drills — write a whole stateful class from a blank line; targets logged weak spots. |
| [drill.html](drill.html) | Spaced-repetition flashcard site for idioms — a **supplement**. Open in a browser. |
| [codesignal-ide.html](codesignal-ide.html) | **CodeSignal IDE simulator** — runs your Python in-browser (Pyodide + CodeMirror) with a split-pane layout, count-up timer, and Level 1→4 tabs. Holds the four 4-level problems *and* 40 pattern/IMC drills. Open in a browser. |

### The four problems (increasing difficulty)

| # | Problem | Tests | Trains |
|---|---------|-------|--------|
| 01 | [Inventory system](problems/01-inventory-system/) | 10 | The core loop; dicts, counting, sorting, transfers. Warm-up. |
| 02 | [Banking system](problems/02-banking-system/) | 9 | Accounts, transfers, ranking, **scheduled/lazy operations**. |
| 03 | [Cloud storage](problems/03-cloud-storage/) | 8 | Capacity accounting, prefix queries, ownership, **backup/restore**. |
| 04 | [In-memory DB](problems/04-in-memory-db/) | 11 | **TTL via timestamps**, `copy.deepcopy` backup/restore. The hard one. |

Each problem folder has the same five files:

- `prompt.md` — the 4-level spec, written dense and slightly ambiguous like the real thing.
- `interface.py` — the "given" class: method signatures + docstrings, bodies unimplemented.
- `starter.py` — **your working file** (a copy of the interface). Fill in the bodies here.
- `solution.py` — a fast, plain reference solution. Look *after* you attempt.
- `tests.py` — the authoritative spec. Split by level.

---

## How to run things

The problems use `pytest` if you have it, but **need no third-party packages otherwise** —
everything is plain `assert`s, so a tiny runner works too.

**With pytest** (recommended; mirrors the real platform's run-tests loop):

```bash
cd problems/01-inventory-system
pytest tests.py            # all levels
pytest tests.py -k level1  # one level at a time while you build
```

`tests.py` imports your `starter.py` by default. To check the reference solution instead:

```bash
IMPL=solution pytest tests.py
```

**Without pytest** (no install needed) — each `tests.py` defines `test_*` functions you can
drive with ~10 lines of stdlib; or just run a quick check in a REPL. The warm-ups are fully
standalone:

```bash
cd warmups
python syntax_drills.py             # runs YOUR answers; stops at first wrong one
python solutions_syntax_drills.py   # the answer key -> "all 30 drills pass"
```

**The drill site:** open `drill.html` in any browser (double-click). No server. Progress
saves to `localStorage` under `csprep_*`.

**The CodeSignal IDE simulator:** open `codesignal-ide.html` in any browser. It mimics the real
IMC test environment — statement on the left, code editor top-right, test-results panel
bottom-right, a count-up stopwatch, and **Level 1→4** tabs. Pick **4-Level Problems** to work the
four `problems/` problems with the real layout (your code is graded against that problem's actual
`tests.py`, shown as a clickable per-level case list), or **Drills** for 40 quick pattern/IMC reps.
Hit **Run Tests** (or Ctrl/Cmd+Enter) to execute your Python in the browser. Like the rest of the
kit it's a single file, but it loads Pyodide + CodeMirror from CDNs, so the **first** run needs
network (then cached); after that it works offline. Progress + per-problem code save to
`localStorage`.

---

## The IMC playbook (read before your first timed run)

1. **Read the whole level once, then read the interface class.** Copy its method signatures
   into your file. The docstrings often resolve ambiguity the prose doesn't.
2. **State lives in dicts on `self`.** Most methods are: look up a key, mutate a dict, return
   a value or bool. Set them up in `__init__`.
3. **Write the simplest thing that could pass, then run the tests.** No penalty. Let red
   tests tell you the real spec — especially for edge cases the prose left vague.
4. **Don't refactor for beauty.** When the next level lands, *extend*; don't rewrite. Copy a
   method and tweak it rather than building a clever abstraction.
5. **Bank partial credit.** If a level is fighting you, get its easy asserts green and move
   on — passing some tests in a level counts, and later levels may be easier for you.
6. **Watch the clock.** Roughly: L1 fast, L2 fast, L3 the squeeze, L4 longest. If you're
   sinking time, lock in what passes and advance.

Common shapes you'll reach for (all in [cheatsheet.md](cheatsheet.md)):
`d.get(k, 0)` · `setdefault` · `Counter` / `defaultdict` · `sorted(..., key=lambda x: (-x[1], x[0]))`
· prefix scan `[k for k in d if k.startswith(p)]` · TTL `store[k] = (v, ts + ttl)` ·
backup `copy.deepcopy(state)`.

---

## The 5-day schedule (~8 hrs/day)

**Day 1 — Rebuild reflexes.** Read [cheatsheet.md](cheatsheet.md) top to bottom. Do
`warmups/syntax_drills.py` until it prints "all 30 drills pass". Two 15-min sessions on
`drill.html`. *Goal: stop Googling basic syntax.*

**Day 2 — Workhorse idioms + Problem 01.** Drill `Counter`/`defaultdict`, sorting with
`key`, string parsing. Solve **Problem 01** — levels 1–2 untimed to learn the loop, then
3–4 against a timer. Review vs `solution.py`. Weak-card pass on `drill.html`.

**Day 3 — Format mechanics + first full mock.** Re-read the IMC playbook above. Do
**Problem 02** as a full **90-minute timed run**, all four levels, no peeking. Then diff your
code against `solution.py` and note what cost you time.

**Day 4 — Volume + speed.** **Problem 03** timed (90 min). Then **Problem 04** timed (90 min)
— the spec-reading and TTL/`deepcopy` stress test. Review both; log recurring mistakes;
targeted `drill.html` review of the categories you fumbled.

**Day 5 — Consolidate, don't cram.** One fresh timed re-run of whichever problem scored
lowest. Re-skim `cheatsheet.md` + a final flashcard pass. Confirm CodeSignal logistics
(language = **Python 3**, where the run-tests button is). Sleep early.

---

## Integrity note

This kit is **original practice material** for prep. During the real assessment you must work
solo in the CodeSignal IDE — no LLMs, no copying solutions from the web. Using this kit
*beforehand* to study is exactly what it's for; bringing it *into* the test is not.
