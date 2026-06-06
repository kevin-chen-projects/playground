"""Tests for the deterministic guitar logic: fretboard mapping and chord naming.

These cover the heuristics in app/guitar.py, which had bugs that made the
transcription output not resemble real tab (notes biased toward fret 5 / dropped)
and mislabeled chords (G major named as "Dadd11"). They depend only on the
standard library, so they run in CI without basic_pitch / reportlab / music21.
"""

from app.guitar import build_chord_name, map_notes_to_fretboard, midi_to_name

# Standard tuning open-string MIDI values, low E (string_index 1) -> high E (6).
STANDARD_OPEN = [40, 45, 50, 55, 59, 64]


def frets_low_to_high(midis, tuning='standard'):
    """Return [fret_or_None] per string, string_index 1..6 (low E -> high E)."""
    placements = map_notes_to_fretboard(midis, tuning)
    layout = {p.string_index: p.fret for p in placements}
    return [layout.get(i) for i in range(1, 7)]


# --- midi_to_name -----------------------------------------------------------

def test_midi_to_name_reference_pitches():
    assert midi_to_name(60) == 'C4'      # middle C
    assert midi_to_name(40) == 'E2'      # low open E
    assert midi_to_name(69) == 'A4'      # A440
    assert midi_to_name(64) == 'E4'      # high open E


# --- fretboard mapping ------------------------------------------------------

def test_open_e_major_is_textbook_shape():
    # E2 B2 E3 G#3 B3 E4 -> the classic 0 2 2 1 0 0 voicing.
    midis = [40, 47, 52, 56, 59, 64]
    assert frets_low_to_high(midis) == [0, 2, 2, 1, 0, 0]


def test_open_g_major_shape():
    # G2 B2 D3 G3 B3 G4 -> 3 2 0 0 0 3
    midis = [43, 47, 50, 55, 59, 67]
    assert frets_low_to_high(midis) == [3, 2, 0, 0, 0, 3]


def test_no_note_dropped_when_strings_available():
    # A six-note chord must place all six notes (regression: the old fret-5
    # bias could leave a string unassigned and silently drop a note).
    midis = [40, 47, 52, 56, 59, 64]
    placements = map_notes_to_fretboard(midis, 'standard')
    assert len(placements) == 6
    assert len({p.string_index for p in placements}) == 6


def test_single_low_e_uses_open_low_string():
    frets = frets_low_to_high([40])
    assert frets == [0, None, None, None, None, None]


def test_frets_within_range():
    # A high cluster should still produce only valid 0..MAX_FRET placements.
    midis = [76, 79, 83, 88]
    for p in map_notes_to_fretboard(midis, 'standard'):
        assert 0 <= p.fret <= 20


def test_drop_d_lowers_sixth_string():
    # In drop-D the low string is D2 (38); a low D should play open there.
    frets = frets_low_to_high([38], tuning='drop-d')
    assert frets[0] == 0


# --- chord naming -----------------------------------------------------------

def test_major_triad_root_not_lowest_pitch_class():
    # G-B-D: regression for the bug that named this "Dadd11" because D is the
    # numerically-lowest pitch class. The real root is G.
    assert build_chord_name([43, 47, 50]) == 'G'


def test_c_major_triad():
    assert build_chord_name([48, 52, 55]) == 'C'


def test_a_minor_triad():
    assert build_chord_name([45, 48, 52]) == 'Am'


def test_dominant_seventh():
    # G7 = G B D F
    assert build_chord_name([43, 47, 50, 53]) == 'G7'


def test_diminished_triad():
    # B dim = B D F
    assert build_chord_name([47, 50, 53]) == 'Bdim'


def test_single_note_names_pitch_class():
    assert build_chord_name([40]) == 'E'


def test_empty_is_no_chord():
    assert build_chord_name([]) == 'N.C.'


def test_octave_doublings_collapse_to_same_name():
    # Adding octave doublings of the same pitch classes must not change the name.
    assert build_chord_name([43, 47, 50]) == build_chord_name([43, 47, 50, 55, 59, 67])
