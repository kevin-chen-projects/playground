"""
Reference solution — Problem 01. Fast, plain code (the IMC style). Passes all
levels in tests.py. Study the diff against your starter after you attempt it.
"""


class InventoryManager:
    def __init__(self):
        self.qty = {}        # name -> quantity
        self.cat = {}        # name -> category
        self.log = {}        # name -> list of (action, qty)

    def _record(self, name, action, amount):
        self.log.setdefault(name, []).append((action, amount))

    # ---- Level 1 ----
    def add_item(self, name, qty, category="general"):
        if name not in self.qty:
            self.qty[name] = 0
            self.cat[name] = category
        self.qty[name] += qty
        self._record(name, "add", qty)
        return self.qty[name]

    def get_quantity(self, name):
        return self.qty.get(name, 0)

    def remove_item(self, name, qty):
        have = self.qty.get(name, 0)
        removed = min(have, qty)
        if name in self.qty:
            self.qty[name] = have - removed
        if removed > 0:
            self._record(name, "remove", removed)
        return removed

    # ---- Level 2 ----
    def total_quantity(self):
        return sum(self.qty.values())

    def category_quantity(self, category):
        return sum(q for name, q in self.qty.items() if self.cat.get(name) == category)

    # ---- Level 3 ----
    def top_items(self, n):
        ordered = sorted(self.qty.items(), key=lambda kv: (-kv[1], kv[0]))
        return [name for name, _ in ordered[:n]]

    def search(self, prefix):
        return sorted(name for name in self.qty if name.startswith(prefix))

    # ---- Level 4 ----
    def transfer(self, name, qty, to_inventory):
        have = self.qty.get(name, 0)
        moved = min(have, qty)
        if moved <= 0:
            return 0
        self.qty[name] = have - moved
        self._record(name, "transfer_out", moved)
        to_inventory.add_item(name, moved, self.cat.get(name, "general"))
        # add_item logged an 'add' on the receiver; reclassify it as transfer_in
        to_inventory.log[name][-1] = ("transfer_in", moved)
        return moved

    def history(self, name):
        return list(self.log.get(name, []))
