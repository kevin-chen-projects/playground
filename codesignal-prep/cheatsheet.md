# Python Fundamentals Cheat-Sheet — CodeSignal IMC

Fast-recall reference for the 90-min Industry Coding test. Every entry is an *idiom* plus a
one-line runnable example. Skim it Day 1, re-skim Day 5. The goal is to **stop reaching for
Google** on basic syntax so the clock buys you problem-solving, not recall.

---

## 0. The IMC workflow (read this first)

The test gives you **one toy app, four cumulative levels**, and a **test suite that is the
real spec**. Your loop:

1. **Read the level's spec + the interface class.** Copy the class with its method stubs +
   docstrings into your solution file.
2. **Fill in the method bodies** — plainest code that could pass. No cleverness.
3. **Run the tests early and often.** No penalty. Let failures tell you the real spec.
4. **Don't refactor for beauty.** When the next level lands, extend; don't rewrite.
5. **Banked partial credit:** passing *some* tests in a level counts. If stuck, get the easy
   asserts green and move on.

State almost always lives in a **dict on the instance** (`self.data = {}`). Most methods are
"look something up, mutate a dict, return a value or bool." That's the whole genre.

> Sacrifice readability, efficiency, comments, type hints — everything not in service of
> passing tests fast. This is the one time "good code" is the wrong instinct.

---

## 1. Core types & literals

```python
x = 10; y = 3.5; s = "hi"; b = True; n = None        # int float str bool NoneType
nums = [1, 2, 3]            # list  — ordered, mutable
pair = (1, 2)               # tuple — ordered, immutable (great dict keys)
seen = {1, 2, 3}            # set   — unique, unordered, O(1) membership
d = {"a": 1, "b": 2}        # dict  — key→value, insertion-ordered (3.7+)
```

```python
int("42"), float("3.5"), str(42)          # parse / stringify
int("ff", 16)                              # 255  (base parse)
list("abc")                                # ['a','b','c']
"  hi  ".strip()                           # 'hi'
```

## 2. Numbers & truthiness

```python
7 // 2      # 3   floor division (int result)
7 % 2       # 1   modulo
7 / 2       # 3.5 true division (always float)
2 ** 10     # 1024 power
divmod(7, 2)        # (3, 1)  quotient & remainder together
abs(-5); round(3.14159, 2); min(a, b); max(a, b)
```

Falsy: `0  0.0  ""  []  {}  ()  set()  None  False`. Everything else is truthy.

```python
x = val or "default"          # default if val is falsy
x = a if cond else b          # ternary
```

## 3. Strings

```python
s.split(",")          # 'a,b' -> ['a','b']   (no arg = split on any whitespace)
",".join(["a","b"])   # 'a,b'
s.strip(); s.lstrip(); s.rstrip()
s.lower(); s.upper()
s.startswith("foo"); s.endswith("bar")
s.replace("a", "b")
"foo" in s            # substring test
s.find("x")           # index or -1     ;  s.index("x") raises if absent
s.zfill(3)            # '7' -> '007'
s.rjust(5); s.ljust(5)
f"{name} = {val:.2f}" # f-string with format spec
f"{x:>6}"; f"{x:03d}"; f"{ratio:.1%}"   # align / zero-pad / percent
```

## 4. Slicing  `seq[start:stop:step]`

```python
a = [0,1,2,3,4]
a[1:3]     # [1, 2]      stop is exclusive
a[:2]      # [0, 1]
a[2:]      # [2, 3, 4]
a[-1]      # 4           last
a[-2:]     # [3, 4]      last two
a[::-1]    # [4,3,2,1,0] reversed
a[::2]     # [0, 2, 4]   every other
s[:3]      # works on strings too
```

## 5. Lists

