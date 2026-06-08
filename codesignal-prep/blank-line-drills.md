<!--
================================================================================
BLANK-LINE DRILLS — CodeSignal IMC recall practice
================================================================================
Companion to cheatsheet.md. The cheatsheet builds RECOGNITION (predict output).
These build RECALL (write a full class from an empty file) — the skill the real
IMC test actually demands.

HOW TO USE:
  1. Read a drill's spec. DON'T look at the cheatsheet first.
  2. Open a scratch .py file and write the whole class from a blank line.
  3. Run it against the "Test calls / expected" block at the bottom of each drill.
  4. Only peek at the cheatsheet (or the Hints) if truly stuck — and note that you did.
  5. Goal over time: fewer peeks, faster scaffolding.

The genre (from cheatsheet §0, §19):
  - State lives in dict(s) on the instance: __init__ sets `self.x = {}`.
  - Methods = "look up / mutate the dict / return a value or bool."
  - Reach for: dict.get(k, default), the counter idiom, defaultdict/Counter,
    tuple-key sorting, deepcopy for snapshots, timestamp+ttl for expiry.

Drills ramp in difficulty: 1 (warm-up) -> 7 (multi-dict, stateful).
================================================================================
-->

# Blank-Line Drills — CodeSignal IMC

> Write each class **from a blank line** in a scratch file, then run it against the
> test block. Solutions are at the very bottom — resist until you've attempted.

---

## Drill 1 — WordBank (warm-up: counter idiom)

