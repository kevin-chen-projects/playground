"""
Reference solution — Problem 04 (in-memory DB with TTL + backup/restore).
Fast, plain IMC-style code. Passes all levels in tests.py.

State model: db[key][field] = (value, expiry)
  expiry is None  -> never expires
  expiry is an int -> field is alive while query_ts < expiry
"""

import copy


class InMemoryDB:
    def __init__(self):
        self.db = {}             # key -> {field: (value, expiry_or_None)}
        self.backups = []        # list of (timestamp, snapshot_dict)

    # ---- helpers ----
    def _alive(self, exp, ts):
        return exp is None or ts < exp

    def _live_fields(self, key, ts):
        """field -> value for fields of key alive at ts."""
        rec = self.db.get(key, {})
        return {f: v for f, (v, exp) in rec.items() if self._alive(exp, ts)}

    # ---- Level 1 (non-TTL == lives forever, queried at ts=inf) ----
    INF = float("inf")

    def set(self, key, field, value):
        self.db.setdefault(key, {})[field] = (value, None)

    def get(self, key, field):
        rec = self.db.get(key)
        if not rec or field not in rec:
            return None
        return rec[field][0]

    def delete(self, key, field):
        rec = self.db.get(key)
        if rec and field in rec:
            del rec[field]
            return True
        return False

    def scan(self, key):
        return self._fmt(self._live_fields(key, self.INF))

    # ---- Level 2 ----
    def scan_by_prefix(self, key, prefix):
        fields = self._live_fields(key, self.INF)
        return self._fmt({f: v for f, v in fields.items() if f.startswith(prefix)})

    def _fmt(self, fields):
        return [f"{f}({fields[f]})" for f in sorted(fields)]

    # ---- Level 3 (TTL) ----
    def set_at(self, key, field, value, timestamp):
        self.db.setdefault(key, {})[field] = (value, None)

    def set_at_with_ttl(self, key, field, value, timestamp, ttl):
        self.db.setdefault(key, {})[field] = (value, timestamp + ttl)

    def get_at(self, key, field, timestamp):
        rec = self.db.get(key)
        if not rec or field not in rec:
            return None
        value, exp = rec[field]
        return value if self._alive(exp, timestamp) else None

    def delete_at(self, key, field, timestamp):
        rec = self.db.get(key)
        if not rec or field not in rec:
            return False
        _, exp = rec[field]
        if not self._alive(exp, timestamp):
            return False
        del rec[field]
        return True

    def scan_at(self, key, timestamp):
        return self._fmt(self._live_fields(key, timestamp))

    def scan_by_prefix_at(self, key, prefix, timestamp):
        fields = self._live_fields(key, timestamp)
        return self._fmt({f: v for f, v in fields.items() if f.startswith(prefix)})

    # ---- Level 4 (backup / restore) ----
    def backup(self, timestamp):
        snapshot = {}
        count = 0
        for key, rec in self.db.items():
            saved = {}
            for field, (value, exp) in rec.items():
                if exp is None:
                    saved[field] = (value, None)
                elif timestamp < exp:
                    saved[field] = (value, exp - timestamp)   # store REMAINING ttl
                # already expired -> skip
            if saved:
                snapshot[key] = saved
                count += 1
        self.backups.append((timestamp, copy.deepcopy(snapshot)))
        return count

    def restore(self, timestamp, timestamp_to_restore):
        chosen = None
        for ts, snap in self.backups:
            if ts <= timestamp_to_restore and (chosen is None or ts >= chosen[0]):
                chosen = (ts, snap)
        self.db = {}
        if chosen is None:
            return
        for key, rec in copy.deepcopy(chosen[1]).items():
            new_rec = {}
            for field, (value, rem) in rec.items():
                if rem is None:
                    new_rec[field] = (value, None)
                else:
                    new_rec[field] = (value, timestamp + rem)   # re-anchor to restore time
            self.db[key] = new_rec
