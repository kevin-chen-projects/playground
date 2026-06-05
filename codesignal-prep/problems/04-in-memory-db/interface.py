"""
Interface for Problem 04 — In-Memory Database. Copy into starter.py and fill
bodies. Running tests against THIS file should fail (expected).
"""


class InMemoryDB:
    def __init__(self):
        """Set up empty database state."""
        raise NotImplementedError

    # ---- Level 1 ----
    def set(self, key, field, value):
        """Set field of record key to value (create record if needed)."""
        raise NotImplementedError

    def get(self, key, field):
        """Return the field's value, or None if record/field absent."""
        raise NotImplementedError

    def delete(self, key, field):
        """Delete a field. Return True if it existed, else False."""
        raise NotImplementedError

    def scan(self, key):
        """Return ['field(value)', ...] for the record, sorted by field name."""
        raise NotImplementedError

    # ---- Level 2 ----
    def scan_by_prefix(self, key, prefix):
        """Like scan, but only fields whose name starts with prefix."""
        raise NotImplementedError

    # ---- Level 3 (TTL) ----
    def set_at(self, key, field, value, timestamp):
        """Set a non-expiring field at timestamp."""
        raise NotImplementedError

    def set_at_with_ttl(self, key, field, value, timestamp, ttl):
        """Set a field expiring at timestamp + ttl."""
        raise NotImplementedError

    def get_at(self, key, field, timestamp):
        """Like get, treating fields expired by timestamp as absent."""
        raise NotImplementedError

    def delete_at(self, key, field, timestamp):
        """Like delete, as of timestamp (expired field counts as absent)."""
        raise NotImplementedError

    def scan_at(self, key, timestamp):
        """Like scan, excluding fields expired by timestamp."""
        raise NotImplementedError

    def scan_by_prefix_at(self, key, prefix, timestamp):
        """Like scan_by_prefix, excluding fields expired by timestamp."""
        raise NotImplementedError

    # ---- Level 4 (backup / restore) ----
    def backup(self, timestamp):
        """Snapshot state at timestamp; store TTLs as remaining ttl. Return the
        number of non-empty records backed up."""
        raise NotImplementedError

    def restore(self, timestamp, timestamp_to_restore):
        """Replace live db with the most recent backup at-or-before
        timestamp_to_restore, re-anchoring TTL expiries to timestamp."""
        raise NotImplementedError
