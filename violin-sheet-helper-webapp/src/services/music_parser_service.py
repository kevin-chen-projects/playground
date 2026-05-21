def parse_notes(ocr_result: dict):
    """Convert mocked OCR tokens into a structured note list.

    Later this can be replaced by actual OMR / sheet-music parsing.
    """
    notes = []
    for idx, token in enumerate(ocr_result.get("tokens", []), start=1):
        if token.get("symbol") != "note":
            continue
        notes.append(
            {
                "pitch": token.get("pitch_hint"),
                "measure": 1,
                "position_in_measure": idx,
                "duration": "quarter",
            }
        )
    return notes
