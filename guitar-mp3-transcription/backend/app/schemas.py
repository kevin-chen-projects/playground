from typing import List

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str


class TranscriptionSummary(BaseModel):
    title: str
    pdf_url: str
    json_url: str
    notes_detected: int
    chord_events: int
    tuning: str
    detail: str
    warnings: List[str]


class ErrorResponse(BaseModel):
    detail: str