A frequency tracker built by hand (don't use `collections.Counter`).

- `__init__(self)` — set up empty state.
- `add(self, word)` — increment `word`'s count by 1 (from 0 if new); **return** the new count.
- `count(self, word)` — return current count (0 if never seen).
- `unique(self)` — return the number of distinct words seen.

**Test calls / expected:**
```
b = WordBank()
b.add("a")        # 1
b.add("a")        # 2
b.add("b")        # 1
b.count("a")      # 2
b.count("zzz")    # 0   <- never seen, must not crash
b.unique()        # 2
```
*Skills:* counter idiom, `dict.get(k, 0)`, `len(dict)`.

---

## Drill 2 — TagGroups (grouping idiom)

Group items under a key.

- `__init__(self)` — empty state.
- `tag(self, item, label)` — record that `item` has `label`. Each label maps to a
  **list** of items (in insertion order). An item may appear under multiple labels.
- `items_for(self, label)` — return the list of items for `label` (empty list `[]` if none).
- `labels(self)` — return a list of all labels seen, in first-seen order.

**Test calls / expected:**
```
g = TagGroups()
g.tag("apple", "fruit")
g.tag("pear", "fruit")
g.tag("apple", "red")
g.items_for("fruit")   # ['apple', 'pear']
g.items_for("red")     # ['apple']
g.items_for("nope")    # []   <- must not crash
g.labels()             # ['fruit', 'red']
```
*Skills:* `setdefault(k, []).append(x)` or `defaultdict(list)`, read-only default.

---

## Drill 3 — Ledger (running balance + history)

Two pieces of state at once.

- `__init__(self)` — set up balance and a transaction history.
- `deposit(self, amount)` — add to balance; **return** the new balance.
- `withdraw(self, amount)` — subtract from balance ONLY if sufficient funds.
  If `amount > balance`, do nothing and return `False`. Otherwise subtract and
  return the new balance.
- `balance(self)` — return current balance.
- `history(self)` — return the list of all successful operations as tuples,
  e.g. `("deposit", 100)`, `("withdraw", 30)`, in order.

**Test calls / expected:**
```
L = Ledger()
L.deposit(100)     # 100
L.withdraw(30)     # 70
L.withdraw(1000)   # False  (insufficient; no change)
L.balance()        # 70
L.history()        # [("deposit", 100), ("withdraw", 30)]
```
*Skills:* accumulator, guard clause returning bool, appending to a history list.

---

## Drill 4 — TTLStore (expiry — the timestamp pattern)

Key/value store where entries expire. Time is passed in as an int — no real clock.

- `__init__(self)` — empty state.
- `set(self, key, value, timestamp, ttl)` — store `value` under `key`; it expires
  at `timestamp + ttl`.
- `get(self, key, timestamp)` — return the value if it exists AND has not expired
  at `timestamp` (alive while `timestamp < expires_at`). Otherwise return `None`.

**Test calls / expected:**
```
s = TTLStore()
s.set("a", "x", 100, 50)   # expires at 150
s.get("a", 120)            # "x"   (alive)
s.get("a", 150)            # None  (exactly at expiry = expired, using <)
s.get("a", 200)            # None  (expired)
s.get("missing", 100)      # None  (never set)
```
*Skills:* store `(value, timestamp+ttl)` tuple, compare `timestamp < expires_at`,
mind the `<` vs `<=` boundary.

---

## Drill 5 — Leaderboard (top-N with tie-break — high value)

The single most common "hard-ish" IMC shape.

- `__init__(self)` — empty state.
- `add_score(self, name, points)` — add `points` to `name`'s total (from 0 if new).
- `top(self, n)` — return a list of the top `n` names as `(name, total)` tuples,
  sorted by **total descending, then name ascending** on ties.

**Test calls / expected:**
```
L = Leaderboard()
L.add_score("alice", 50)
L.add_score("bob", 50)
L.add_score("carol", 30)
L.add_score("alice", 20)   # alice now 70
L.top(2)                   # [("alice", 70), ("bob", 50)]
L.top(5)                   # [("alice",70),("bob",50),("carol",30)]  (n > count is fine)
```
*Skills:* counter accumulate, `sorted(d.items(), key=lambda kv: (-kv[1], kv[0]))[:n]`.

---

## Drill 6 — VersionedConfig (snapshot / restore — deepcopy)

A settings store with backup/restore. The deepcopy trap lives here.

- `__init__(self)` — empty config dict.
- `set(self, key, value)` — set `config[key] = value` (value may be a list/dict).
- `get(self, key)` — return the value (or `None`).
- `snapshot(self)` — save a backup of the ENTIRE current config so later mutations
  don't leak into it.
- `restore(self)` — replace current config with the last snapshot, such that future
  edits also don't corrupt the saved snapshot.

**Test calls / expected:**
```
c = VersionedConfig()
c.set("tags", ["a", "b"])
c.snapshot()
c.get("tags").append("c")   # mutate live state AFTER snapshot
c.set("extra", 1)
c.restore()
c.get("tags")               # ["a", "b"]   (snapshot was frozen, "c" did NOT leak)
c.get("extra")              # None          (added after snapshot, gone after restore)
```
*Skills:* `copy.deepcopy` on snapshot AND restore; why shallow copy fails here.

---

## Drill 7 — TaskQueue (multi-dict state machine + ordering)

The "track the status of each X" genre, combined.

- `__init__(self)` — set up state for task status and task priority.
- `submit(self, task_id, priority)` — register a task as `"pending"` with a priority (int).
- `start(self, task_id)` — mark `"running"`. Return `False` if task_id unknown.
- `complete(self, task_id)` — mark `"done"`. Return `False` if task_id unknown.
- `status(self, task_id)` — return the status string, or `None` if unknown.
- `pending(self)` — return a list of task_ids still `"pending"`, sorted by
  **priority descending, then task_id ascending**.

**Test calls / expected:**
```
q = TaskQueue()
q.submit("t1", 5)
q.submit("t2", 5)
q.submit("t3", 9)
q.start("t1")
q.status("t1")      # "running"
q.status("nope")    # None
q.start("nope")     # False
q.pending()         # ["t3", "t2"]   (t3 prio 9 first; t1 is running so excluded;
                    #                  t2 before... wait: only pending are t2,t3)
                    # -> ["t3", "t2"]   (9 desc first, then 5s by id asc)
q.complete("t2")
q.pending()         # ["t3"]
```
*Skills:* two dicts (status + priority), status as a string state machine,
filter-then-sort with tuple key, guard clauses returning bool/None.

---

---
---

# SOLUTIONS (don't peek until you've attempted!)

<details>
<summary>Drill 1 — WordBank</summary>

```python
class WordBank:
    def __init__(self):
        self.counts = {}

    def add(self, word):
        self.counts[word] = self.counts.get(word, 0) + 1
        return self.counts[word]

    def count(self, word):
        return self.counts.get(word, 0)

    def unique(self):
        return len(self.counts)
```
</details>

<details>
<summary>Drill 2 — TagGroups</summary>

```python
class TagGroups:
    def __init__(self):
        self.groups = {}     # label -> [items]

    def tag(self, item, label):
        self.groups.setdefault(label, []).append(item)

    def items_for(self, label):
        return self.groups.get(label, [])

    def labels(self):
        return list(self.groups)     # keys in insertion order
```
</details>

<details>
<summary>Drill 3 — Ledger</summary>

```python
class Ledger:
    def __init__(self):
        self.bal = 0
        self.log = []

    def deposit(self, amount):
        self.bal += amount
        self.log.append(("deposit", amount))
        return self.bal

    def withdraw(self, amount):
        if amount > self.bal:
            return False
        self.bal -= amount
        self.log.append(("withdraw", amount))
        return self.bal

    def balance(self):
        return self.bal

    def history(self):
        return self.log
```
</details>

<details>
<summary>Drill 4 — TTLStore</summary>

```python
class TTLStore:
    def __init__(self):
        self.store = {}     # key -> (value, expires_at)

    def set(self, key, value, timestamp, ttl):
        self.store[key] = (value, timestamp + ttl)

    def get(self, key, timestamp):
        if key not in self.store:
            return None
        value, expires_at = self.store[key]
        if timestamp < expires_at:
            return value
        return None
```
</details>

<details>
<summary>Drill 5 — Leaderboard</summary>

```python
class Leaderboard:
    def __init__(self):
        self.scores = {}     # name -> total

    def add_score(self, name, points):
        self.scores[name] = self.scores.get(name, 0) + points

    def top(self, n):
        return sorted(self.scores.items(),
                      key=lambda kv: (-kv[1], kv[0]))[:n]
```
</details>

<details>
<summary>Drill 6 — VersionedConfig</summary>

```python
import copy

class VersionedConfig:
    def __init__(self):
        self.config = {}
        self.backup = {}

    def set(self, key, value):
        self.config[key] = value

    def get(self, key):
        return self.config.get(key)

    def snapshot(self):
        self.backup = copy.deepcopy(self.config)

    def restore(self):
        self.config = copy.deepcopy(self.backup)
```
Note: deepcopy on BOTH snapshot and restore. Snapshot deepcopy freezes the backup
so live mutations don't leak in; restore deepcopy means future edits to config
don't corrupt the saved backup (they'd share nested objects otherwise).
</details>

