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


def build_chord_name(midis: Sequence[int]) -> str:
    if not midis:
        return 'N.C.'
    pcs = sorted(set(m % 12 for m in midis))
    root = pcs[0]
    intervals = sorted(((p - root) % 12) for p in pcs)
    quality = ''
    if {0, 4, 7}.issubset(intervals):
        quality = ''
    elif {0, 3, 7}.issubset(intervals):
        quality = 'm'
    elif {0, 4, 8}.issubset(intervals):
        quality = 'aug'
    elif {0, 3, 6}.issubset(intervals):
        quality = 'dim'
    extras = []
    if 10 in intervals:
        extras.append('7')
    elif 11 in intervals:
        extras.append('maj7')
    if 2 in intervals:
        extras.append('add9')
    if 5 in intervals:
        extras.append('add11')
    return NOTE_NAMES[root] + quality + (''.join(extras) if extras else '')


def map_notes_to_fretboard(midis: Sequence[int], tuning_name: str = 'standard') -> List[GuitarPlacement]:
    tuning = TUNINGS.get(tuning_name, TUNINGS['standard'])
    placements: List[GuitarPlacement] = []
    used_strings = set()

    for midi in sorted(set(midis), reverse=True):
        candidates: List[Tuple[int, int]] = []
        for string_index, open_midi in enumerate(tuning, start=1):
            fret = midi - open_midi
            if 0 <= fret <= MAX_FRET and string_index not in used_strings:
                candidates.append((abs(fret - 5), string_index, fret))
        if not candidates:
            continue
        _, string_index, fret = sorted(candidates, key=lambda x: (x[0], x[2]))[0]
        placements.append(GuitarPlacement(midi=midi, string_index=string_index, fret=fret))
        used_strings.add(string_index)

    return sorted(placements, key=lambda p: p.string_index)
