# Stock Screener — Commands

## Setup (one time)

```bash
cd stock-screener
pip install -r requirements.txt
```

## Fetch fresh data

Takes ~1–2 minutes. Writes `data.json`.

```bash
python fetch_data.py
```

## View the UI

Any static server works. From the `stock-screener` directory:

```bash
python -m http.server 8000
```

Then open http://localhost:8000

## Refresh workflow

Rerun `python fetch_data.py` whenever you want fresh data, then reload the browser tab.