<details>
<summary>Drill 7 — TaskQueue</summary>

```python
class TaskQueue:
    def __init__(self):
        self.status_of = {}      # task_id -> "pending"/"running"/"done"
        self.priority = {}       # task_id -> int

    def submit(self, task_id, priority):
        self.status_of[task_id] = "pending"
        self.priority[task_id] = priority

    def start(self, task_id):
        if task_id not in self.status_of:
            return False
        self.status_of[task_id] = "running"

    def complete(self, task_id):
        if task_id not in self.status_of:
            return False
        self.status_of[task_id] = "done"

    def status(self, task_id):
        return self.status_of.get(task_id)

    def pending(self):
        ids = [t for t in self.status_of if self.status_of[t] == "pending"]
        return sorted(ids, key=lambda t: (-self.priority[t], t))
```
</details>

---
---

<!--
================================================================================
TARGETED WEAK-SPOT DRILLS — built from mistakes made during the 2026-06 session.
These hit the specific concepts that tripped me up, not general coverage.
Part A = fast predict-output micro-reps (recognition). Part B = blank-line writes
that FORCE the exact patterns I got wrong (recall). Do Part A first to warm up
the concept, then Part B to prove I can produce it cold.
================================================================================
-->

# TARGETED WEAK-SPOT DRILLS

