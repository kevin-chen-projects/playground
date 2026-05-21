from __future__ import annotations

from pathlib import Path
from typing import Dict, List

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


STAFF_LEFT = 72
STAFF_RIGHT = 540
TAB_TOP = 420
STAFF_TOP = 700
LINE_GAP = 10


def draw_staff(c: canvas.Canvas, y_top: float, lines: int = 5, label: str | None = None):
    if label:
        c.setFont('Helvetica-Bold', 12)
        c.drawString(STAFF_LEFT - 40, y_top - 2 * LINE_GAP, label)
    for i in range(lines):
        y = y_top - i * LINE_GAP
        c.line(STAFF_LEFT, y, STAFF_RIGHT, y)


def draw_tab(c: canvas.Canvas, y_top: float):
    draw_staff(c, y_top, lines=6, label='TAB')


def render_transcription_pdf(pdf_path: Path, title: str, tuning_label: str, events: List[Dict]):
    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    width, height = letter
    c.setTitle(title)

    c.setFont('Helvetica-Bold', 18)
    c.drawString(72, height - 56, title)
    c.setFont('Helvetica', 10)
    c.setFillColor(colors.grey)
    c.drawString(72, height - 72, f'Tuning: {tuning_label}')
    c.drawString(72, height - 86, 'Auto-generated guitar score/tab from MP3 transcription')
    c.setFillColor(colors.black)

    draw_staff(c, STAFF_TOP, lines=5, label='Std.')
    draw_tab(c, TAB_TOP)

    if not events:
      c.setFont('Helvetica', 12)
      c.drawString(72, 360, 'No note events detected.')
      c.save()
      return

    start_x = 110
    spacing = max(28, min(52, 420 / max(1, len(events))))

    for idx, event in enumerate(events[:12]):
        x = start_x + idx * spacing
        c.setFont('Helvetica-Bold', 9)
        chord = event.get('chord_name', 'N.C.')
        tw = stringWidth(chord, 'Helvetica-Bold', 9)
        c.drawString(x - tw / 2, STAFF_TOP + 18, chord)

        notes = event.get('note_names', [])[:6]
        c.setFont('Helvetica', 8)
        if notes:
            c.drawString(x - 10, STAFF_TOP - 60, '/'.join(notes[:2]))

        placements = event.get('placements', [])
        for p in placements:
            string_index = p['string_index']
            fret = str(p['fret'])
            y = TAB_TOP - (string_index - 1) * LINE_GAP
            c.setFillColor(colors.white)
            c.rect(x - 6, y - 5, 12, 10, fill=1, stroke=0)
            c.setFillColor(colors.black)
            c.setFont('Helvetica', 7)
            c.drawCentredString(x, y - 2, fret)

        stem_y = STAFF_TOP - 20
        c.line(x, stem_y, x, stem_y - 25)
        c.circle(x, stem_y, 4, stroke=1, fill=0)

    c.setFont('Helvetica-Oblique', 9)
    c.setFillColor(colors.grey)
    c.drawString(72, 90, 'Note: This PDF is an automatically inferred guitar arrangement and may require musical review.')
    c.save()
