"""
Reference solution — Problem 02 (banking). Fast, plain IMC-style code.
Passes all levels in tests.py.
"""


class Bank:
    def __init__(self):
        self.bal = {}          # account_id -> balance
        self.out = {}          # account_id -> total outgoing
        self.payments = {}     # payment_id -> dict(acct, amount, exec, ordinal, status)
        self.pcount = 0        # running payment ordinal

    # ---- lazy scheduled-payment processing ----
    def _process_due(self, timestamp):
        due = [p for p in self.payments.values()
               if p["status"] == "pending" and p["exec"] <= timestamp]
        due.sort(key=lambda p: (p["exec"], p["ordinal"]))
        for p in due:
            acct = p["acct"]
            p["status"] = "executed"     # runs once; no retry whether or not it pays
            if acct in self.bal and self.bal[acct] >= p["amount"]:
                self.bal[acct] -= p["amount"]
                self.out[acct] = self.out.get(acct, 0) + p["amount"]

    # ---- Level 1 ----
    def create_account(self, timestamp, account_id):
        self._process_due(timestamp)
        if account_id in self.bal:
            return False
        self.bal[account_id] = 0
        self.out[account_id] = 0
        return True

    def deposit(self, timestamp, account_id, amount):
        self._process_due(timestamp)
        if account_id not in self.bal:
            return None
        self.bal[account_id] += amount
        return self.bal[account_id]

    def withdraw(self, timestamp, account_id, amount):
        self._process_due(timestamp)
        if account_id not in self.bal or self.bal[account_id] < amount:
            return None
        self.bal[account_id] -= amount
        self.out[account_id] += amount
        return self.bal[account_id]

    # ---- Level 2 ----
    def transfer(self, timestamp, source_id, target_id, amount):
        self._process_due(timestamp)
        if source_id not in self.bal or target_id not in self.bal:
            return None
        if source_id == target_id or self.bal[source_id] < amount:
            return None
        self.bal[source_id] -= amount
        self.bal[target_id] += amount
        self.out[source_id] += amount
        return self.bal[source_id]

    def top_spenders(self, n):
        ordered = sorted(self.out.items(), key=lambda kv: (-kv[1], kv[0]))
        return [acct for acct, _ in ordered[:n]]

    # ---- Level 3 ----
    def schedule_payment(self, timestamp, account_id, amount, delay):
        self._process_due(timestamp)
        if account_id not in self.bal:
            return None
        self.pcount += 1
        pid = "payment" + str(self.pcount)
        self.payments[pid] = {
            "acct": account_id, "amount": amount,
            "exec": timestamp + delay, "ordinal": self.pcount, "status": "pending",
        }
        return pid

    def cancel_payment(self, timestamp, account_id, payment_id):
        self._process_due(timestamp)
        p = self.payments.get(payment_id)
        if p is None or p["status"] != "pending" or p["acct"] != account_id:
            return False
        p["status"] = "cancelled"
        return True

    # ---- Level 4 ----
    def merge_accounts(self, timestamp, target_id, source_id):
        self._process_due(timestamp)
        if target_id not in self.bal or source_id not in self.bal:
            return False
        if target_id == source_id:
            return False
        self.bal[target_id] += self.bal[source_id]
        self.out[target_id] += self.out[source_id]
        for p in self.payments.values():
            if p["status"] == "pending" and p["acct"] == source_id:
                p["acct"] = target_id
        del self.bal[source_id]
        del self.out[source_id]
        return True

    def balance(self, timestamp, account_id):
        self._process_due(timestamp)
        return self.bal.get(account_id)
