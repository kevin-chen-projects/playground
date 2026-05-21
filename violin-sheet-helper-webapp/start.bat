@echo off
set PROJECT_DIR=%~dp0
cd /d %PROJECT_DIR%

if not exist .venv (
  py -m venv .venv
)

call .venv\Scripts\activate.bat
pip install -r requirements.txt
python -m uvicorn src.api.main:app --reload --host 127.0.0.1 --port 8000
