let data = null;
let currentTab = "gainers";
let sortKey = null;
let sortDir = 1;

const TAB_NOTES = {
  gainers: "Yahoo Finance 'day gainers' — reflects the current session (premarket during premarket hours, intraday during market hours).",
  losers: "Yahoo Finance 'day losers' — reflects the current session.",
  russell_earnings: "Russell 2000 constituents reporting earnings today. Includes top 2 news headlines per ticker.",
  low_float: "Gainers filtered to price $1–$20 and float under 20M — classic low-float momentum universe.",
};

const COLUMNS = {
  gainers: [
    sym(),
    { key: "name", label: "Name", fmt: (v) => v || "" },
    { key: "price", label: "Price", fmt: fmtMoney },
    { key: "change_pct", label: "Change %", fmt: fmtPct, cls: clsSign },
    { key: "premarket_change_pct", label: "Pre %", fmt: fmtPct, cls: clsSign },
    { key: "volume", label: "Volume", fmt: fmtBig },
    { key: "avg_volume", label: "Avg Vol", fmt: fmtBig },
    { key: "market_cap", label: "Mkt Cap", fmt: fmtBig },
  ],
  losers: [
    sym(),
    { key: "name", label: "Name", fmt: (v) => v || "" },
    { key: "price", label: "Price", fmt: fmtMoney },
    { key: "change_pct", label: "Change %", fmt: fmtPct, cls: clsSign },
    { key: "premarket_change_pct", label: "Pre %", fmt: fmtPct, cls: clsSign },
    { key: "volume", label: "Volume", fmt: fmtBig },
    { key: "avg_volume", label: "Avg Vol", fmt: fmtBig },
    { key: "market_cap", label: "Mkt Cap", fmt: fmtBig },
  ],
  russell_earnings: [
    sym(),
    { key: "name", label: "Name", fmt: (v) => v || "" },
    { key: "price", label: "Price", fmt: fmtMoney },
    { key: "change_pct", label: "Change %", fmt: fmtPct, cls: clsSign },
    { key: "premarket_change_pct", label: "Pre %", fmt: fmtPct, cls: clsSign },
    { key: "volume", label: "Volume", fmt: fmtBig },
    { key: "avg_volume", label: "Avg Vol", fmt: fmtBig },
    { key: "float_shares", label: "Float", fmt: fmtBig },
    { key: "market_cap", label: "Mkt Cap", fmt: fmtBig },
    { key: "news", label: "News", fmt: fmtNews, sortable: false },
  ],
  low_float: [
    sym(),
    { key: "name", label: "Name", fmt: (v) => v || "" },
    { key: "price", label: "Price", fmt: fmtMoney },
    { key: "change_pct", label: "Change %", fmt: fmtPct, cls: clsSign },
    { key: "volume", label: "Volume", fmt: fmtBig },
    { key: "avg_volume", label: "Avg Vol", fmt: fmtBig },
    { key: "float_shares", label: "Float", fmt: fmtBig },
    { key: "market_cap", label: "Mkt Cap", fmt: fmtBig },
    { key: "sector", label: "Sector", fmt: (v) => v || "" },
  ],
};

function sym() {
  return {
    key: "symbol",
    label: "Symbol",
    fmt: (v) => v
      ? `<a href="https://finance.yahoo.com/quote/${encodeURIComponent(v)}" target="_blank" rel="noopener">${v}</a>`
      : "",
    cls: () => "sym",
  };
}

function fmtMoney(v) {
  if (v == null) return '<span class="muted">—</span>';
  return "$" + Number(v).toFixed(2);
}

function fmtPct(v) {
  if (v == null) return '<span class="muted">—</span>';
  const n = Number(v);
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

function clsSign(v) {
  if (v == null) return "muted";
  return Number(v) >= 0 ? "pos" : "neg";
}

function fmtBig(v) {
  if (v == null) return '<span class="muted">—</span>';
  const n = Number(v);
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

function fmtNews(items) {
  if (!items || !items.length) return '<span class="muted">—</span>';
  const html = items.map((n) => {
    const title = (n.title || "").slice(0, 80);
    const pub = n.publisher ? ` <span class="muted">· ${n.publisher}</span>` : "";
    if (n.link) {
      return `<div class="news-item"><a href="${n.link}" target="_blank" rel="noopener">${title}</a>${pub}</div>`;
    }
    return `<div class="news-item">${title}${pub}</div>`;
  }).join("");
  return `<div class="news-list">${html}</div>`;
}

function render() {
  const note = document.getElementById("tab-note");
  note.textContent = TAB_NOTES[currentTab] || "";

  const rows = (data && data[currentTab]) || [];
  const cols = COLUMNS[currentTab];
  const wrap = document.getElementById("table-wrap");

  if (!rows.length) {
    wrap.innerHTML = '<div class="empty">No rows for this view. This can happen outside market hours, or if the data source is unavailable.</div>';
    return;
  }

  let sorted = rows;
  if (sortKey) {
    sorted = [...rows].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * sortDir;
      }
      return String(av).localeCompare(String(bv)) * sortDir;
    });
  }

  const thead = cols.map((c) => {
    const arrow = sortKey === c.key ? (sortDir > 0 ? " ▲" : " ▼") : "";
    const dataAttr = c.sortable === false ? "" : ` data-key="${c.key}"`;
    return `<th${dataAttr}>${c.label}${arrow}</th>`;
  }).join("");

  const tbody = sorted.map((row) =>
    "<tr>" + cols.map((c) => {
      const v = row[c.key];
      const cls = c.cls ? c.cls(v) : "";
      return `<td class="${cls}">${c.fmt(v)}</td>`;
    }).join("") + "</tr>"
  ).join("");

  wrap.innerHTML = `<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;

  wrap.querySelectorAll("th[data-key]").forEach((th) => {
    th.onclick = () => {
      const k = th.dataset.key;
      if (sortKey === k) {
        sortDir *= -1;
      } else {
        sortKey = k;
        const sample = rows.find((r) => r[k] != null);
        sortDir = sample && typeof sample[k] === "number" ? -1 : 1;
      }
      render();
    };
  });
}

async function load() {
  try {
    const resp = await fetch("data.json", { cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    data = await resp.json();
  } catch (e) {
    document.getElementById("table-wrap").innerHTML =
      `<div class="empty">Could not load <code>data.json</code>.<br><br>Run <code>python fetch_data.py</code> from the <code>stock-screener</code> directory first.<br><br><span class="muted">${e.message}</span></div>`;
    return;
  }
  document.getElementById("meta").innerHTML =
    `Generated ${data.generated_at_display || data.generated_at}<br>Russell 2000 tracked: ${data.russell_count} tickers`;
  render();
}

document.querySelectorAll(".tab").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentTab = btn.dataset.tab;
    sortKey = null;
    sortDir = 1;
    render();
  };
});

load();
