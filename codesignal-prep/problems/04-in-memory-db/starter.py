"""
YOUR WORKING FILE — Problem 04 (in-memory DB). Fill in the bodies; tests.py
imports InMemoryDB from here. Run `pytest tests.py -k level1` ... level4.

Hint: a clean state model is db[key][field] = (value, expiry), where expiry is
None for never-expires. That makes every method a small read/write.
"""


class InMemoryDB:
    def __init__(self):
        # TODO
        raise NotImplementedError

    # ---- Level 1 ----
    def set(self, key, field, value):
        # TODO
        raise NotImplementedError

    def get(self, key, field):
        # TODO
        raise NotImplementedError

    def delete(self, key, field):
        # TODO
        raise NotImplementedError

    def scan(self, key):
        # TODO
        raise NotImplementedError

    # ---- Level 2 ----
    def scan_by_prefix(self, key, prefix):
        # TODO
        raise NotImplementedError

    # ---- Level 3 (TTL) ----
    def set_at(self, key, field, value, timestamp):
        # TODO
        raise NotImplementedError

    def set_at_with_ttl(self, key, field, value, timestamp, ttl):
        # TODO
        raise NotImplementedError

    def get_at(self, key, field, timestamp):
        # TODO
        raise NotImplementedError

    def delete_at(self, key, field, timestamp):
        # TODO
        raise NotImplementedError

    def scan_at(self, key, timestamp):
        # TODO
        raise NotImplementedError

    def scan_by_prefix_at(self, key, prefix, timestamp):
        # TODO
        raise NotImplementedError

    # ---- Level 4 (backup / restore) ----
    def backup(self, timestamp):
        # TODO
        raise NotImplementedError

    def restore(self, timestamp, timestamp_to_restore):
        # TODO
        raise NotImplementedError
