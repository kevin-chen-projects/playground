# Problem 04 — In-Memory Database

A toy key/field database (think a tiny Redis with hash records). You implement the
`InMemoryDB` class. Four cumulative levels. **The test suite is the real spec.** This is the
canonical hard IMC problem: records with fields, filtering/scanning, **TTL via timestamps**,
and **backup/restore with `copy.deepcopy`**.

> Difficulty: **hard — the spec-reading stress test.** Time it (Day 4). Expect Levels 3–4 to
> eat most of the clock. Bank partial credit aggressively.

How to work it: fill `starter.py`, run `pytest tests.py -k level1` ... `level4`, reference in
`solution.py`. Timestamps are integers, non-decreasing across calls within a test.

A "record" is identified by a `key` and holds named `field -> value` entries (values are
integers). `set` with TTL means the field lives only for a bounded window.

---

## Level 1 — Set / get / delete fields

- `set(key, field, value)` — set `field` of record `key` to `value` (creating the record if
  needed). Returns nothing meaningful (`None`).
- `get(key, field)` — return the value, or `None` if the record or field doesn't exist.
- `delete(key, field)` — delete a field from a record. Returns `True` if it existed and was
  deleted, `False` otherwise. (If removing the last field leaves the record empty, the record
  may stay or go — let the tests decide what's observable.)
- `scan(key)` — return a list of `"field(value)"` strings for the record, sorted by field
  name ascending. Empty list if the record doesn't exist.

## Level 2 — Prefix scan

- `scan_by_prefix(key, prefix)` — like `scan(key)` but only fields whose name starts with
  `prefix`, sorted by field name ascending.

## Level 3 — TTL (timestamped operations)

Now operations carry a `timestamp`. The non-TTL operations from Levels 1–2 still exist; treat
their fields as living forever. New timestamped variants:

- `set_at(key, field, value, timestamp)` — set a field with no expiry, at `timestamp`.
- `set_at_with_ttl(key, field, value, timestamp, ttl)` — set a field that **expires** at
  `timestamp + ttl` (i.e. it is alive for queries with `query_ts < timestamp + ttl`, and gone
  at `query_ts >= timestamp + ttl`).
- `get_at(key, field, timestamp)` — like `get`, but a field that has expired by `timestamp`
  is treated as absent (returns `None`).
- `delete_at(key, field, timestamp)` — like `delete`, but operates as of `timestamp` (an
  already-expired field counts as not present → returns `False`).
- `scan_at(key, timestamp)` / `scan_by_prefix_at(key, prefix, timestamp)` — like the Level
  1–2 scans, but exclude fields expired by `timestamp`.

Re-`set`-ing an existing field overwrites its value **and** its expiry (a plain `set_at`
clears any prior TTL on that field). **Confirm the exact overwrite semantics in the tests.**

## Level 4 — Backup and restore

- `backup(timestamp)` — snapshot the entire database state as of `timestamp`. Expiry
  information is preserved **relative to the backup time**: a field that would expire at
  `E` is stored with remaining ttl `E - timestamp` (fields already expired at `timestamp`
  are not included). Returns the number of non-empty records backed up.
- `restore(timestamp, timestamp_to_restore)` — replace the live database with the backup
  taken at-or-before `timestamp_to_restore` (the most recent such backup). Each restored TTL
  field's expiry is **recomputed relative to the restore `timestamp`**: a field that had
  remaining ttl `r` in the backup now expires at `timestamp + r`. Non-expiring fields stay
  non-expiring. Returns nothing meaningful.

> Ambiguity warning: how empty records are reported by `scan`, whether `restore` picks the
> nearest backup at-or-before the target, and the exact expiry-recompute math — **only the
> tests are authoritative.** Use `copy.deepcopy` so a backup never shares mutable state with
> the live database.