Built from the specific errors I made. Each block names the concept, gives quick
predict-output reps, then a blank-line write that forces the pattern.

## Weak spot A — Object ownership (`self.x` vs `self`) + `.get()` vs `[]`

> The Counter5 bugs: I called `self.values()` (wrong — `.values()` is a *dict*
> method, belongs to `self.items`) and used `self.items[id]` (crashes `KeyError`
> on a missing key; `.get(id, 0)` is safe).

**Predict the output / "does it crash?":**
```python
d = {"a": 1}
d["b"]            # 1. ?
d.get("b")        # 2. ?
d.get("b", 0)     # 3. ?
d["a"]            # 4. ?

class Box:
    def __init__(self):
        self.data = {}
    def put(self, k, v):
        self.data[k] = v
    def total(self):
        return sum(self.data.values())   # 5. why NOT self.values()?
```
Answers: 1. `KeyError` (crashes)  2. `None`  3. `0`  4. `1`  5. because `.values()`
is a dict method — `self` is a `Box`, the dict is `self.data`.

**Blank-line write — `SafeRegistry`:**
- `__init__(self)` — empty dict state.
- `register(self, key, value)` — store value under key.
- `lookup(self, key)` — return the value, or the string `"unknown"` if absent
  (must NOT raise KeyError).
- `size(self)` — number of registered keys.
- `all_values(self)` — sum of all values (assume ints), 0 if empty.

```
r = SafeRegistry()
r.register("x", 10)
r.register("y", 5)
r.lookup("x")        # 10
r.lookup("z")        # "unknown"   <- must not crash
r.size()             # 2
r.all_values()       # 15
```
*Forces:* `.get(k, default)`, `self.data.values()` aimed at the dict not self.

---

## Weak spot B — `or`/`and` return an OPERAND, not a boolean

> Quiz miss: `0 or "" or "x" or "y"` → I said `True`, it's `"x"`. `or` returns the
> first truthy operand (or the last one if all falsy); `and` returns the first
> falsy operand (or the last if all truthy). Neither converts to bool.

**Predict the exact value (not True/False — the actual operand):**
```python
a = 0 or "" or "hi" or "bye"      # 1. ?
b = "first" or "second"           # 2. ?
c = 0 and 5                        # 3. ?
d = 3 and 0 and 9                  # 4. ?
e = [] or {} or "fallback"        # 5. ?
f = "x" and "y" and "z"           # 6. ?
g = None or 0 or ""               # 7. ? (all falsy — what comes back?)
```
Answers: 1. `"hi"`  2. `"first"`  3. `0`  4. `0`  5. `"fallback"`  6. `"z"`
7. `""` (the LAST operand, since all are falsy).

Rule to bank: **`or` = "first truthy, else last"; `and` = "first falsy, else last".**
This is why `val or default` works as a default-filler.

---

## Weak spot C — dicts iterate/test KEYS; use `.items()` for pairs

> `2 in d` checks keys not values (I skipped it). `sorted(votes, ...)` iterates
> KEYS — needed `sorted(votes.items(), ...)` to get (k, v) pairs.

**Predict:**
```python
d = {"a": 1, "b": 2}
"a" in d              # 1. ?
2 in d                # 2. ? (2 is a VALUE — does `in` see it?)
2 in d.values()       # 3. ?
list(d)               # 4. ? (list of what?)
[x for x in d]        # 5. ?
sorted(d)             # 6. ? (sorts what?)
```
Answers: 1. `True`  2. `False` (in checks keys)  3. `True`  4. `['a','b']` (keys)
5. `['a','b']` (keys)  6. `['a','b']` (sorted keys).

