"""
Tests for Problem 03 (cloud storage) — the authoritative spec.
Default imports from starter.py.  Verify reference:  IMPL=solution pytest tests.py
"""

import importlib
import os

_impl = importlib.import_module(os.environ.get("IMPL", "starter"))
CloudStorage = _impl.CloudStorage


# ---- Level 1 ----

def test_level1_add_get_delete():
    cs = CloudStorage()
    assert cs.add_file("a.txt", 100) is True
    assert cs.add_file("a.txt", 50) is False        # duplicate name
    assert cs.get_file_size("a.txt") == 100
    assert cs.get_file_size("missing") is None
    assert cs.delete_file("a.txt") == 100
    assert cs.get_file_size("a.txt") is None
    assert cs.delete_file("a.txt") is None


# ---- Level 2 ----

def test_level2_total_and_largest():
    cs = CloudStorage()
    cs.add_file("a", 30)
    cs.add_file("b", 30)             # tie with a
    cs.add_file("c", 50)
    cs.add_file("d", 10)
    assert cs.get_total_size() == 120
    assert cs.find_largest(2) == ["c", "a"]
    assert cs.find_largest(3) == ["c", "a", "b"]
    assert cs.find_largest(99) == ["c", "a", "b", "d"]


def test_level2_prefix():
    cs = CloudStorage()
    for n in ["dir/a", "dir/b", "other", "dir/c"]:
        cs.add_file(n, 1)
    assert cs.find_by_prefix("dir/") == ["dir/a", "dir/b", "dir/c"]
    assert cs.find_by_prefix("x") == []


# ---- Level 3 ----

def test_level3_user_quota():
    cs = CloudStorage()
    assert cs.add_user("u1", 100) is True
    assert cs.add_user("u1", 200) is False          # duplicate
    assert cs.add_file_by("u1", "f1", 60) == 40      # remaining
    assert cs.add_file_by("u1", "f2", 60) is None    # would exceed capacity
    assert cs.get_file_size("f2") is None            # nothing stored on failure
    assert cs.add_file_by("u1", "f1", 10) is None    # name already exists
    assert cs.add_file_by("ghost", "f3", 1) is None  # missing user


def test_level3_merge_user():
    cs = CloudStorage()
    cs.add_user("u1", 100)
    cs.add_user("u2", 100)
    cs.add_file_by("u1", "a", 30)
    cs.add_file_by("u2", "b", 40)
    # merge u2 into u1: cap 100+100=200, used 30+40=70 -> remaining 130
    assert cs.merge_user("u1", "u2") == 130
    assert cs.merge_user("u1", "u2") is None         # u2 gone
    assert cs.merge_user("u1", "u1") is None
    # u1 now owns both files; backing up reflects that
    assert cs.backup_user("u1") == 2


# ---- Level 4 ----

def test_level4_backup_restore_deletes_new_files():
    cs = CloudStorage()
    cs.add_user("u1", 1000)
    cs.add_file_by("u1", "a", 10)
    cs.add_file_by("u1", "b", 20)
    assert cs.backup_user("u1") == 2
    cs.add_file_by("u1", "c", 30)         # added after backup
    cs.delete_file("a")                   # removed after backup
    # restore: c (not in backup) deleted, a (in backup, missing) recreated, b kept
    assert cs.restore_user("u1") == 2
    assert cs.get_file_size("a") == 10
    assert cs.get_file_size("b") == 20
    assert cs.get_file_size("c") is None


def test_level4_restore_recomputes_capacity():
    cs = CloudStorage()
    cs.add_user("u1", 100)
    cs.add_file_by("u1", "a", 40)
    cs.backup_user("u1")                  # snapshot: {a:40}, used 40
    cs.delete_file("a")                   # used 0
    cs.add_file_by("u1", "b", 90)         # used 90 (ok, under 100)
    assert cs.restore_user("u1") == 1     # restores a, deletes b
    # used should now be exactly 40 -> room for 60 more
    assert cs.add_file_by("u1", "c", 60) == 0
    assert cs.add_file_by("u1", "d", 1) is None    # over capacity now


def test_level4_backup_missing_user():
    cs = CloudStorage()
    assert cs.backup_user("ghost") is None
    assert cs.restore_user("ghost") is None
