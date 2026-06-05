"""
Interface for Problem 01 — Inventory System.

This mirrors what CodeSignal hands you: a class with method signatures and
docstrings, bodies unimplemented. Copy this into your working file (starter.py)
and fill in the bodies. Running tests against THIS file should fail — that's
expected; it proves the tests are real.
"""


class InventoryManager:
    def __init__(self):
        """Set up empty inventory state."""
        raise NotImplementedError

    # ---- Level 1 ----
    def add_item(self, name, qty, category="general"):
        """Add qty units of name (creating it if new). category is recorded the
        first time an item is added and ignored on later adds. Return the item's
        new total quantity."""
        raise NotImplementedError

    def get_quantity(self, name):
        """Return current quantity of name, or 0 if it doesn't exist."""
        raise NotImplementedError

    def remove_item(self, name, qty):
        """Remove up to qty units (never below 0). Return qty actually removed."""
        raise NotImplementedError

    # ---- Level 2 ----
    def total_quantity(self):
        """Return summed quantity across all items."""
        raise NotImplementedError

    def category_quantity(self, category):
        """Return summed quantity of items in category (0 if none)."""
        raise NotImplementedError

    # ---- Level 3 ----
    def top_items(self, n):
        """Return names of the n highest-quantity items, most first; ties broken
        by name ascending. Fewer than n items -> return all."""
        raise NotImplementedError

    def search(self, prefix):
        """Return item names starting with prefix, sorted alphabetically."""
        raise NotImplementedError

    # ---- Level 4 ----
    def transfer(self, name, qty, to_inventory):
        """Move up to qty units of name into to_inventory (another
        InventoryManager). Receiver keeps the category. Return qty transferred."""
        raise NotImplementedError

    def history(self, name):
        """Return chronological list of (action, qty) for name. action is one of
        'add', 'remove', 'transfer_out', 'transfer_in'."""
        raise NotImplementedError