```python
a.append(x); a.extend([x,y]); a.insert(i, x)
a.pop()          # remove & return last     ; a.pop(0) -> first (O(n))
a.remove(x)      # remove first == x (raises if absent)
a.sort(); a.sort(reverse=True); a.sort(key=len)
sorted(a)        # returns a new list (doesn't mutate)
a.reverse()
len(a); x in a; a.count(x); a.index(x)
a + b; a * 3
[0] * 5          # [0,0,0,0,0]
```

## 6. Dicts (your main data structure)

```python
d.get(k)                 # None if missing (no KeyError)
d.get(k, 0)              # default if missing — use for counters
d.setdefault(k, []).append(x)   # init-if-absent then use
d[k] = v; del d[k]; k in d
d.pop(k, None)           # remove & return, default if absent
d.keys(); d.values(); d.items()
for k, v in d.items(): ...
list(d)                  # list of keys
{**d1, **d2}             # merge (d2 wins on conflicts)
d.update(other)
sorted(d.items(), key=lambda kv: kv[1])   # sort by value
```

## 7. Sets

```python
s.add(x); s.discard(x)   # discard = no error if absent ; s.remove(x) raises
a & b   # intersection      a | b  union      a - b  difference      a ^ b  sym-diff
x in s  # O(1) membership
```

## 8. Comprehensions

```python
[x*x for x in nums]                       # list
[x for x in nums if x % 2 == 0]           # with filter
[x if x > 0 else 0 for x in nums]         # conditional value
{k: v for k, v in pairs}                  # dict
{x % 3 for x in nums}                     # set
[(i, j) for i in range(3) for j in range(3)]   # nested
sum(x*x for x in nums)                    # generator expr (no brackets) — lazy
any(x < 0 for x in nums); all(x > 0 for x in nums)
```

## 9. Looping

```python
for i, x in enumerate(a): ...             # index + value
for i, x in enumerate(a, start=1): ...    # 1-based
for x, y in zip(a, b): ...                # parallel iterate (stops at shortest)
for k in range(n); range(start, stop, step)
while cond: ...
# break / continue / else (loop-else runs if no break)
```

## 10. `sorted` / `min` / `max` with `key` (high-value)

```python
sorted(words, key=len)
sorted(items, key=lambda x: x[1])                 # by 2nd field
sorted(items, key=lambda x: (-x[1], x[0]))        # by count desc, then name asc
max(d, key=d.get)                                 # key with largest value
min(points, key=lambda p: p[0]**2 + p[1]**2)
sorted(items, key=lambda x: x[1], reverse=True)
```

**Tie-break trick:** return a tuple from `key`. Negate a number to flip just that field's
direction without `reverse=`.

## 11. `collections` (called out by the evaluator)

```python
from collections import Counter, defaultdict, deque, OrderedDict

Counter("aabbbc")              # {'b':3,'a':2,'c':1}
Counter(words).most_common(3)  # top 3 as [(item, count), ...]
c = Counter(); c[k] += 1       # never KeyErrors

dd = defaultdict(list); dd[k].append(x)     # auto-creates []
dd = defaultdict(int); dd[k] += 1           # auto-creates 0
dd = defaultdict(set); dd[k].add(x)

dq = deque(); dq.append(x); dq.appendleft(x)
dq.pop(); dq.popleft()         # O(1) both ends — use as a queue
dq = deque(maxlen=5)           # ring buffer
```

`defaultdict` vs `d.setdefault`: both work; `defaultdict` is cleaner when *every* access
should auto-init. Use `dict.get(k, default)` for read-only defaults.

## 12. `dataclasses` (called out by the evaluator)

```python
from dataclasses import dataclass, field

@dataclass
class Account:
    name: str
    balance: int = 0                       # default value
    tags: list = field(default_factory=list)   # mutable default — MUST use field()

a = Account("alice")            # Account(name='alice', balance=0, tags=[])
a.balance += 100                # mutable by default
@dataclass(frozen=True)         # immutable + hashable (usable as dict key / in set)
class Point: x: int; y: int
```

Why it helps in IMC: when a record has several fields, a dataclass beats juggling tuples.
But a plain dict is often faster to type — use whichever gets tests green quicker.