**Blank-line write — `VoteCount`:**
- `__init__(self)` — empty dict.
- `vote(self, candidate)` — +1 for candidate (from 0 if new).
- `has_votes(self, candidate)` — return True if candidate has been voted for at
  least once (use key membership).
- `ranking(self)` — list of `(candidate, votes)` sorted by **votes desc, name asc**.

```
v = VoteCount()
v.vote("alice"); v.vote("bob"); v.vote("alice")
v.has_votes("alice")   # True
v.has_votes("zara")    # False
v.ranking()            # [("alice", 2), ("bob", 1)]
```
*Forces:* `.items()` in the sort (NOT bare `self.tally`), key membership, tuple key.

---

## Weak spot D — `defaultdict(factory)` takes a FACTORY, not data

> Section 16: I wrote `defaultdict(words)`. The argument is a zero-arg callable
> that BUILDS the default: `list`, `int`, `set`, `dict` — no parens, not your data.

**Predict / spot-the-bug:**
```python
from collections import defaultdict
dd = defaultdict(list)
dd["x"].append(1)          # 1. dd is? (does missing key crash?)
dd2 = defaultdict(int)
dd2["a"] += 1              # 2. dd2 is?
dd3 = defaultdict(set)
dd3["k"].add(7)            # 3. dd3 is?
# Which is the bug?  defaultdict([1,2,3])  vs  defaultdict(list)
```
Answers: 1. `{'x': [1]}`  2. `{'a': 1}`  3. `{'k': {7}}`.
Bug: `defaultdict([1,2,3])` — that's data, not a factory (raises when a missing
key is accessed: the default isn't callable). Correct is `defaultdict(list)`.

---

## Weak spot E — `Counter.most_common` ties break by INSERTION order

> Section 11: for `Counter("mississippi")`, top-2 is `[('i',4),('s',4)]` — `i`
> before `s` because `i` appears FIRST in the string, NOT because of the alphabet.
> When ties must break alphabetically, DON'T trust most_common — sort explicitly.

**Predict:**
```python
from collections import Counter
Counter("ssiiaa").most_common(3)
#  all three appear twice. What ORDER? (think first-seen)
# 1. ?

# Want ties broken ALPHABETICALLY instead — fill the key:
c = Counter("ssiiaa")
sorted(c.items(), key=lambda kv: (______, ______))
# 2. what goes in the blanks, and what's the result?
```
Answers: 1. `[('s',2),('i',2),('a',2)]` (s seen first, then i, then a).
2. `key=lambda kv: (-kv[1], kv[0])` → `[('a',2),('i',2),('s',2)]` (count desc,
   then NAME asc — now alphabetical). This is the reliable top-N for tie rules.

---

## Weak spot F — dataclass `==` compares by VALUE; `field()` for mutable defaults

> Section 12: I said two equal-field instances were `!=`. They're `==` — dataclass
> auto-generates value-based `__eq__`. Also: mutable defaults need
> `field(default_factory=list)`, written `name: type = field(...)`.

