# btc-data

Bitcoin monthly returns data for COCOSTA dashboard (Bitstamp BTC/USD, UTC)

## データ

`data/monthly.json` — 2012-01 以降の月次リターン

- `open`: 月初日の日足始値、`close`: 月末日の日足終値（Bitstamp BTC/USD, UTC）
- `return_pct`: close / open - 1（%）
- `partial: true` は当月（未確定）。集計には使わない
- 2026-09-30 までの値は TradingView の BITSTAMP:BTCUSD 日足エクスポートから生成
- 2015-01-05〜01-09 は Bitstamp の取引停止による日足欠損あり（月初・月末値には影響なし）

配信URL: `https://cdn.jsdelivr.net/gh/guilebot777/btc-data@main/data/monthly.json`

## 自動更新

`.github/workflows/update.yml` が毎日 00:10 UTC に `scripts/update.py` を実行し、直近2か月を Bitstamp API から再計算してコミットする。
確定済みの月の始値が1%以上ずれた場合はデータ異常として失敗させる（GitHubから失敗通知メールが届く）。

手動実行: Actions タブ → Update monthly data → Run workflow
