#!/usr/bin/env python3
"""site/btc-monthly-returns/template.html に widget/seasonality.js を埋め込み、
サーバーにアップロードする index.html を作る。

  python3 scripts/build_page.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE_DIR = ROOT / "site" / "btc-monthly-returns"

template = (PAGE_DIR / "template.html").read_text()
widget = (ROOT / "widget" / "seasonality.js").read_text()
assert "<!--WIDGET_JS-->" in template
(PAGE_DIR / "index.html").write_text(template.replace("<!--WIDGET_JS-->", widget))
print(f"wrote {PAGE_DIR / 'index.html'}")