**Predict:**
```python
from dataclasses import dataclass, field

@dataclass
class P:
    x: int
    y: int = 0
    tags: list = field(default_factory=list)

P(1) == P(1, 0)            # 1. ? (defaults vs explicit — equal?)
P(1) == P(1, 0, [])        # 2. ?
P(1) == P(2)               # 3. ?
P(1).tags is P(1).tags     # 4. ? (do two instances SHARE the default list?)
```
Answers: 1. `True`  2. `True`  3. `False`  4. `False` (each instance gets its OWN
fresh list — that's the whole point of `default_factory`).

---

---

# SOLUTIONS — Targeted drills (blank-line writes)

<details>
<summary>Weak spot A — SafeRegistry</summary>

```python
class SafeRegistry:
    def __init__(self):
        self.data = {}

    def register(self, key, value):
        self.data[key] = value

    def lookup(self, key):
        return self.data.get(key, "unknown")

    def size(self):
        return len(self.data)

    def all_values(self):
        return sum(self.data.values())
```
</details>

<details>
<summary>Weak spot C — VoteCount</summary>

```python
class VoteCount:
    def __init__(self):
        self.tally = {}

    def vote(self, candidate):
        self.tally[candidate] = self.tally.get(candidate, 0) + 1

    def has_votes(self, candidate):
        return candidate in self.tally

    def ranking(self):
        return sorted(self.tally.items(), key=lambda kv: (-kv[1], kv[0]))
```
</details>

---
---

<!--
================================================================================
CAPSTONE WEAK-SPOT DRILLS — built from the HelpDesk capstone (2026-06-08).
Logic was strong; these target the 2 CONCEPTUAL gaps that actually cause silent
bugs / crashes on hidden tests (not the typos, which the real editor catches):
  G — `and` short-circuit ORDER: cheap/safe guard must come first.
  H — "count per key" = explicit counter loop, NOT a comprehension.
Plus 2 reinforcers (nested lookups, the filter->sort->slice pipeline).
================================================================================
-->

# CAPSTONE WEAK-SPOT DRILLS (from HelpDesk, 2026-06-08)

The capstone logic was solid. These hit the concepts that crash on a HIDDEN test
even when the visible ones pass — the dangerous kind. Do the predict-output reps,
then the blank-line write that forces the exact pattern.

## Weak spot G — `and` short-circuits L→R: put the SAFE guard first

> Capstone bug: `d[t]['assignee'] == x and d[t]['status'] == 'assigned'` crashed
> `KeyError` on a record with no `'assignee'` key. `and` evaluates the LEFT side
> first — if it raises, short-circuit never saves you. The cheap/safe check
> (membership, status, not-None) must come FIRST to protect the risky lookup.

**Predict — "value, or does it CRASH?":**
```python
d = {"a": {"status": "open"}}          # note: no "agent" key on this record

# 1. order that CRASHES vs order that's SAFE — which is which?
d["a"]["agent"] == "x" and d["a"]["status"] == "open"      # 1. ?
d["a"]["status"] == "open" and d["a"]["agent"] == "x"      # 2. ?

x = None
x is not None and x.value > 0           # 3. ? (crash or False?)
x.value > 0 and x is not None           # 4. ? (crash or False?)

cfg = {"a": 1}
"b" in cfg and cfg["b"] > 0              # 5. ? (crash or False?)
cfg["b"] > 0 and "b" in cfg             # 6. ? (crash or False?)
```
Answers: 1. **CRASH** (`KeyError: 'agent'` — risky lookup ran first)  2. `False`
(status check fails, short-circuits, never touches `'agent'`)  3. `False` (guard
first)  4. **CRASH** (`None.value`)  5. `False` (membership guard first)
6. **CRASH** (`KeyError: 'b'`). Rule: **guard on the LEFT, deref on the RIGHT.**

**Blank-line write — `AccessLog`:** records may or may not have a `"role"` key.
- `__init__(self)` — `self.users = {}`  (user_id -> record dict).
- `add(self, user_id)` — create record `{"active": True}` (NO `"role"` key yet).
- `set_role(self, user_id, role)` — set the record's `"role"`.
- `admins(self)` — return list of user_ids that are BOTH `active` AND have role
  `"admin"`. Must NOT crash on users who never got a role. Order doesn't matter.

```
a = AccessLog()
a.add("u1"); a.add("u2"); a.add("u3")
a.set_role("u1", "admin")
a.set_role("u3", "user")
# u2 has NO role key at all
sorted(a.admins())     # ["u1"]   <- must not KeyError on u2
```
*Forces:* a guard (`"role" in rec` or `.get("role")`) BEFORE comparing the role.

---

## Weak spot H — "count per key" = counter LOOP, not a comprehension

> Capstone thrash: tried to build agent->count with comprehensions
> (`dict(agent, load)`, `self.items[:]`...). Comprehensions TRANSFORM/FILTER a
> sequence (one-in, one-out). They CANNOT accumulate into buckets. The moment the
> task is "how many X per key" or "group X by key", reach for the explicit loop.

**Predict / spot-the-tool:**
```python
nums = [1, 1, 2, 3, 3, 3]

# Which of these actually COUNTS occurrences? Which is the wrong tool?
a = {n: n for n in nums}                       # 1. what is a? does it count?
b = {}
for n in nums:
    b[n] = b.get(n, 0) + 1                     # 2. what is b?
c = [n for n in nums if n == 3]                # 3. what is c? (count or list?)

# Grouping: words by first letter
words = ["ant", "bee", "ape"]
g = {}
for w in words:
    g.setdefault(w[0], []).append(w)           # 4. what is g?
```
Answers: 1. `{1:1, 2:2, 3:3}` — a dict keyed by value, **does NOT count** (later
dupes overwrite, value is just the number). Wrong tool.  2. `{1:2, 2:1, 3:3}` —
the counter, correct.  3. `[3, 3, 3]` — a filtered LIST; `len(c)` would count but
that's per-value, not all-at-once.  4. `{"a": ["ant","ape"], "b": ["bee"]}` — the
grouping idiom. **Counting/grouping needs a loop that mutates a dict; a
comprehension can't accumulate.**

**Blank-line write — `OrderBook`:** count and group at once.
- `__init__(self)` — set up state for per-symbol share totals AND per-trader fills.
- `fill(self, trader, symbol, shares)` — record a fill: add `shares` to `symbol`'s
  running total, AND append `(symbol, shares)` to that trader's fill list.
- `volume(self, symbol)` — total shares filled for `symbol` (0 if none).
- `fills_for(self, trader)` — list of `(symbol, shares)` for trader, in order (`[]` if none).
- `top_symbols(self, n)` — top `n` symbols by volume as `(symbol, vol)` tuples,
  **volume desc, then symbol asc** on ties.

```
ob = OrderBook()
ob.fill("alice", "AAPL", 100)
ob.fill("bob",   "AAPL", 50)
ob.fill("alice", "MSFT", 150)
ob.fill("carol", "TSLA", 90)
ob.volume("AAPL")        # 150
ob.volume("ZZZZ")        # 0
ob.fills_for("alice")    # [("AAPL", 100), ("MSFT", 150)]
ob.fills_for("nobody")   # []
ob.top_symbols(2)        # [("AAPL", 150), ("MSFT", 150)]  (AAPL & MSFT tie 150 -> name asc; TSLA 90 out)
```
*Forces:* counter idiom (`vol[sym] = vol.get(sym,0)+shares`) for accumulation +
the grouping idiom (`setdefault(trader, []).append(...)`) — NOT a comprehension —
then the filter-free top-N sort `sorted(vol.items(), key=lambda kv:(-kv[1],kv[0]))[:n]`.

---

## Reinforcers — nested lookups & the filter→sort→slice pipeline

> Two patterns the capstone got right but with hesitation. Keep them reflexive.

**Predict — one `.get`/index per LEVEL of nesting:**
```python
db = {"u1": {"name": "al", "tags": ["x"]}}

db["u1"]["name"]                 # 1. ?
db.get("u9", {}).get("name")     # 2. ? (missing user — crash or None?)
db["u9"]["name"]                 # 3. ? (crash or None?)
db.get("u1", {}).get("name")     # 4. ?
```
Answers: 1. `"al"`  2. `None` (empty-dict default absorbs the miss — safe)
3. **CRASH** (`KeyError: 'u9'`)  4. `"al"`. Nested state = **two moves**: get the
record (with a `{}` default), then get the field. One `.get` per level.

**Blank-line write — `Tournament` (the canonical filter→sort→slice shape):**
- `__init__(self)` — `self.players = {}`  (name -> {"score": int, "active": bool}).
- `join(self, name)` — record `{"score": 0, "active": True}`.
- `award(self, name, pts)` — add `pts` to that player's score (ignore unknown names).
- `eliminate(self, name)` — set `active` False (ignore unknown).
- `standings(self, n)` — top `n` ACTIVE players as `(name, score)`,
  **score desc, name asc**. Eliminated players excluded.

```
t = Tournament()
t.join("a"); t.join("b"); t.join("c")
t.award("a", 30); t.award("b", 30); t.award("c", 50)
t.eliminate("c")
t.award("zzz", 99)            # unknown -> ignored, no crash
t.standings(5)                # [("a", 30), ("b", 30)]  (c eliminated; tie -> name asc)
```
*Forces:* the three stages — FILTER (active only), SORT (`(-score, name)` tuple
key reaching into the record), SLICE (`[:n]`) — plus an unknown-name guard on award.

---
---

# SOLUTIONS — Capstone weak-spot drills

<details>
<summary>Weak spot G — AccessLog</summary>

```python
class AccessLog:
    def __init__(self):
        self.users = {}

    def add(self, user_id):
        self.users[user_id] = {"active": True}

    def set_role(self, user_id, role):
        self.users[user_id]["role"] = role

    def admins(self):
        out = []
        for uid in self.users:
            rec = self.users[uid]
            # guard FIRST: active and HAS a role, before comparing the role
            if rec["active"] and rec.get("role") == "admin":
                out.append(uid)
        return out
```
Key: `rec.get("role") == "admin"` never raises on a roleless record (`.get` ->
`None` -> `None == "admin"` is just `False`). If you used `rec["role"]` you'd need
`"role" in rec and rec["role"] == "admin"` — guard on the left either way.
</details>

<details>
<summary>Weak spot H — OrderBook</summary>

```python
class OrderBook:
    def __init__(self):
        self.vol = {}        # symbol -> total shares  (COUNTER)
        self.by_trader = {}  # trader -> [(symbol, shares)]  (GROUPING)

    def fill(self, trader, symbol, shares):
        self.vol[symbol] = self.vol.get(symbol, 0) + shares
        self.by_trader.setdefault(trader, []).append((symbol, shares))

    def volume(self, symbol):
        return self.vol.get(symbol, 0)

    def fills_for(self, trader):
        return self.by_trader.get(trader, [])

    def top_symbols(self, n):
        return sorted(self.vol.items(), key=lambda kv: (-kv[1], kv[0]))[:n]
```
Two accumulation idioms side by side: `.get(k,0)+x` to COUNT, `setdefault(k,[]).append`
to GROUP. Neither is a comprehension — both need a statement that mutates the dict.
</details>

<details>
<summary>Reinforcer — Tournament</summary>

```python
class Tournament:
    def __init__(self):
        self.players = {}

    def join(self, name):
        self.players[name] = {"score": 0, "active": True}

    def award(self, name, pts):
        if name not in self.players:      # guard unknown
            return
        self.players[name]["score"] += pts

    def eliminate(self, name):
        if name not in self.players:
            return
        self.players[name]["active"] = False

    def standings(self, n):
        active = [name for name in self.players if self.players[name]["active"]]   # FILTER
        active.sort(key=lambda name: (-self.players[name]["score"], name))         # SORT
        return [(name, self.players[name]["score"]) for name in active][:n]        # EXTRACT+SLICE
```
The filter→sort→slice pipeline. Note the final comprehension here is the RIGHT use
of one: transforming a list of names into `(name, score)` pairs — one-in, one-out,
no accumulation.
</details>
