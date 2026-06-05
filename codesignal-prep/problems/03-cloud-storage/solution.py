"""
Reference solution — Problem 03 (cloud storage). Fast, plain IMC-style code.
Passes all levels in tests.py.
"""

import copy


class CloudStorage:
    def __init__(self):
        self.files = {}      # name -> {"size": int, "owner": user_id}
        self.users = {}      # user_id -> {"cap": int, "used": int}
        self.backups = {}    # user_id -> {name: size}  (snapshot)
        self.users["admin"] = {"cap": float("inf"), "used": 0}

    # ---- Level 1 ----
    def add_file(self, name, size):
        if name in self.files:
            return False
        self.files[name] = {"size": size, "owner": "admin"}
        self.users["admin"]["used"] += size
        return True

    def get_file_size(self, name):
        f = self.files.get(name)
        return f["size"] if f else None

    def delete_file(self, name):
        f = self.files.get(name)
        if f is None:
            return None
        self.users[f["owner"]]["used"] -= f["size"]
        del self.files[name]
        return f["size"]

    # ---- Level 2 ----
    def get_total_size(self):
        return sum(f["size"] for f in self.files.values())

    def find_largest(self, n):
        ordered = sorted(self.files.items(), key=lambda kv: (-kv[1]["size"], kv[0]))
        return [name for name, _ in ordered[:n]]

    def find_by_prefix(self, prefix):
        return sorted(name for name in self.files if name.startswith(prefix))

    # ---- Level 3 ----
    def add_user(self, user_id, capacity):
        if user_id in self.users:
            return False
        self.users[user_id] = {"cap": capacity, "used": 0}
        return True

    def add_file_by(self, user_id, name, size):
        u = self.users.get(user_id)
        if u is None or name in self.files:
            return None
        if u["used"] + size > u["cap"]:
            return None
        self.files[name] = {"size": size, "owner": user_id}
        u["used"] += size
        return u["cap"] - u["used"]

    def merge_user(self, user_id_1, user_id_2):
        if user_id_1 not in self.users or user_id_2 not in self.users:
            return None
        if user_id_1 == user_id_2:
            return None
        u1 = self.users[user_id_1]
        u2 = self.users[user_id_2]
        for f in self.files.values():
            if f["owner"] == user_id_2:
                f["owner"] = user_id_1
        u1["cap"] += u2["cap"]
        u1["used"] += u2["used"]
        del self.users[user_id_2]
        self.backups.pop(user_id_2, None)
        return u1["cap"] - u1["used"]

    # ---- Level 4 ----
    def backup_user(self, user_id):
        if user_id not in self.users:
            return None
        snap = {name: f["size"] for name, f in self.files.items()
                if f["owner"] == user_id}
        self.backups[user_id] = copy.deepcopy(snap)
        return len(snap)

    def restore_user(self, user_id):
        if user_id not in self.users:
            return None
        snap = self.backups.get(user_id, {})
        # delete user's current files not in the backup
        current = [name for name, f in self.files.items() if f["owner"] == user_id]
        for name in current:
            if name not in snap:
                self.delete_file(name)
        # recreate backed-up files that no longer exist
        for name, size in snap.items():
            if name not in self.files:
                self.files[name] = {"size": size, "owner": user_id}
        # recompute the user's used capacity from exactly the files they now own
        self.users[user_id]["used"] = sum(
            f["size"] for f in self.files.values() if f["owner"] == user_id
        )
        return len(snap)
