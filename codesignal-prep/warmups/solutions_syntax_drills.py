"""
Syntax warm-up drills — SOLUTIONS / answer key.

Run this to confirm the reference answers all pass:
    python solutions_syntax_drills.py   ->  "all 30 drills pass"

Each function shows a fast, idiomatic way to do the task. Other correct answers
exist — these are just clean references. Compare against your attempts in
syntax_drills.py after you've tried them yourself.
"""

import copy
from collections import Counter, defaultdict
from dataclasses import dataclass


def d01_last_two(a):
    """Return the last two elements of list a, as a list."""
    return a[-2:]


def d02_reversed(a):
    """Return list a reversed (new list), using a slice."""
    return a[::-1]


def d03_every_other(a):
    """Return every other element of a starting from index 0."""
    return a[::2]


def d04_split_csv(s):
    """Split 'a,b,c' on commas -> ['a','b','c']."""
    return s.split(",")


def d05_join_dash(parts):
    """Join list of strings with '-' between them."""
    return "-".join(parts)


def d06_zero_pad(n):
    """Return integer n as a 3-wide zero-padded string. 7 -> '007'."""
    return f"{n:03d}"


def d07_count_vowels(s):
    """Return how many characters of s are vowels (aeiou, lowercase)."""
    return sum(1 for c in s if c in "aeiou")


def d08_floor_div(a, b):
    """Return integer quotient of a divided by b (floor division)."""
    return a // b


def d09_divmod(a, b):
    """Return (quotient, remainder) of a / b as a tuple."""
    return divmod(a, b)


def d10_squares(nums):
    """Return list of squares of nums (comprehension)."""
    return [x * x for x in nums]


def d11_evens(nums):
    """Return only the even numbers from nums."""
    return [x for x in nums if x % 2 == 0]


def d12_clamp_negatives(nums):
    """Return nums with negatives replaced by 0 (conditional comprehension)."""
    return [x if x >= 0 else 0 for x in nums]


def d13_flatten(rows):
    """Flatten a list of lists one level. [[1,2],[3]] -> [1,2,3]."""
    return [x for row in rows for x in row]


def d14_word_count(words):
    """Return a dict mapping each word to how many times it appears."""
    return dict(Counter(words))


def d15_invert(d):
    """Return a new dict with keys and values swapped."""
    return {v: k for k, v in d.items()}


def d16_get_default(d, k):
    """Return d[k] if present, else the int 0 (no KeyError)."""
    return d.get(k, 0)


def d17_merge(d1, d2):
    """Return a merged dict; on key conflict d2 wins. Don't mutate inputs."""
    return {**d1, **d2}


def d18_sum_values(d):
    """Return the sum of all values in dict d."""
    return sum(d.values())


def d19_unique(a):
    """Return the number of distinct elements in list a."""
    return len(set(a))


def d20_common(a, b):
    """Return a sorted list of elements present in BOTH lists a and b."""
    return sorted(set(a) & set(b))


def d21_by_length(words):
    """Return words sorted by length (shortest first)."""
    return sorted(words, key=len)


def d22_by_value_desc(d):
    """Return list of keys of d sorted by their value, descending."""
    return sorted(d, key=d.get, reverse=True)


def d23_count_then_name(pairs):
    """pairs is a list of (name, count). Return names sorted by count DESC,
    then name ASC for ties."""
    return [name for name, count in sorted(pairs, key=lambda p: (-p[1], p[0]))]


def d24_key_of_max(d):
    """Return the key whose value is the largest."""
    return max(d, key=d.get)


def d25_index_of_first(a, target):
    """Return the index of the first element equal to target, else -1."""
    for i, x in enumerate(a):
        if x == target:
            return i
    return -1


def d26_dot(a, b):
    """Return the dot product sum(a_i * b_i) using zip."""
    return sum(x * y for x, y in zip(a, b))


def d27_top_two(items):
    """Return the two most common items as a list of (item, count)."""
    return Counter(items).most_common(2)


def d28_group_by_first_letter(words):
    """Return a dict: first letter -> list of words starting with it."""
    g = defaultdict(list)
    for w in words:
        g[w[0]].append(w)
    return dict(g)


def d29_make_point(x, y):
    """Define a dataclass Point and return Point(x, y)."""
    @dataclass
    class Point:
        x: int
        y: int
    return Point(x, y)


def d30_safe_snapshot(state):
    """Return a snapshot independent of later mutations to state's inner lists."""
    return copy.deepcopy(state)


def _check():
    assert d01_last_two([1, 2, 3, 4]) == [3, 4]
    assert d02_reversed([1, 2, 3]) == [3, 2, 1]
    assert d03_every_other([0, 1, 2, 3, 4]) == [0, 2, 4]
    assert d04_split_csv("a,b,c") == ["a", "b", "c"]
    assert d05_join_dash(["a", "b", "c"]) == "a-b-c"
    assert d06_zero_pad(7) == "007"
    assert d07_count_vowels("education") == 5
    assert d08_floor_div(7, 2) == 3
    assert d09_divmod(7, 2) == (3, 1)
    assert d10_squares([1, 2, 3]) == [1, 4, 9]
    assert d11_evens([1, 2, 3, 4, 5, 6]) == [2, 4, 6]
    assert d12_clamp_negatives([-1, 2, -3, 4]) == [0, 2, 0, 4]
    assert d13_flatten([[1, 2], [3], [4, 5]]) == [1, 2, 3, 4, 5]
    assert d14_word_count(["a", "b", "a"]) == {"a": 2, "b": 1}
    assert d15_invert({"a": 1, "b": 2}) == {1: "a", 2: "b"}
    assert d16_get_default({"a": 5}, "z") == 0
    assert d17_merge({"a": 1, "b": 2}, {"b": 9, "c": 3}) == {"a": 1, "b": 9, "c": 3}
    assert d18_sum_values({"a": 1, "b": 2, "c": 3}) == 6
    assert d19_unique([1, 1, 2, 3, 3, 3]) == 3
    assert d20_common([1, 2, 3, 4], [2, 4, 6]) == [2, 4]
    assert d21_by_length(["ccc", "a", "bb"]) == ["a", "bb", "ccc"]
    assert d22_by_value_desc({"a": 1, "b": 3, "c": 2}) == ["b", "c", "a"]
    assert d23_count_then_name([("x", 2), ("y", 3), ("z", 2)]) == ["y", "x", "z"]
    assert d24_key_of_max({"a": 1, "b": 9, "c": 4}) == "b"
    assert d25_index_of_first([5, 6, 7, 6], 6) == 1
    assert d25_index_of_first([1, 2, 3], 9) == -1
    assert d26_dot([1, 2, 3], [4, 5, 6]) == 32
    assert d27_top_two(["a", "b", "a", "c", "b", "a"]) == [("a", 3), ("b", 2)]
    assert d28_group_by_first_letter(["apple", "ant", "bear"]) == {
        "a": ["apple", "ant"], "b": ["bear"]
    }
    p = d29_make_point(3, 4)
    assert (p.x, p.y) == (3, 4)
    live = {"k": [1, 2]}
    s2 = d30_safe_snapshot(live)
    live["k"].append(99)
    assert s2 == {"k": [1, 2]}, "snapshot leaked a mutation"
    print("all 30 drills pass")


if __name__ == "__main__":
    _check()
