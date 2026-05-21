# Data contract (v0)

## Input
- Upload: image (png/jpg/webp) or pdf

## Intermediate representation (optional)
- OCR output: extracted text and bounding boxes

## Parsed notes
- `notes`: array of objects
  - `pitch`: e.g. "C4" (or use a numeric pitch representation)
  - `measure`: optional
  - `staff_position`: optional
  - `duration`: optional
  - `bbox`: optional (x1,y1,x2,y2) for overlay

## Guidance output
- For each parsed note:
  - `note`: pitch
  - `string`: one of ["G", "D", "A", "E"] (standard violin tuning)
  - `finger`: one of [1,2,3,4] (optionally 0 for open string)
  - `confidence`: optional 0..1
  - `reason`: short beginner explanation
