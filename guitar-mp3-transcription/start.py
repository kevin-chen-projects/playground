from __future__ import annotations

import os
import platform
import shutil
import subprocess
import sys
import venv
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / 'backend'
VENV_DIR = BACKEND / '.venv'
REQUIREMENTS = BACKEND / 'requirements.txt'


def info(msg: str) -> None:
    print(f'[INFO] {msg}')


def fail(msg: str, code: int = 1) -> None:
    print(f'[ERROR] {msg}')
    sys.exit(code)


def check_system() -> None:
    info(f'Platform: {platform.platform()}')
    info(f'Python: {sys.version.split()[0]}')
    if sys.version_info < (3, 10):
        fail('Python 3.10 or newer is recommended.')

    # A slightly better PATH message than the old python3 one
    if shutil.which('python') is None and shutil.which('python3') is None:
        fail('python executable not found on PATH. Install Python from python.org.')


def venv_paths() -> tuple[Path, Path]:
    """Return (python_bin, pip_bin) for the current OS."""
    if os.name == 'nt':
        # Windows venv layout
        py = VENV_DIR / 'Scripts' / 'python.exe'
        pip = VENV_DIR / 'Scripts' / 'pip.exe'
    else:
        # macOS/Linux venv layout
        py = VENV_DIR / 'bin' / 'python'
        pip = VENV_DIR / 'bin' / 'pip'
    return py, pip


def ensure_venv() -> None:
    if not VENV_DIR.exists():
        info('Creating virtual environment...')
        venv.create(VENV_DIR, with_pip=True)
    else:
        info('Using existing virtual environment.')


def install_requirements() -> None:
    python_bin, pip_bin = venv_paths()

    if not python_bin.exists() or not pip_bin.exists():
        # Provide much more actionable diagnostics for testers.
        info(f'Expected venv python: {python_bin}')
        info(f'Expected venv pip:    {pip_bin}')
        if VENV_DIR.exists():
            info('Existing .venv directory contents:')
            try:
                for p in sorted(VENV_DIR.rglob('*')):
                    # keep output bounded
                    if p.is_file() and p.parts[-1] in {'python.exe', 'python', 'pip.exe', 'pip'}:
                        info(f'  found: {p}')
            except Exception:
                pass
        fail('Virtual environment Python/pip not found after setup. This usually indicates a venv path/layout mismatch.')

    info('Upgrading pip...')
    subprocess.check_call([str(python_bin), '-m', 'pip', 'install', '--upgrade', 'pip'])

    info('Installing Python dependencies...')
    subprocess.check_call([str(pip_bin), 'install', '-r', str(REQUIREMENTS)])


def print_next_steps() -> None:
    print()
    print('Open this URL in your browser:')
    print('  http://127.0.0.1:8000')
    print()
    print('When finished testing, press Ctrl+C in this terminal to stop the app.')
    print()


def start_server() -> None:
    python_bin, _pip_bin = venv_paths()
    if not python_bin.exists():
        fail('Cannot start server: venv python not found.')

    info('Starting local web app...')
    os.chdir(BACKEND)
    print_next_steps()
    os.execv(str(python_bin), [str(python_bin), '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'])


def main() -> None:
    try:
        check_system()
        ensure_venv()
        install_requirements()
        start_server()
    except subprocess.CalledProcessError as exc:
        fail(f'A setup command failed with exit code {exc.returncode}.')
    except KeyboardInterrupt:
        print('[WARN] Interrupted by user.')


if __name__ == '__main__':
    main()
