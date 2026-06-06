from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Sequence, Tuple

NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

TUNINGS: Dict[str, List[int]] = {
    'standard': [40, 45, 50, 55, 59, 64],   # E2 A2 D3 G3 B3 E4
    'drop-d': [38, 45, 50, 55, 59, 64],
    'dadgad': [38, 45, 50, 55, 57, 62],
    'open-g': [38, 43, 50, 55, 59, 62],
}

MAX_FRET = 20


@dataclass
class GuitarPlacement:
    midi: int
    string_index: int
    fret: int


def midi_to_name(midi: int) -> str:
    octave = (midi // 12) - 1
    return f"{NOTE_NAMES[midi % 12]}{octave}"


# Triad templates as interval sets relative to a candidate root.
_TRIAD_QUALITIES: List[Tuple[frozenset, str]] = [
    (frozenset({0, 4, 7}), ''),     # major
    (frozenset({0, 3, 7}), 'm'),    # minor
    (frozenset({0, 3, 6}), 'dim'),  # diminished
    (frozenset({0, 4, 8}), 'aug'),  # augmented
]


def _chord_extras(intervals: set) -> str:
    """Name the tones that sit on top of a recognised triad."""
    extras = []
    if 10 in intervals:
        extras.append('7')
    elif 11 in intervals:
        extras.append('maj7')
    if 9 in intervals:
        extras.append('6')
    if 2 in intervals:
        extras.append('add9')
    if 5 in intervals:
        extras.append('add11')
    return ''.join(extras)


def build_chord_name(midis: Sequence[int]) -> str:
    if not midis:
        return 'N.C.'
    pcs = sorted(set(m % 12 for m in midis))
    if len(pcs) == 1:
        return NOTE_NAMES[pcs[0]]

    bass_pc = min(midis) % 12

    # Try every pitch class as a candidate root and keep the interpretation
    # that explains the most notes with a known triad. The numerically-lowest
    # pitch class is rarely the real root (e.g. G major is G-B-D, not D-...).
    best = None  # (notes_explained, root_is_bass, root, quality, intervals)
    for root in pcs:
        intervals = set((p - root) % 12 for p in pcs)
        for template, quality in _TRIAD_QUALITIES:
            if template.issubset(intervals):
                explained = len(template & intervals)
                key = (explained, 1 if root == bass_pc else 0)
                if best is None or key > best[0]:
                    best = (key, root, quality, intervals)

    if best is not None:
        _, root, quality, intervals = best
        return NOTE_NAMES[root] + quality + _chord_extras(intervals)

    # No recognisable triad: name it from the bass note plus any extras.
    intervals = set((p - bass_pc) % 12 for p in pcs)
    return NOTE_NAMES[bass_pc] + _chord_extras(intervals)


def map_notes_to_fretboard(midis: Sequence[int], tuning_name: str = 'standard') -> List[GuitarPlacement]:
    """Assign each pitch to a string/fret, preferring a compact low-fret voicing.

    Notes are placed low-to-high so that bass notes claim the low strings and
    higher notes land on higher strings, which is how a guitarist naturally
    voices a chord. Among the strings still free for a given note we pick the
    lowest playable fret, falling back to a slightly higher fret only when the
    open/low position is already taken.
    """
    tuning = TUNINGS.get(tuning_name, TUNINGS['standard'])
    placements: List[GuitarPlacement] = []
    used_strings = set()

    for midi in sorted(set(midis)):
        candidates: List[Tuple[int, int, int]] = []
        for string_index, open_midi in enumerate(tuning, start=1):
            fret = midi - open_midi
            if 0 <= fret <= MAX_FRET and string_index not in used_strings:
                # Prefer the lowest fret; break ties toward lower strings so a
                # bass note doesn't get parked on a high string.
                candidates.append((fret, string_index))
        if not candidates:
            continue
        fret, string_index = sorted(candidates)[0]
        placements.append(GuitarPlacement(midi=midi, string_index=string_index, fret=fret))
        used_strings.add(string_index)

    return sorted(placements, key=lambda p: p.string_index)
