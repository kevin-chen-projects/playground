"""
YOUR WORKING FILE — Problem 01.

Copy of the interface. Fill in each method body, run `pytest tests.py -k level1`
(then level2, ...), and iterate until green. tests.py imports InventoryManager
from THIS file.

Tip: keep state in dicts on self. Most methods are a few lines.
"""


class InventoryManager:
    def __init__(self):
        # TODO
        raise NotImplementedError

    # ---- Level 1 ----
    def add_item(self, name, qty, category="general"):
        # TODO
        raise NotImplementedError

    def get_quantity(self, name):
        # TODO
        raise NotImplementedError

    def remove_item(self, name, qty):
        # TODO
        raise NotImplementedError

    # ---- Level 2 ----
    def total_quantity(self):
        # TODO
        raise NotImplementedError

    def category_quantity(self, category):
        # TODO
        raise NotImplementedError

    # ---- Level 3 ----
    def top_items(self, n):
        # TODO
        raise NotImplementedError

    def search(self, prefix):
        # TODO
        raise NotImplementedError

    # ---- Level 4 ----
    def transfer(self, name, qty, to_inventory):
        # TODO
        raise NotImplementedError

    def history(self, name):
        # TODO
        raise NotImplementedError
