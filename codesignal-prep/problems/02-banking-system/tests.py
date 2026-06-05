"""
Tests for Problem 02 (banking) — the authoritative spec.
Default imports Bank from starter.py.  Verify reference:  IMPL=solution pytest tests.py
Run one level: pytest tests.py -k level1
"""

import importlib
import os

_impl = importlib.import_module(os.environ.get("IMPL", "starter"))
Bank = _impl.Bank


# ---- Level 1 ----

def test_level1_create_and_deposit():
    b = Bank()
    assert b.create_account(1, "a") is True
    assert b.create_account(2, "a") is False        # duplicate
    assert b.deposit(3, "a", 100) == 100
    assert b.deposit(4, "a", 50) == 150
    assert b.deposit(5, "ghost", 10) is None


def test_level1_withdraw_rules():
    b = Bank()
    b.create_account(1, "a")
    b.deposit(2, "a", 100)
    assert b.withdraw(3, "a", 40) == 60
    assert b.withdraw(4, "a", 1000) is None         # insufficient
    assert b.withdraw(5, "ghost", 10) is None       # missing
    assert b.deposit(6, "a", 0) == 60               # balance unchanged after failed wd


# ---- Level 2 ----

def test_level2_transfer():
    b = Bank()
    b.create_account(1, "a")
    b.create_account(1, "b")
    b.deposit(2, "a", 100)
    assert b.transfer(3, "a", "b", 30) == 70
    assert b.deposit(4, "b", 0) == 30
    assert b.transfer(5, "a", "a", 10) is None      # self-transfer
    assert b.transfer(6, "a", "ghost", 10) is None  # missing target
    assert b.transfer(7, "a", "b", 10_000) is None  # insufficient


def test_level2_top_spenders_tiebreak():
    b = Bank()
    for acct in ["a", "b", "c"]:
        b.create_account(1, acct)
        b.deposit(1, acct, 1000)
    b.withdraw(2, "a", 100)
    b.transfer(3, "a", "b", 100)        # a outgoing = 200
    b.withdraw(4, "b", 200)             # b outgoing = 200 (tie with a -> alpha)
    b.withdraw(5, "c", 50)              # c outgoing = 50
    assert b.top_spenders(2) == ["a", "b"]
    assert b.top_spenders(3) == ["a", "b", "c"]


# ---- Level 3 ----

def test_level3_schedule_ids_and_execution():
    b = Bank()
    b.create_account(1, "a")
    b.deposit(1, "a", 100)
    assert b.schedule_payment(10, "a", 30, 5) == "payment1"   # exec at 15
    assert b.schedule_payment(10, "a", 10, 20) == "payment2"  # exec at 30
    assert b.schedule_payment(10, "ghost", 1, 1) is None
    # nothing due yet at t=12
    assert b.balance(12, "a") == 100
    # payment1 due at 15
    assert b.balance(15, "a") == 70
    # payment2 due at 30
    assert b.balance(30, "a") == 60


def test_level3_cancel_payment():
    b = Bank()
    b.create_account(1, "a")
    b.deposit(1, "a", 100)
    pid = b.schedule_payment(10, "a", 40, 10)       # exec at 20
    assert b.cancel_payment(12, "a", pid) is True
    assert b.cancel_payment(13, "a", pid) is False  # already cancelled
    assert b.cancel_payment(14, "a", "payment999") is False
    assert b.balance(25, "a") == 100                # was cancelled, never ran


def test_level3_skipped_when_insufficient():
    b = Bank()
    b.create_account(1, "a")
    b.deposit(1, "a", 20)
    b.schedule_payment(10, "a", 50, 5)              # needs 50, only 20 -> skipped at 15
    assert b.balance(16, "a") == 20                 # untouched
    b.deposit(17, "a", 100)
    assert b.balance(18, "a") == 120                # does NOT retry the skipped payment


# ---- Level 4 ----

def test_level4_merge_balances_and_spending():
    b = Bank()
    b.create_account(1, "a")
    b.create_account(1, "b")
    b.deposit(1, "a", 100)
    b.deposit(1, "b", 50)
    b.withdraw(2, "b", 20)                          # b outgoing = 20
    assert b.merge_accounts(3, "a", "b") is True
    assert b.balance(4, "a") == 130                 # 100 + (50-20)
    assert b.balance(5, "b") is None                # b is gone
    assert b.merge_accounts(6, "a", "b") is False   # b no longer exists


def test_level4_merge_moves_pending_payments():
    b = Bank()
    b.create_account(1, "a")
    b.create_account(1, "b")
    b.deposit(1, "a", 100)
    b.deposit(1, "b", 100)
    b.schedule_payment(10, "b", 40, 20)             # exec at 30, owned by b
    assert b.merge_accounts(11, "a", "b") is True
    # payment now draws from a (merged target); a had 100+100=200, -40 = 160
    assert b.balance(30, "a") == 160
