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


def compute_rvol(rows: list[dict]) -> None:
    """Add rvol = today's volume / average volume. In-place."""
    for row in rows:
        v = row.get("volume")
        a = row.get("avg_volume")
        row["rvol"] = (v / a) if (v and a) else None


def _col(df, name):
    """Get column as fillna(0) series, or empty."""
    if name in df.columns:
        return df[name].fillna(0)
    return None


def fetch_options_summary(symbols: list[str], max_tickers: int = 20) -> list[dict]:
    """For each symbol, summarize the nearest-expiry option chain.

    Produces: call/put volume, put/call ratio, ATM IV for calls and puts,
    IV skew, and count of strikes with volume > open interest (unusual).
    """
    out = []
    for sym in symbols[:max_tickers]:
        try:
            t = yf.Ticker(sym)
            expirations = t.options
        except Exception as e:
            print(f"  warning: options for {sym}: {e}")
            continue
        if not expirations:
            continue
        nearest = expirations[0]
        try:
            chain = t.option_chain(nearest)
            calls, puts = chain.calls, chain.puts
        except Exception as e:
            print(f"  warning: chain for {sym}: {e}")
            continue

        if (calls is None or calls.empty) and (puts is None or puts.empty):
            continue

        c_vol = _col(calls, "volume")
        p_vol = _col(puts, "volume")
        c_oi = _col(calls, "openInterest")
        p_oi = _col(puts, "openInterest")

        call_volume = int(c_vol.sum()) if c_vol is not None else 0
        put_volume = int(p_vol.sum()) if p_vol is not None else 0
        call_oi = int(c_oi.sum()) if c_oi is not None else 0
        put_oi = int(p_oi.sum()) if p_oi is not None else 0
        pc_ratio = (put_volume / call_volume) if call_volume > 0 else None

        # ATM IV: strike closest to current price
        try:
            info = t.info or {}
            current = info.get("regularMarketPrice") or info.get("currentPrice")
        except Exception:
            current = None

        atm_call_iv = atm_put_iv = None
        if current:
            if calls is not None and not calls.empty and "strike" in calls and "impliedVolatility" in calls:
                idx = (calls["strike"] - current).abs().idxmin()
                v = calls.loc[idx, "impliedVolatility"]
                if pd.notna(v):
                    atm_call_iv = float(v)
            if puts is not None and not puts.empty and "strike" in puts and "impliedVolatility" in puts:
                idx = (puts["strike"] - current).abs().idxmin()
                v = puts.loc[idx, "impliedVolatility"]
                if pd.notna(v):
                    atm_put_iv = float(v)

        # Unusual activity: volume exceeds open interest by a meaningful margin
        unusual = 0
        if c_vol is not None and c_oi is not None:
            unusual += int((c_vol > c_oi + 50).sum())
        if p_vol is not None and p_oi is not None:
            unusual += int((p_vol > p_oi + 50).sum())

        out.append({
            "symbol": sym,
            "price": current,
            "expiry": nearest,
            "call_volume": call_volume,
            "put_volume": put_volume,
            "put_call_ratio": pc_ratio,
            "call_oi": call_oi,
            "put_oi": put_oi,
            "atm_call_iv": atm_call_iv,
            "atm_put_iv": atm_put_iv,
            "iv_skew": (atm_put_iv - atm_call_iv) if (atm_call_iv is not None and atm_put_iv is not None) else None,
            "unusual_strikes": unusual,
        })
        time.sleep(0.15)
    return out


def build_options_universe(
    gainers: list[dict], losers: list[dict], earnings: list[dict]
) -> list[str]:
    """Pick the tickers most likely to have interesting options flow today."""
    syms: list[str] = []
    seen: set[str] = set()
    for source in (gainers[:5], losers[:5], earnings[:10]):
        for r in source:
            s = r.get("symbol")
            if s and s not in seen:
                seen.add(s)
                syms.append(s)
    return syms


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

    for rows in (gainers, losers, earnings, low_float):
        compute_rvol(rows)

    option_syms = build_options_universe(gainers, losers, earnings)
    print(f"Fetching options summary for {len(option_syms)} top tickers...")
    options = fetch_options_summary(option_syms)
    print(f"  {len(options)} rows")

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "generated_at_display": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "russell_count": len(russell),
        "gainers": gainers,
        "losers": losers,
        "russell_earnings": earnings,
        "low_float": low_float,
        "options": options,
    }
    DATA_PATH.write_text(json.dumps(payload, indent=2, default=str))
    print(f"Wrote {DATA_PATH}")


if __name__ == "__main__":
    main()
