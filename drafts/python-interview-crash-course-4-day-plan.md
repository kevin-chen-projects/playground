# 4-Day Python Interview Crash Course

## Goal
Prepare for a CodeSignal-style Python assessment focused on core language skills, fast implementation, and iterative refactoring under changing specs.

## How to use this plan
This is designed as a **2-hour exercise every day for 4 days**, split into **two 1-hour chunks**.

The emphasis is on:
- reading specs carefully
- writing working Python quickly
- using the standard library when useful
- handling evolving requirements level by level
- building muscle memory through practice and review

If a task says to review broken code, that means you should practice debugging and refactoring against failing tests or an intentionally flawed solution.

---

## Day 1 — Core language speed

### Hour 1: Read + implement fundamentals
**Focus:** syntax, control flow, and data structures.

Practice problems:
- frequency count for a list of values
- deduplicate while preserving order
- reverse / palindrome / string normalization
- merge or update dictionaries
- simple membership and filtering tasks
- flatten one level of nested lists

What to review:
- truthiness and `None`
- `if/elif/else`, `for`, `while`, `break`, `continue`
- lists, dicts, sets, tuples
- slicing and unpacking
- mutation vs copying

### Hour 2: Troubleshoot broken code
**Focus:** spot bugs quickly and repair them.

Practice situations:
- input is being mutated unexpectedly
- off-by-one errors in loops
- wrong return type or shape
- missing edge case for empty input
- default argument bug from a mutable list/dict
- incorrect use of `==` vs `is`

Goal:
- read a broken function
- explain the bug
- patch it with the smallest change that passes the spec

---

## Day 2 — Stateful code and classes

### Hour 1: Build small object-based exercises
**Focus:** classes, instance state, and method behavior.

Practice problems:
- bank account with deposit/withdraw/balance
- shopping cart with add/remove/total
- task list with completion state
- inventory tracker with counts
- playlist or queue manager

What to review:
- `__init__`
- instance variables
- class vs instance variables
- returning copies when needed
- `@dataclass`
- `collections` helpers like `Counter`, `defaultdict`, `deque`

### Hour 2: Review and repair state bugs
**Focus:** hidden-test style failures caused by state.

Practice situations:
- returned list can be mutated by the caller
- stale state carries across method calls
- duplicate handling is wrong
- object equality or representation mismatch
- shallow copy vs deep copy issue

Goal:
- implement a class from a short interface
- then extend it with one new requirement without breaking prior behavior

---

## Day 3 — Refactoring under evolving specs

### Hour 1: Level-up style implementation
**Focus:** start simple, then add features.

Practice format:
1. implement a minimal version
2. run tests mentally or locally
3. extend for a second requirement
4. preserve earlier behavior

Good practice problems:
- booking / reservation tracker
- simple event log
- rate limiter style toy problem
- scoring or grading calculator
- text parser with rules that expand in stages

What to review:
- helper methods for repeated logic
- safe use of `setdefault`, `get`, `defaultdict`
- sorting with `key=`
- validating inputs only where necessary

### Hour 2: Troubleshoot broken refactors
**Focus:** fixing code after requirements changed.

Practice situations:
- one test passes, then later tests fail after a feature change
- new behavior accidentally breaks old cases
- copied code diverged and caused inconsistency
- data model needs a small redesign

Goal:
- practice reading a spec update
- patch the implementation with minimal churn
- keep your attention on passing tests, not polish

---

## Day 4 — Full mock interview day

### Hour 1: Timed mock build
**Focus:** speed and correctness.

Do one full timed mock problem using only the standard library.

Rules:
- read all levels first
- implement the easiest passing subset first
- run/inspect tests frequently
- stop polishing once the tests are green

### Hour 2: Review, debug, repeat
**Focus:** postmortem + second attempt.

Review:
- which spec detail did you miss?
- where did mutation/copying trip you up?
- did you overbuild anything?
- did you spend too long on readability instead of passing tests?

Then do a short second mock or revisit the weakest area from the first hour.

---

## High-value Python topics for the evaluation

### Core language
- lists, dicts, sets, tuples
- loops and conditionals
- functions and default arguments
- unpacking and slicing
- mutation vs immutability
- shallow vs deep copy

### Classes and containers
- `class`, `__init__`, instance state
- `@dataclass`
- `collections.Counter`
- `collections.defaultdict`
- `collections.deque`
- `copy.copy`, `copy.deepcopy`

### Testing mindset
- read the spec like tests will
- assume edge cases matter
- implement the smallest working version first
- extend carefully without breaking earlier behavior

---

## Built-in review mode for broken code
Use these whenever you want an intentional troubleshooting drill:
- wrong output type
- mutation bug
- bad default argument
- stale state in a class
- shallow copy issue
- equality/identity confusion
- off-by-one or missing empty-case handling

---

## Suggested website modules
If this becomes a practice website, the highest-value modules would be:
- **Read the spec** — short prompts with hidden edge cases
- **Implement the function** — quick coding tasks
- **Fix broken code** — debugging/review mode
- **Stateful class drills** — object and mutation practice
- **Refactor the next level** — evolving specs like the real assessment

---

## Done when
You can do 4 consecutive 1-hour sessions with:
- quick reading of the spec
- correct first-pass implementations for simple tasks
- reliable debugging of broken code
- comfort with stateful class problems and standard library helpers
