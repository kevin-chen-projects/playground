"""
YOUR WORKING FILE — Problem 03 (cloud storage). Fill in the bodies; tests.py
imports CloudStorage from here. Run `pytest tests.py -k level1` ... level4.
"""


class CloudStorage:
    def __init__(self):
        # TODO
        raise NotImplementedError

    # ---- Level 1 ----
    def add_file(self, name, size):
        # TODO
        raise NotImplementedError

    def get_file_size(self, name):
        # TODO
        raise NotImplementedError

    def delete_file(self, name):
        # TODO
        raise NotImplementedError

    # ---- Level 2 ----
    def get_total_size(self):
        # TODO
        raise NotImplementedError

    def find_largest(self, n):
        # TODO
        raise NotImplementedError

    def find_by_prefix(self, prefix):
        # TODO
        raise NotImplementedError

    # ---- Level 3 ----
    def add_user(self, user_id, capacity):
        # TODO
        raise NotImplementedError

    def add_file_by(self, user_id, name, size):
        # TODO
        raise NotImplementedError

    def merge_user(self, user_id_1, user_id_2):
        # TODO
        raise NotImplementedError

    # ---- Level 4 ----
    def backup_user(self, user_id):
        # TODO
        raise NotImplementedError

    def restore_user(self, user_id):
        # TODO
        raise NotImplementedError
