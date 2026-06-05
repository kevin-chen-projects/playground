"""
Interface for Problem 03 — Cloud Storage. Copy into starter.py and fill bodies.
Running tests against THIS file should fail (expected).
"""


class CloudStorage:
    def __init__(self):
        """Set up empty storage state."""
        raise NotImplementedError

    # ---- Level 1 ----
    def add_file(self, name, size):
        """Create a file. Return True if added, False if name already exists."""
        raise NotImplementedError

    def get_file_size(self, name):
        """Return the file's size, or None if it doesn't exist."""
        raise NotImplementedError

    def delete_file(self, name):
        """Delete the file. Return its size, or None if it didn't exist."""
        raise NotImplementedError

    # ---- Level 2 ----
    def get_total_size(self):
        """Return summed size of all files."""
        raise NotImplementedError

    def find_largest(self, n):
        """Return up to n file names by size desc, ties by name asc."""
        raise NotImplementedError

    def find_by_prefix(self, prefix):
        """Return file names starting with prefix, sorted alphabetically."""
        raise NotImplementedError

    # ---- Level 3 ----
    def add_user(self, user_id, capacity):
        """Register a user with a capacity. Return True if added, else False."""
        raise NotImplementedError

    def add_file_by(self, user_id, name, size):
        """Add a file owned by user_id. Return remaining capacity, or None if the
        user is missing, name exists, or it would exceed capacity."""
        raise NotImplementedError

    def merge_user(self, user_id_1, user_id_2):
        """Merge user 2 into user 1 (files + capacity), remove user 2. Return
        user 1's remaining capacity, or None on bad input."""
        raise NotImplementedError

    # ---- Level 4 ----
    def backup_user(self, user_id):
        """Snapshot user's current files (replacing any prior backup). Return the
        count backed up, or None if user missing."""
        raise NotImplementedError

    def restore_user(self, user_id):
        """Restore user's files from latest backup. Return count restored, or None
        if user missing. No backup -> treat as empty."""
        raise NotImplementedError
