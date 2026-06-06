@echo off
setlocal
cd /d %~dp0

echo ============================================================
echo   Guitar MP3/WAV Transcription - starting up
echo ============================================================
echo.

REM Find a working Python launcher. "py" is installed by the official
REM python.org installer and is the most reliable on Windows; fall back
REM to "python" if the launcher is not present.
set PYTHON=
where py >nul 2>&1 && set PYTHON=py
if not defined PYTHON (
    where python >nul 2>&1 && set PYTHON=python
)

if not defined PYTHON (
    echo [ERROR] Python was not found on this computer.
    echo.
    echo Please install Python 3.10 or newer from:
    echo     https://www.python.org/downloads/
    echo.
    echo IMPORTANT: on the first installer screen, tick the box
    echo            "Add Python to PATH" before clicking Install.
    echo.
    echo After installing, double-click this START file again.
    echo.
    pause
    exit /b 1
)

echo Using Python launcher: %PYTHON%
echo.
echo The first run downloads and installs components - this can take a
echo few minutes and needs an internet connection. Please be patient.
echo.

%PYTHON% start.py

echo.
echo The app has stopped. You can close this window.
pause
