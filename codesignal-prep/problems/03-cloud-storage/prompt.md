# Problem 03 — Cloud Storage

A toy cloud file store. You implement the `CloudStorage` class. Four cumulative levels.
**The test suite is the real spec.** This archetype tests string/prefix handling, per-user
capacity accounting, and ownership transfer — very common on IMC.

> Difficulty: **medium-hard.** Use as a timed run (Day 4).

How to work it: fill `starter.py`, run `pytest tests.py -k level1` ... `level4`, reference in
`solution.py`. File sizes and capacities are non-negative integers.

---

## Level 1 — Files

- `add_file(name, size)` — create a file. Returns `True` if added, `False` if a file with
  that `name` already exists (in which case nothing changes).
- `get_file_size(name)` — return the file's size, or `None` if it doesn't exist.
- `delete_file(name)` — delete the file. Returns the deleted file's size, or `None` if it
  didn't exist.

## Level 2 — Capacity and largest files

- `get_total_size()` — return the summed size of all files currently stored.
- `find_largest(n)` — return up to `n` file names with the largest sizes, biggest first.
  Break ties by name in ascending (alphabetical) order. Returns fewer than `n` if there
  aren't that many files.
- `find_by_prefix(prefix)` — return all file names that start with `prefix`, sorted
  alphabetically.

## Level 3 — Users and quotas

Files can now be owned by users. Files added via `add_file` (Levels 1–2) belong to a default
"admin" owner with unlimited capacity.

- `add_user(user_id, capacity)` — register a user with a storage `capacity` (max total bytes
  they may own). Returns `True` if added, `False` if the user already exists.
- `add_file_by(user_id, name, size)` — add a file owned by `user_id`. Returns the user's
  **remaining** capacity after the add, or `None` if: the user doesn't exist, the file name
  already exists, or the add would exceed the user's capacity (in which case nothing is
  stored).
- `merge_user(user_id_1, user_id_2)` — merge `user_id_2` into `user_id_1`: all of user 2's
  files become owned by user 1, user 1's capacity increases by user 2's **total capacity**,
  and user 2 is removed. Returns user 1's remaining capacity, or `None` if either user is
  missing or the two ids are equal.

## Level 4 — Backup and restore

- `backup_user(user_id)` — snapshot the current set of files owned by `user_id`. Returns the
  number of files backed up, or `None` if the user doesn't exist. A new backup for a user
  replaces any previous backup for that user.
- `restore_user(user_id)` — restore that user's files from their latest backup. Files the
  user owns that are **not** in the backup are deleted. Files in the backup that no longer
  exist are recreated (owned by `user_id`). Files in the backup that still exist keep their
  current state. Capacity is restored to reflect exactly the backed-up files. Returns the
  number of files restored, or `None` if the user doesn't exist. If the user has no backup,
  treat it as an empty backup.

> Ambiguity warning: whether a restore re-adds a file whose name was later taken by another
> user, and how capacity is recomputed — **the tests define it.** Use `copy.deepcopy` for the
> snapshot so later mutations don't leak in.
