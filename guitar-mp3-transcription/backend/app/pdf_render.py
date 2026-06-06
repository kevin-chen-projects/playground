from __future__ import annotations

from pathlib import Path
from typing import Dict, List

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

PAGE_MARGIN = 72
LINE_GAP = 9                 # vertical gap between adjacent tab lines
SYSTEM_GAP = 70              # vertical gap between stacked tab systems
COLUMN_WIDTH = 34            # horizontal space per chord/note event
FIRST_SYSTEM_TOP = 660       # y of the top line of the first system
BOTTOM_LIMIT = 90            # don't draw a system below this y

# Tab lines run high string (top) to low string (bottom). string_index 1 is the
# low E (6th string), so it belongs on the BOTTOM line; string_index 6 is the
# high E and belongs on the TOP line. This row-from-top order makes that mapping
# explicit instead of the previous upside-down rendering.
STRING_LABELS_TOP_DOWN = ['e', 'B', 'G', 'D', 'A', 'E']


def _line_y(top_y: float, string_index: int) -> float:
    """y coordinate of a string's tab line. string_index 1 (low E) is bottom."""
    row_from_top = 6 - string_index            # 1 -> 5 (bottom), 6 -> 0 (top)
    return top_y - row_from_top * LINE_GAP


def _draw_system(c: canvas.Canvas, top_y: float, left_x: float, right_x: float):
    """Draw the six horizontal tab lines plus the 'TAB' clef labels."""
    c.setFont('Helvetica-Bold', 7)
    c.setFillColor(colors.grey)
    for row, label in enumerate(STRING_LABELS_TOP_DOWN):
        y = top_y - row * LINE_GAP
        c.drawRightString(left_x - 6, y - 2, label)
    c.setFillColor(colors.black)
    for row in range(6):
        y = top_y - row * LINE_GAP
        c.line(left_x, y, right_x, y)
    # Left-edge bracket so it reads as a tab staff.
    c.line(left_x, top_y, left_x, top_y - 5 * LINE_GAP)


def render_transcription_pdf(pdf_path: Path, title: str, tuning_label: str, events: List[Dict]):
    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    width, height = letter
    c.setTitle(title)

    left_x = PAGE_MARGIN + 14          # leave room for string labels
    right_x = width - PAGE_MARGIN

    def header():
        c.setFont('Helvetica-Bold', 18)
        c.drawString(PAGE_MARGIN, height - 56, title)
        c.setFont('Helvetica', 10)
        c.setFillColor(colors.grey)
        c.drawString(PAGE_MARGIN, height - 72, f'Tuning: {tuning_label}')
        c.drawString(PAGE_MARGIN, height - 86, 'Auto-generated guitar tab from MP3 transcription')
        c.setFillColor(colors.black)

    header()

    if not events:
        c.setFont('Helvetica', 12)
        c.drawString(PAGE_MARGIN, height - 140, 'No note events detected.')
        c.save()
        return

    columns_per_system = max(1, int((right_x - left_x - COLUMN_WIDTH) // COLUMN_WIDTH))
    top_y = FIRST_SYSTEM_TOP
    col = 0
    _draw_system(c, top_y, left_x, right_x)

    for event in events:
        if col >= columns_per_system:
            # Move to the next system, or a new page if we've run out of room.
            top_y -= SYSTEM_GAP
            col = 0
            if top_y - 5 * LINE_GAP < BOTTOM_LIMIT:
                c.showPage()
                header()
                top_y = FIRST_SYSTEM_TOP
            _draw_system(c, top_y, left_x, right_x)

        x = left_x + (col + 0.5) * COLUMN_WIDTH

        # Chord name above the system.
        chord = event.get('chord_name', '')
        if chord and chord != 'N.C.':
            c.setFont('Helvetica-Bold', 8)
            tw = stringWidth(chord, 'Helvetica-Bold', 8)
            c.drawString(x - tw / 2, top_y + 8, chord)

        # Fret numbers, each on its string's line, masked over the line.
        for p in event.get('placements', []):
            fret = str(p['fret'])
            y = _line_y(top_y, p['string_index'])
            fw = stringWidth(fret, 'Helvetica', 7)
            c.setFillColor(colors.white)
            c.rect(x - fw / 2 - 1, y - 3.5, fw + 2, 7, fill=1, stroke=0)
            c.setFillColor(colors.black)
            c.setFont('Helvetica', 7)
            c.drawCentredString(x, y - 2.5, fret)

        col += 1

    c.setFont('Helvetica-Oblique', 9)
    c.setFillColor(colors.grey)
    c.drawString(PAGE_MARGIN, 60,
                 'Note: This tab is automatically inferred from audio and may require musical review.')
    c.save()
