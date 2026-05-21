from __future__ import annotations

from pathlib import Path
from typing import Dict, List

from music21 import chord, clef, duration, metadata, meter, note, stream, tempo


def _quarter_length_from_event(event: Dict) -> float:
    raw = max(0.25, float(event['end']) - float(event['start']))
    choices = [0.25, 0.5, 1.0, 2.0, 4.0]
    return min(choices, key=lambda x: abs(x - raw))


def build_music21_score(title: str, tuning: str, events: List[Dict]) -> stream.Score:
    score = stream.Score()
    score.metadata = metadata.Metadata()
    score.metadata.title = title

    part = stream.Part()
    part.append(tempo.MetronomeMark(number=96))
    part.append(meter.TimeSignature('4/4'))
    part.append(clef.TrebleClef())

    for event in events:
        ql = _quarter_length_from_event(event)
        midis = event.get('midis', [])
        if not midis:
            r = note.Rest()
            r.duration = duration.Duration(ql)
            part.append(r)
            continue
        if len(midis) == 1:
            n = note.Note(midi=midis[0])
            n.duration = duration.Duration(ql)
            lyric = event.get('tab_text')
            if lyric:
                n.lyric = lyric
            part.append(n)
        else:
            ch = chord.Chord(midis)
            ch.duration = duration.Duration(ql)
            lyric = event.get('tab_text')
            if lyric:
                ch.lyric = lyric
            part.append(ch)

    score.append(part)
    return score


def export_musicxml(score: stream.Score, xml_path: Path) -> None:
    score.write('musicxml', fp=str(xml_path))
