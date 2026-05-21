# Beginner first-position fingering map for common notes on violin.
# This is intentionally simple and favors easy-to-understand guidance.
BEGINNER_MAP = {
    "G3": {"string": "G", "finger": 0, "reason": "Open G string."},
    "A3": {"string": "G", "finger": 1, "reason": "1st finger on the G string."},
    "B3": {"string": "G", "finger": 2, "reason": "2nd finger on the G string."},
    "C4": {"string": "G", "finger": 3, "reason": "3rd finger on the G string."},
    "D4": {"string": "D", "finger": 0, "reason": "Open D string."},
    "E4": {"string": "D", "finger": 1, "reason": "1st finger on the D string."},
    "F4": {"string": "D", "finger": 2, "reason": "2nd finger on the D string."},
    "G4": {"string": "D", "finger": 3, "reason": "3rd finger on the D string."},
    "A4": {"string": "A", "finger": 0, "reason": "Open A string."},
    "B4": {"string": "A", "finger": 1, "reason": "1st finger on the A string."},
    "C5": {"string": "A", "finger": 2, "reason": "2nd finger on the A string."},
    "D5": {"string": "A", "finger": 3, "reason": "3rd finger on the A string."},
    "E5": {"string": "E", "finger": 0, "reason": "Open E string."},
    "F5": {"string": "E", "finger": 1, "reason": "1st finger on the E string."},
    "G5": {"string": "E", "finger": 2, "reason": "2nd finger on the E string."},
    "A5": {"string": "E", "finger": 3, "reason": "3rd finger on the E string."},
}


def note_to_beginner_fingering(pitch: str):
    entry = BEGINNER_MAP.get(pitch)
    if not entry:
        return {
            "string": None,
            "finger": None,
            "confidence": 0.0,
            "reason": f"No beginner first-position mapping available for {pitch} yet.",
        }
    return {
        "string": entry["string"],
        "finger": entry["finger"],
        "confidence": 0.95,
        "reason": entry["reason"],
    }


def build_guidance(notes: list[dict]):
    guidance = []
    for note in notes:
        fingering = note_to_beginner_fingering(note.get("pitch"))
        guidance.append(
            {
                "note": note.get("pitch"),
                "measure": note.get("measure"),
                "position_in_measure": note.get("position_in_measure"),
                **fingering,
            }
        )
    return guidance
