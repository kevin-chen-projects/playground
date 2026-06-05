# Problem 01 — Inventory System

A toy warehouse inventory service. You implement the `InventoryManager` class. Four
cumulative levels; each adds requirements on top of the last. **The test suite is the real
spec** — when this prompt is vague, `tests.py` decides.

> Difficulty: **warm-up.** Aim to finish all four levels in ~40 min. This one trains the
> core loop (copy interface → fill bodies → run tests) before the harder problems.

How to work it:
1. Copy `interface.py`'s class into `starter.py` (already done for you) and fill bodies.
2. Run one level at a time: `pytest tests.py -k level1`, then `level2`, etc.
3. `tests.py` imports from `starter.py`. The finished reference is in `solution.py`.

---

## Level 1 — Add and query stock

- `add_item(name, qty)` — add `qty` units of `name` to the warehouse. If the item already
  exists, increase its quantity. Returns the item's new total quantity.
- `get_quantity(name)` — return the current quantity of `name`, or `0` if never added.
- `remove_item(name, qty)` — remove up to `qty` units. You cannot go below 0; if `qty`
  exceeds what's on hand, remove everything (quantity becomes 0). Returns the quantity
  actually removed.

## Level 2 — Categories and totals

Items now belong to a category, supplied at add time.

- `add_item(name, qty, category)` — same as before, but records the item's category. An
  item's category is set the first time it's added and does not change on later adds.
- `total_quantity()` — return the summed quantity of all items.
- `category_quantity(category)` — return the summed quantity of items in `category`
  (`0` if the category has nothing).

> Note: existing Level 1 tests still call `add_item(name, qty)` without a category. Support
> both — make `category` optional (default to something like `"general"`).

## Level 3 — Top items and search

- `top_items(n)` — return the names of the `n` items with the highest quantity, most first.
  Break ties by name in ascending (alphabetical) order. If fewer than `n` items exist,
  return all of them.
- `search(prefix)` — return all item names that start with `prefix`, sorted alphabetically.

## Level 4 — Transfers and history

- `transfer(name, qty, to_inventory)` — move up to `qty` units of `name` from this inventory
  into another `InventoryManager` instance (`to_inventory`). Moves only what's available
  (same cap rule as `remove_item`). The receiving inventory keeps the item's category.
  Returns the quantity actually transferred.
- `history(name)` — return the list of changes for `name`, in chronological order. Each
  change is a tuple `(action, qty)` where `action` is one of `"add"`, `"remove"`,
  `"transfer_out"`, `"transfer_in"` and `qty` is the (positive) amount involved.

> Ambiguity warning: the prompt doesn't say whether a `remove_item` of 0 records history, or
> what happens transferring an item that doesn't exist. **Don't guess — read the tests.** They
> define the only behavior you must satisfy.
