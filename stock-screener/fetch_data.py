#!/usr/bin/env python3
"""Fetches stock screener data and writes data.json.

Usage:
    pip install -r requirements.txt
    python fetch_data.py

All data sources are free:
    - Yahoo Finance via yfinance: predefined screens, ticker info, earnings
    - iShares IWM holdings CSV: Russell 2000 membership
"""

from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path

import pandas as pd
import requests
import yfinance as yf

ROOT = Path(__file__).parent
DATA_PATH = ROOT / "data.json"

IWM_URL = (
    "https://www.ishares.com/us/products/239710/ishares-russell-2000-etf/"
    "1467271812596.ajax?fileType=csv&fileName=IWM_holdings&dataType=fund"
)
UA = {"User-Agent": "Mozilla/5.0 (stock-screener-prototype)"}


def unwrap(v):
    # Yahoo sometimes returns {'raw': 1.23, 'fmt': '1.23'} — flatten to raw.
    if isinstance(v, dict):
        return v.get("raw")
    return v


def fetch_iwm_holdings() -> set[str]:
    resp = requests.get(IWM_URL, headers=UA, timeout=30)
    resp.raise_for_status()
    lines = resp.text.splitlines()
    header_idx = next(
        (i for i, line in enumerate(lines)
         if "Ticker" in line and ("Name" in line or "Asset" in line)),
        None,
    )
    if header_idx is None:
        raise RuntimeError("Could not locate header row in IWM CSV")
    df = pd.read_csv(StringIO("\n".join(lines[header_idx:])))
    tickers: set[str] = set()
    for raw in df.get("Ticker", pd.Series()).dropna().astype(str):
        sym = raw.strip()
        if not sym or sym == "-":
            continue
        tickers.add(sym.replace(".", "-"))  # Yahoo uses BRK-B, not BRK.B
    return tickers


def fetch_screen(screen_id: str, count: int = 50) -> list[dict]:
    """Fetch a yfinance predefined screen.

    screen_id options include: day_gainers, day_losers, most_actives,
    small_cap_gainers, aggressive_small_caps.
    """
    quotes: list[dict] = []
    try:
        result = yf.screen(screen_id, count=count)
    except Exception as e:
        print(f"  warning: screen '{screen_id}' failed: {e}")
        return []
    if isinstance(result, dict):
        quotes = result.get("quotes") or []
    elif isinstance(result, list):
        quotes = result

    out = []
    for q in quotes:
        out.append({
            "symbol": q.get("symbol"),
            "name": q.get("shortName") or q.get("longName"),
            "price": unwrap(q.get("regularMarketPrice")),
            "change_pct": unwrap(q.get("regularMarketChangePercent")),
            "premarket_change_pct": unwrap(q.get("preMarketChangePercent")),
            "premarket_price": unwrap(q.get("preMarketPrice")),
            "volume": unwrap(q.get("regularMarketVolume")),
            "avg_volume": (
                unwrap(q.get("averageDailyVolume3Month"))
                or unwrap(q.get("averageDailyVolume10Day"))
            ),
            "market_cap": unwrap(q.get("marketCap")),
        })
    return out


def enrich(symbol: str, with_news: bool = False) -> dict | None:
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info or {}
    except Exception as e:
        print(f"  warning: enrich {symbol}: {e}")
        return None
    if not info:
        return None
    row = {
        "symbol": symbol,
        "name": info.get("shortName") or info.get("longName"),
        "price": info.get("regularMarketPrice") or info.get("currentPrice"),
        "change_pct": info.get("regularMarketChangePercent"),
        "premarket_price": info.get("preMarketPrice"),
        "premarket_change_pct": info.get("preMarketChangePercent"),
        "volume": info.get("regularMarketVolume") or info.get("volume"),
        "avg_volume": info.get("averageVolume"),
        "float_shares": info.get("floatShares"),
        "shares_outstanding": info.get("sharesOutstanding"),
        "market_cap": info.get("marketCap"),
        "sector": info.get("sector"),
    }
    if with_news:
        row["news"] = fetch_news(ticker)
    return row


def fetch_news(ticker: yf.Ticker, limit: int = 2) -> list[dict]:
    try:
        items = ticker.news or []
    except Exception:
        return []
    out = []
    for n in items[:limit]:
        # yfinance has two news schemas; handle both.
        if "content" in n and isinstance(n["content"], dict):
            c = n["content"]
            link = (c.get("clickThroughUrl") or c.get("canonicalUrl") or {}).get("url")
            out.append({
                "title": c.get("title"),
                "link": link,
                "publisher": (c.get("provider") or {}).get("displayName"),
            })
        else:
            out.append({
                "title": n.get("title"),
                "link": n.get("link"),
                "publisher": n.get("publisher"),
            })
    return out


def fetch_earnings_russell(russell: set[str], limit: int = 40) -> list[dict]:
    today = datetime.now().strftime("%Y-%m-%d")
    url = f"https://finance.yahoo.com/calendar/earnings?day={today}"
    try:
        resp = requests.get(url, headers=UA, timeout=20)
        resp.raise_for_status()
        tables = pd.read_html(StringIO(resp.text))
    except Exception as e:
        print(f"  warning: earnings calendar: {e}")
        return []
    if not tables:
        return []
    df = tables[0]
    sym_col = next(
        (c for c in df.columns if "symbol" in str(c).lower()), None
    )
    if not sym_col:
        return []
    syms = [str(s).strip() for s in df[sym_col].dropna()]
    russell_syms = [s for s in syms if s in russell]
    print(f"  {len(russell_syms)} Russell-2000 tickers reporting earnings today")
    out = []
    for s in russell_syms[:limit]:
        row = enrich(s, with_news=True)
        if row:
            out.append(row)
        time.sleep(0.1)
    return out


def filter_low_float(gainers: list[dict], max_enrich: int = 30) -> list[dict]:
    """From the gainers list, keep $1-$20 price and float <20M."""
    out = []
    for row in gainers[:max_enrich]:
        sym = row.get("symbol")
        if not sym:
            continue
        full = enrich(sym)
        if not full:
            continue
        price = full.get("price") or 0
        float_shares = full.get("float_shares") or 0
        if 1 <= price <= 20 and 0 < float_shares < 20_000_000:
            out.append(full)
        time.sleep(0.1)
    return out


def main():
    print("Fetching Russell 2000 holdings (iShares IWM CSV)...")
    try:
        russell = fetch_iwm_holdings()
    except Exception as e:
        print(f"  warning: {e}")
        russell = set()
    print(f"  {len(russell)} tickers")

    print("Fetching day gainers...")
    gainers = fetch_screen("day_gainers", count=50)
    print(f"  {len(gainers)} rows")

    print("Fetching day losers...")
    losers = fetch_screen("day_losers", count=50)
    print(f"  {len(losers)} rows")

    print("Fetching Russell 2000 earnings today...")
    earnings = fetch_earnings_russell(russell) if russell else []
    print(f"  {len(earnings)} rows")

    print("Filtering low-float runners (slow: enriching top gainers)...")
    low_float = filter_low_float(gainers)
    print(f"  {len(low_float)} rows")

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "generated_at_display": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "russell_count": len(russell),
        "gainers": gainers,
        "losers": losers,
        "russell_earnings": earnings,
        "low_float": low_float,
    }
    DATA_PATH.write_text(json.dumps(payload, indent=2, default=str))
    print(f"Wrote {DATA_PATH}")


if __name__ == "__main__":
    main()
