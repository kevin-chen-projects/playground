"""
Tests for Problem 01 — the authoritative spec.

By default these import InventoryManager from starter.py (your working file).
To verify the reference solution instead:  IMPL=solution pytest tests.py

Run one level at a time while working:
    pytest tests.py -k level1
"""

import importlib
import os

_impl = importlib.import_module(os.environ.get("IMPL", "starter"))
InventoryManager = _impl.InventoryManager


# ---- Level 1 ----

def test_level1_add_and_get():
    inv = InventoryManager()
    assert inv.add_item("apple", 5) == 5
    assert inv.add_item("apple", 3) == 8
    assert inv.get_quantity("apple") == 8
    assert inv.get_quantity("missing") == 0


def test_level1_remove_caps_at_zero():
    inv = InventoryManager()
    inv.add_item("apple", 5)
    assert inv.remove_item("apple", 2) == 2
    assert inv.get_quantity("apple") == 3
    assert inv.remove_item("apple", 100) == 3       # only 3 left to remove
    assert inv.get_quantity("apple") == 0
    assert inv.remove_item("nope", 5) == 0          # absent item


# ---- Level 2 ----

def test_level2_categories_and_totals():
    inv = InventoryManager()
    inv.add_item("apple", 5, "fruit")
    inv.add_item("banana", 2, "fruit")
    inv.add_item("wrench", 4, "tools")
    assert inv.total_quantity() == 11
    assert inv.category_quantity("fruit") == 7
    assert inv.category_quantity("tools") == 4
    assert inv.category_quantity("empty") == 0


def test_level2_category_locked_on_first_add():
    inv = InventoryManager()
    inv.add_item("apple", 5, "fruit")
    inv.add_item("apple", 1, "tools")     # category should NOT change
    assert inv.category_quantity("fruit") == 6
    assert inv.category_quantity("tools") == 0


def test_level2_default_category_still_works():
    inv = InventoryManager()
    inv.add_item("apple", 5)              # no category arg (Level 1 style)
    assert inv.total_quantity() == 5


# ---- Level 3 ----

def test_level3_top_items_with_tiebreak():
    inv = InventoryManager()
    inv.add_item("apple", 5)
    inv.add_item("banana", 5)            # tie with apple -> alpha order
    inv.add_item("cherry", 9)
    inv.add_item("date", 1)
    assert inv.top_items(2) == ["cherry", "apple"]
    assert inv.top_items(3) == ["cherry", "apple", "banana"]
    assert inv.top_items(99) == ["cherry", "apple", "banana", "date"]


def test_level3_search_prefix():
    inv = InventoryManager()
    for n in ["apple", "apricot", "banana", "avocado"]:
        inv.add_item(n, 1)
    assert inv.search("ap") == ["apple", "apricot"]
    assert inv.search("a") == ["apple", "apricot", "avocado"]
    assert inv.search("z") == []


# ---- Level 4 ----

def test_level4_transfer_moves_available():
    src = InventoryManager()
    dst = InventoryManager()
    src.add_item("apple", 10, "fruit")
    assert src.transfer("apple", 4, dst) == 4
    assert src.get_quantity("apple") == 6
    assert dst.get_quantity("apple") == 4
    assert dst.category_quantity("fruit") == 4       # category carried over


def test_level4_transfer_caps_and_missing():
    src = InventoryManager()
    dst = InventoryManager()
    src.add_item("apple", 3)
    assert src.transfer("apple", 100, dst) == 3      # only 3 available
    assert src.get_quantity("apple") == 0
    assert dst.get_quantity("apple") == 3
    assert src.transfer("ghost", 5, dst) == 0        # not present


def test_level4_history_order_and_actions():
    src = InventoryManager()
    dst = InventoryManager()
    src.add_item("apple", 5)
    src.remove_item("apple", 2)
    src.transfer("apple", 1, dst)
    assert src.history("apple") == [("add", 5), ("remove", 2), ("transfer_out", 1)]
    assert dst.history("apple") == [("transfer_in", 1)]
    assert src.history("never") == []
