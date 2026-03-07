import yfinance as yf
import json
from datetime import datetime, timedelta
from pathlib import Path

# Load portfolios
with open("data/portfolios.json") as f:
    portfolios = json.load(f)

# Collect all unique tickers + benchmark
tickers = set()
for p in portfolios:
    for h in p["holdings"]:
        tickers.add(h["ticker"])
tickers.add("VT")  # Vanguard Total World Stock ETF

# Find the earliest portfolio start date
start_date = min(p["created_date"] for p in portfolios)

print(f"Fetching prices from {start_date} for: {', '.join(sorted(tickers))}")

# Download all prices at once
raw = yf.download(list(tickers), start=start_date, auto_adjust=True)
prices = raw["Close"]

# Convert to a clean dict: { "AAPL": { "2025-01-02": 185.5, ... }, ... }
output = {}
for ticker in tickers:
    series = prices[ticker].dropna()
    output[ticker] = {
        str(date.date()): round(float(price), 4)
        for date, price in series.items()
    }

# Save to data/prices.json
Path("data").mkdir(exist_ok=True)
with open("data/prices.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"✅ Saved prices for {len(output)} tickers to data/prices.json")