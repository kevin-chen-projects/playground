"""
Tests for Problem 04 (in-memory DB) — the authoritative spec.
Default imports from starter.py.  Verify reference:  IMPL=solution pytest tests.py
"""

import importlib
import os

_impl = importlib.import_module(os.environ.get("IMPL", "starter"))
InMemoryDB = _impl.InMemoryDB


# ---- Level 1 ----

def test_level1_set_get_delete():
    db = InMemoryDB()
    db.set("u1", "name", 5)
    db.set("u1", "age", 30)
    assert db.get("u1", "name") == 5
    assert db.get("u1", "missing") is None
    assert db.get("ghost", "x") is None
    assert db.delete("u1", "age") is True
    assert db.delete("u1", "age") is False
    assert db.get("u1", "age") is None


def test_level1_scan_sorted():
    db = InMemoryDB()
    db.set("u1", "c", 3)
    db.set("u1", "a", 1)
    db.set("u1", "b", 2)
    assert db.scan("u1") == ["a(1)", "b(2)", "c(3)"]
    assert db.scan("ghost") == []


# ---- Level 2 ----

def test_level2_scan_by_prefix():
    db = InMemoryDB()
    db.set("u1", "field_a", 1)
    db.set("u1", "field_b", 2)
    db.set("u1", "other", 3)
    assert db.scan_by_prefix("u1", "field_") == ["field_a(1)", "field_b(2)"]
    assert db.scan_by_prefix("u1", "z") == []


# ---- Level 3 (TTL) ----

def test_level3_ttl_expiry():
    db = InMemoryDB()
    db.set_at_with_ttl("u1", "tmp", 9, 100, 10)      # alive [100, 110)
    assert db.get_at("u1", "tmp", 105) == 9
    assert db.get_at("u1", "tmp", 109) == 9
    assert db.get_at("u1", "tmp", 110) is None       # expired at boundary
    assert db.get_at("u1", "tmp", 200) is None


def test_level3_non_expiring_and_overwrite():
    db = InMemoryDB()
    db.set_at("u1", "perm", 1, 100)
    assert db.get_at("u1", "perm", 10_000) == 1      # never expires
    db.set_at_with_ttl("u1", "perm", 2, 200, 50)     # overwrite + add TTL [200,250)
    assert db.get_at("u1", "perm", 240) == 2
    assert db.get_at("u1", "perm", 260) is None      # now it expires
    db.set_at("u1", "perm", 3, 300)                  # plain set clears the TTL
    assert db.get_at("u1", "perm", 10_000) == 3


def test_level3_scan_at_excludes_expired():
    db = InMemoryDB()
    db.set_at("u1", "a", 1, 100)
    db.set_at_with_ttl("u1", "b", 2, 100, 10)        # expires at 110
    db.set_at_with_ttl("u1", "bb", 3, 100, 100)      # expires at 200
    assert db.scan_at("u1", 105) == ["a(1)", "b(2)", "bb(3)"]
    assert db.scan_at("u1", 150) == ["a(1)", "bb(3)"]
    assert db.scan_by_prefix_at("u1", "b", 150) == ["bb(3)"]


def test_level3_delete_at_expired_is_false():
    db = InMemoryDB()
    db.set_at_with_ttl("u1", "tmp", 1, 100, 10)      # expires at 110
    assert db.delete_at("u1", "tmp", 200) is False   # already expired
    assert db.delete_at("u1", "tmp", 105) is True    # alive -> deleted


# ---- Level 4 (backup / restore) ----

def test_level4_backup_count_and_basic_restore():
    db = InMemoryDB()
    db.set_at("u1", "a", 1, 100)
    db.set_at("u2", "b", 2, 100)
    assert db.backup(100) == 2                        # two non-empty records
    db.set_at("u3", "c", 3, 150)                      # added after backup
    db.delete_at("u1", "a", 160)                      # removed after backup
    db.restore(200, 100)
    assert db.get_at("u1", "a", 250) == 1             # restored
    assert db.get_at("u2", "b", 250) == 2
    assert db.get_at("u3", "c", 250) is None          # not in backup -> gone


def test_level4_ttl_reanchored_on_restore():
    db = InMemoryDB()
    db.set_at_with_ttl("u1", "tmp", 7, 100, 50)       # expires at 150
    db.backup(120)                                    # remaining ttl = 30
    # restore much later: ttl re-anchors to restore time 1000 -> expires at 1030
    db.restore(1000, 120)
    assert db.get_at("u1", "tmp", 1020) == 7          # still alive
    assert db.get_at("u1", "tmp", 1030) is None       # expired again


def test_level4_expired_field_not_backed_up():
    db = InMemoryDB()
    db.set_at_with_ttl("u1", "gone", 1, 100, 10)      # expires at 110
    db.set_at("u1", "keep", 2, 100)
    # backup at 200: 'gone' already expired, only 'keep' survives
    assert db.backup(200) == 1
    db.set_at("u1", "extra", 9, 210)
    db.restore(300, 200)
    assert db.get_at("u1", "keep", 400) == 2
    assert db.get_at("u1", "gone", 400) is None
    assert db.get_at("u1", "extra", 400) is None


def test_level4_restore_picks_nearest_backup_at_or_before():
    db = InMemoryDB()
    db.set_at("u1", "v", 1, 100)
    db.backup(100)
    db.set_at("u1", "v", 2, 200)
    db.backup(200)
    db.set_at("u1", "v", 3, 300)
    db.backup(300)
    db.restore(500, 250)              # nearest backup at-or-before 250 is the t=200 one
    assert db.get_at("u1", "v", 600) == 2