## 13. `copy` (called out — critical for backup/restore levels)

```python
import copy
shallow = copy.copy(obj)        # new top-level container, SHARES nested objects
deep    = copy.deepcopy(obj)    # fully independent clone — nested dicts/lists copied too
```

```python
d = {"a": [1, 2]}
s = copy.copy(d);     s["a"].append(3)   # MUTATES d["a"] too!  -> [1,2,3]
e = copy.deepcopy(d); e["a"].append(9)   # d untouched
```

**Rule of thumb:** any "snapshot / backup / restore / checkpoint" level → `deepcopy` the
state so later mutations don't leak into the snapshot. Restore = `deepcopy` it back.

## 14. Time / TTL handling

The test usually passes `timestamp` as an **int argument** — you rarely need the real clock.
Store `expires_at = timestamp + ttl` and on read compare `query_ts < expires_at`.

```python
# expiry pattern
self.store[key] = (value, timestamp + ttl)        # ttl-aware write
val, exp = self.store[key]
if query_ts < exp: return val                      # still alive
else: return None                                  # expired
```

If you *do* need wall-clock: `import time; time.time()` (epoch float). `datetime`:
```python
from datetime import datetime, timedelta
datetime(2026, 6, 4) + timedelta(days=7)
```

## 15. `itertools` quick hits

```python
from itertools import accumulate, groupby, chain, product, combinations
list(accumulate([1,2,3]))            # [1,3,6] running total
list(chain([1,2],[3,4]))             # [1,2,3,4] flatten one level
list(product([0,1], repeat=2))       # [(0,0),(0,1),(1,0),(1,1)]
list(combinations([1,2,3], 2))       # [(1,2),(1,3),(2,3)]
# groupby needs pre-sorted input:
for key, grp in groupby(sorted(data, key=f), key=f): ...
```

## 16. Common IMC patterns

```python
# group-by
g = defaultdict(list)
for item in items: g[item.cat].append(item)

# running total / balance
bal = 0
for amt in amounts: bal += amt

# top-N by count
Counter(events).most_common(n)
sorted(d.items(), key=lambda kv: (-kv[1], kv[0]))[:n]   # count desc, name asc, take n

# prefix search
[k for k in store if k.startswith(prefix)]

# state machine via dict
status = {}                       # id -> "open"/"closed"
status[id] = "closed"

# merge dicts of counts
total = Counter()
for c in list_of_counters: total += c
```

## 17. Gotchas that cost minutes

```python
def f(x, acc=[]):  ...            # BUG: default list shared across calls. Use acc=None.
def f(x, acc=None):
    if acc is None: acc = []

a = [[0]*3]*3                     # BUG: 3 refs to the SAME row. a[0][0]=1 hits all rows.
a = [[0]*3 for _ in range(3)]     # correct

x is None                         # use `is` for None (not ==)
1 == 1.0                          # True  (value)  ;  1 is 1.0 -> False (identity)
b = a                             # alias, not copy! b.append(x) changes a. Use a[:] or list(a).
"10" < "9"                        # True — string compare! cast to int first.
int(7/2)                          # 3 via float; prefer 7//2 to stay integer
dict ordering is insertion order  # iteration is deterministic (3.7+)
```

## 18. Fast-debug tricks

```python
print(repr(x))                    # shows quotes/types — reveals "5" vs 5
print(f"{var=}")                  # prints  var=value   (3.8+)
assert cond, f"got {x}"           # cheap inline check
# In CodeSignal: read the failing test's expected vs actual — that IS the spec.
```

## 19. Class skeleton (what you'll type ~every problem)

```python
class InventoryManager:
    def __init__(self):
        self.items = {}            # id -> {...}  state lives here

    def add(self, id, qty):
        self.items[id] = self.items.get(id, 0) + qty
        return self.items[id]

    def get(self, id):
        return self.items.get(id, 0)
```

That shape — `__init__` sets up dicts, methods read/mutate them — covers most of the test.
