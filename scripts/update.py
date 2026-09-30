#!/usr/bin/env python3
"""Bitstampの日足から直近の月次リターンを再計算し、data/monthly.json を更新する。

GitHub Actions から1日1回実行する想定。標準ライブラリのみ使用。
  python3 scripts/update.py            # 取得して data/monthly.json を上書き
  python3 scripts/update.py --dry-run  # 取得・計算結果の表示のみ
"""

import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "monthly.json"
API_URL = "https://www.bitstamp.net/api/v2/ohlc/btcusd/?step=86400&limit=70"
# 既存値と再計算値がこれ以上ずれたら、データ異常として更新を止める
MAX_DRIFT_PCT = 1.0


def fetch_daily():
    req = urllib.request.Request(API_URL, headers={"User-Agent": "btc-data-updater"})
    with urllib.request.urlopen(req, timeout=30) as res:
        payload = json.load(res)
    candles = payload["data"]["ohlc"]
    days = []
    for c in candles:
        dt = datetime.fromtimestamp(int(c["timestamp"]), tz=timezone.utc)
        days.append({"date": dt.date(), "open": float(c["open"]), "close": float(c["close"])})
    days.sort(key=lambda d: d["date"])
    if not days:
        raise RuntimeError("Bitstamp returned no candles")
    return days


def monthly_from_daily(days, today):
    """月初(1日)の日足を含む月だけを再計算する。"""
    months = {}
    for d in days:
        key = d["date"].strftime("%Y-%m")
        if key not in months:
            if d["date"].day != 1:
                continue  # 取得範囲が月の途中から始まる月は正しい始値が取れない
            months[key] = {"month": key, "open": d["open"]}
        months[key]["close"] = d["close"]
    current = today.strftime("%Y-%m")
    for m in months.values():
        m["return_pct"] = round((m["close"] / m["open"] - 1) * 100, 2)
        m["partial"] = m["month"] == current
    return months


def main():
    dry_run = "--dry-run" in sys.argv
    now = datetime.now(timezone.utc)
    fresh = monthly_from_daily(fetch_daily(), now.date())

    data = json.loads(DATA_PATH.read_text())
    by_month = {m["month"]: m for m in data["months"]}

    for key, m in sorted(fresh.items()):
        old = by_month.get(key)
        if old and not old["partial"]:
            drift = abs(m["open"] / old["open"] - 1) * 100
            if drift > MAX_DRIFT_PCT:
                raise RuntimeError(f"{key}: open drifted {drift:.2f}% ({old['open']} -> {m['open']})")
        by_month[key] = m
        print(f"{key}: open={m['open']} close={m['close']} return={m['return_pct']}% partial={m['partial']}")

    data["months"] = [by_month[k] for k in sorted(by_month)]
    data["updated_utc"] = now.strftime("%Y-%m-%dT%H:%M:%SZ")

    if dry_run:
        print("dry run: not writing")
        return
    DATA_PATH.write_text(json.dumps(data, indent=1) + "\n")


if __name__ == "__main__":
    main()
