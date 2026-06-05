# Problem 02 — Banking System

A toy bank backend. You implement the `Bank` class. Four cumulative levels. **The test
suite is the real spec.** This is a classic IMC archetype: accounts, transfers, ranking, and
scheduled/payment operations with ordering rules.

> Difficulty: **medium.** Treat this as your first full **90-minute timed mock** (Day 3).

How to work it:
1. Fill in `starter.py` (copy of `interface.py`).
2. `pytest tests.py -k level1` → `level2` → `level3` → `level4`.
3. Reference in `solution.py`.

All amounts are non-negative integers. Timestamps are integers passed in by the caller
(milliseconds since some epoch) and only ever increase across calls within a test.

---

## Level 1 — Accounts and balances

- `create_account(timestamp, account_id)` — create an account with balance 0. Returns `True`
  if created, `False` if an account with that id already exists.
- `deposit(timestamp, account_id, amount)` — add `amount` to the account. Returns the new
  balance, or `None` if the account does not exist.
- `withdraw(timestamp, account_id, amount)` — subtract `amount` if funds are sufficient.
  Returns the new balance, or `None` if the account doesn't exist **or** has insufficient
  funds (no overdraft).

## Level 2 — Transfers and transaction totals

- `transfer(timestamp, source_id, target_id, amount)` — move `amount` from source to target.
  Returns the source's new balance, or `None` if either account is missing, source equals
  target, or source has insufficient funds.
- `top_spenders(n)` — return the `n` account ids with the highest total **outgoing** money
  (withdrawals + transfers out), most first. Break ties by `account_id` ascending. Returns
  all accounts (those with 0 outgoing included) if fewer than `n` exist.

## Level 3 — Scheduled payments

- `schedule_payment(timestamp, account_id, amount, delay)` — schedule a withdrawal of
  `amount` from `account_id` to occur at time `timestamp + delay`. Returns a payment id
  string of the form `"payment{ordinal}"` where `ordinal` starts at 1 and increases by 1 for
  every scheduled payment across the whole bank (`"payment1"`, `"payment2"`, ...). Returns
  `None` if the account does not exist.
- `cancel_payment(timestamp, account_id, payment_id)` — cancel a scheduled, not-yet-executed
  payment. Returns `True` if cancelled, `False` if the payment id is unknown, already
  executed, already cancelled, or does not belong to `account_id`.

Scheduled payments execute lazily: **before** processing any operation at a given
`timestamp`, all payments whose execution time is `<= timestamp` run, in order of execution
time (ties broken by ordinal). A payment executes only if the account has sufficient funds at
that moment; if not, it is skipped (treated as executed — it does not retry) — **but check
the tests for the exact skip behavior.**

## Level 4 — Merging accounts

- `merge_accounts(timestamp, target_id, source_id)` — merge `source_id` into `target_id`:
  source's balance is added to target, source's outgoing-total is added to target's outgoing
  history (for `top_spenders`), source's pending scheduled payments are reassigned to target,
  and the source account is removed. Returns `True` on success; `False` if either account is
  missing or `target_id == source_id`.
- `balance(timestamp, account_id)` — return the account balance after first running any
  payments due at `timestamp`. Returns `None` if the account does not exist (and was not
  merged — a merged-away id is gone).

> Ambiguity warning: what happens to a payment scheduled on a since-merged account, or the
> exact tie-break between same-time payments — **the tests are the only source of truth.**
