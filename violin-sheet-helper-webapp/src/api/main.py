from pathlib import Path
from typing import List

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from src.services.fingering_engine import build_guidance
from src.services.music_parser_service import parse_notes
from src.services.ocr_service import run_ocr

BASE_DIR = Path(__file__).resolve().parents[2]
WEB_DIR = BASE_DIR / "src" / "web"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
UPLOADS_DIR = ARTIFACTS_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Violin Sheet Helper")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(WEB_DIR)), name="static")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def index():
    return FileResponse(str(WEB_DIR / "index.html"))


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    file_bytes = await file.read()
    save_path = UPLOADS_DIR / (file.filename or "upload.bin")
    save_path.write_bytes(file_bytes)
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "saved_to": str(save_path),
        "size_bytes": len(file_bytes),
    }


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    file_bytes = await file.read()
    save_path = UPLOADS_DIR / (file.filename or "upload.bin")
    save_path.write_bytes(file_bytes)

    ocr_result = run_ocr(file_bytes=file_bytes, content_type=file.content_type or "application/octet-stream")
    notes: List[dict] = parse_notes(ocr_result)
    guidance = build_guidance(notes)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "saved_to": str(save_path),
        "ocr_result": ocr_result,
        "notes": notes,
        "guidance": guidance,
    }
