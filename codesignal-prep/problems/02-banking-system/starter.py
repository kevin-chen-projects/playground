"""
YOUR WORKING FILE — Problem 02 (banking). Fill in the bodies; tests.py imports
Bank from here. Run `pytest tests.py -k level1` then level2, level3, level4.
"""


class Bank:
    def __init__(self):
        # TODO
        raise NotImplementedError

    # ---- Level 1 ----
    def create_account(self, timestamp, account_id):
        # TODO
        raise NotImplementedError

    def deposit(self, timestamp, account_id, amount):
        # TODO
        raise NotImplementedError

    def withdraw(self, timestamp, account_id, amount):
        # TODO
        raise NotImplementedError

    # ---- Level 2 ----
    def transfer(self, timestamp, source_id, target_id, amount):
        # TODO
        raise NotImplementedError

    def top_spenders(self, n):
        # TODO
        raise NotImplementedError

    # ---- Level 3 ----
    def schedule_payment(self, timestamp, account_id, amount, delay):
        # TODO
        raise NotImplementedError

    def cancel_payment(self, timestamp, account_id, payment_id):
        # TODO
        raise NotImplementedError

    # ---- Level 4 ----
    def merge_accounts(self, timestamp, target_id, source_id):
        # TODO
        raise NotImplementedError

    def balance(self, timestamp, account_id):
        # TODO
        raise NotImplementedError
