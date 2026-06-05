"""
Interface for Problem 02 — Banking System. Copy into starter.py and fill bodies.
Running tests against THIS file should fail (that's expected).
"""


class Bank:
    def __init__(self):
        """Set up empty bank state."""
        raise NotImplementedError

    # ---- Level 1 ----
    def create_account(self, timestamp, account_id):
        """Create account (balance 0). Return True if created, False if it exists."""
        raise NotImplementedError

    def deposit(self, timestamp, account_id, amount):
        """Add amount. Return new balance, or None if account missing."""
        raise NotImplementedError

    def withdraw(self, timestamp, account_id, amount):
        """Subtract amount if funds allow. Return new balance, or None if missing
        or insufficient funds."""
        raise NotImplementedError

    # ---- Level 2 ----
    def transfer(self, timestamp, source_id, target_id, amount):
        """Move amount source->target. Return source's new balance, or None if an
        account is missing, source==target, or insufficient funds."""
        raise NotImplementedError

    def top_spenders(self, n):
        """Return n account ids with highest total outgoing, most first; ties by
        id ascending. Fewer than n -> return all."""
        raise NotImplementedError

    # ---- Level 3 ----
    def schedule_payment(self, timestamp, account_id, amount, delay):
        """Schedule a withdrawal at timestamp+delay. Return 'payment{ordinal}'
        (ordinal increments bank-wide from 1), or None if account missing."""
        raise NotImplementedError

    def cancel_payment(self, timestamp, account_id, payment_id):
        """Cancel a pending payment owned by account_id. Return True if cancelled,
        else False."""
        raise NotImplementedError

    # ---- Level 4 ----
    def merge_accounts(self, timestamp, target_id, source_id):
        """Merge source into target (balance, outgoing history, pending payments),
        then remove source. Return True on success, False otherwise."""
        raise NotImplementedError

    def balance(self, timestamp, account_id):
        """Return balance after running payments due at timestamp, or None if the
        account doesn't exist."""
        raise NotImplementedError
