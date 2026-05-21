def run_ocr(file_bytes: bytes, content_type: str):
    """Very small placeholder OCR stage.

    For now this does not perform real optical music recognition.
    It returns a deterministic mock so the full upload -> analyze -> display
    flow works in the browser immediately.
    """
    return {
        "engine": "mock-v0",
        "content_type": content_type,
        "byte_count": len(file_bytes),
        "text": "mock sheet music input",
        "tokens": [
            {"symbol": "note", "pitch_hint": "E5"},
            {"symbol": "note", "pitch_hint": "D5"},
            {"symbol": "note", "pitch_hint": "C5"},
            {"symbol": "note", "pitch_hint": "B4"},
            {"symbol": "note", "pitch_hint": "A4"},
        ],
    }
