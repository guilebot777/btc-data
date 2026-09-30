/* BTC月別騰落率ダッシュボード（cocosta.jp 埋め込み用）
 * 使い方: <div id="btc-seasonality"></div> を置いてこのスクリプトを読み込む。
 *   言語を固定したい場合は <div id="btc-seasonality" data-lang="en"> のように指定する。
 * データは window.BTCS_DATA があればそれを、なければ jsDelivr の monthly.json を使う。
 */
(function () {
  var DATA_URL = "https://cdn.jsdelivr.net/gh/guilebot777/btc-data@main/data/monthly.json";
  var FIRST_YEAR = 2013;
  var HALVING_BASE = 2012; // 2012, 2016, 2020, 2024 ...
  var STORE_KEY = "btcs-lang";

  // ---------- 翻訳 ----------
  var I18N = {
    ja: {
      name: "日本語", locale: "ja-JP", tz: "Asia/Tokyo", tzLabel: "日本時間", yearSuffix: "年",
      months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
      title: "ビットコイン月別騰落率",
      sub: "集計する期間とサイクルを選ぶと、平均・中央値・勝率がその条件で再計算されます。",
      tileNow: "{m}の途中経過（{y}年）",
      tileNowNote: "選択期間の中央値 {med} ・ 過去{n}回中 上から{rank}番目の水準",
      tileNone: "選択期間に比較対象がありません",
      tileNext: "来月（{m}）の中央値・選択期間",
      tileNextNote: "勝率 {p}%（{wl}）・ 平均 {mean}",
      wl: "{w}勝{l}敗",
      start: "開始年", end: "終了年", latest: "最新（確定分まで）", cycle: "サイクル", allYears: "すべての年",
      phases: ["半減期の年", "半減期の翌年", "半減期の2年後", "半減期の3年後"],
      presets: ["全期間", "直近4年", "直近8年", "今年と同じサイクル"],
      statsTitle: "選択期間の統計", breakdownTitle: "年別の内訳",
      year: "年", annual: "年間",
      rows: ["平均", "中央値", "勝率", "上昇月の平均", "下落月の平均", "最大", "最小", "サンプル数"],
      prelim: "暫定", ytd: "年初来",
      legendPartial: "点線の枠 = 当月（未確定・集計対象外）", legendOut: "薄い行 = 集計対象外の年",
      foot: "データ: Bitstamp BTC/USD 日足（UTC）、騰落率 = 月末終値 ÷ 月初始値 − 1。最終更新 {t}。過去の傾向は将来の値動きを保証するものではありません。",
      open: "始値", close: "終値", current: "現在値", ret: "騰落率",
      loading: "データを読み込んでいます…", error: "データを読み込めませんでした。時間をおいて再読み込みしてください。"
    },
    en: {
      name: "English", locale: "en-US", tz: "UTC", tzLabel: "UTC", yearSuffix: "",
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      title: "Bitcoin Monthly Returns",
      sub: "Pick a period and a halving-cycle phase to recalculate the mean, median and win rate.",
      tileNow: "{m} so far ({y})",
      tileNowNote: "Median for the selected period {med} · ranks #{rank} of {n}",
      tileNone: "No comparable months in the selected period",
      tileNext: "Next month ({m}) median · selected period",
      tileNextNote: "Win rate {p}% ({wl}) · Mean {mean}",
      wl: "{w}W {l}L",
      start: "From", end: "To", latest: "Latest (closed months)", cycle: "Cycle", allYears: "All years",
      phases: ["Halving year", "1 year after halving", "2 years after halving", "3 years after halving"],
      presets: ["All", "Last 4 years", "Last 8 years", "Same cycle as this year"],
      statsTitle: "Statistics for the selected period", breakdownTitle: "Breakdown by year",
      year: "Year", annual: "Annual",
      rows: ["Mean", "Median", "Win rate", "Avg. up month", "Avg. down month", "Best", "Worst", "Sample size"],
      prelim: "prelim.", ytd: "YTD",
      legendPartial: "Dashed border = current month (not closed, excluded)", legendOut: "Faded rows = years outside the selection",
      foot: "Data: Bitstamp BTC/USD daily candles (UTC). Return = month close ÷ month open − 1. Last updated {t}. Past patterns do not guarantee future performance.",
      open: "Open", close: "Close", current: "Current", ret: "Return",
      loading: "Loading data…", error: "Could not load the data. Please reload the page later."
    },
    "zh-Hans": {
      name: "简体中文", locale: "zh-CN", tz: "UTC", tzLabel: "UTC", yearSuffix: "年",
      months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
      title: "比特币月度涨跌幅",
      sub: "选择统计期间和减半周期后，平均值、中位数和胜率将按该条件重新计算。",
      tileNow: "{m}至今（{y}年）",
      tileNowNote: "所选期间中位数 {med} · 在过去{n}次中排第{rank}位",
      tileNone: "所选期间内没有可比较的数据",
      tileNext: "下月（{m}）中位数 · 所选期间",
      tileNextNote: "胜率 {p}%（{wl}）· 平均 {mean}",
      wl: "{w}胜{l}负",
      start: "开始年", end: "结束年", latest: "最新（仅已收盘月份）", cycle: "周期", allYears: "全部年份",
      phases: ["减半当年", "减半后第1年", "减半后第2年", "减半后第3年"],
      presets: ["全部期间", "近4年", "近8年", "与今年同周期"],
      statsTitle: "所选期间统计", breakdownTitle: "按年份明细",
      year: "年份", annual: "全年",
      rows: ["平均值", "中位数", "胜率", "上涨月平均", "下跌月平均", "最大", "最小", "样本数"],
      prelim: "暂定", ytd: "年初至今",
      legendPartial: "虚线框 = 当月（未收盘，不计入统计）", legendOut: "浅色行 = 未计入统计的年份",
      foot: "数据：Bitstamp BTC/USD 日线（UTC），涨跌幅 = 月末收盘价 ÷ 月初开盘价 − 1。最后更新 {t}。过去的规律不代表未来表现。",
      open: "开盘", close: "收盘", current: "现价", ret: "涨跌幅",
      loading: "正在加载数据…", error: "数据加载失败，请稍后刷新页面。"
    },
    "zh-Hant": {
      name: "繁體中文", locale: "zh-TW", tz: "UTC", tzLabel: "UTC", yearSuffix: "年",
      months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
      title: "比特幣月度漲跌幅",
      sub: "選擇統計期間與減半週期後，平均值、中位數與勝率會依該條件重新計算。",
      tileNow: "{m}至今（{y}年）",
      tileNowNote: "所選期間中位數 {med} · 在過去{n}次中排第{rank}名",
      tileNone: "所選期間內沒有可比較的資料",
      tileNext: "下個月（{m}）中位數 · 所選期間",
      tileNextNote: "勝率 {p}%（{wl}）· 平均 {mean}",
      wl: "{w}勝{l}負",
      start: "開始年", end: "結束年", latest: "最新（僅已收盤月份）", cycle: "週期", allYears: "所有年份",
      phases: ["減半當年", "減半後第1年", "減半後第2年", "減半後第3年"],
      presets: ["全部期間", "近4年", "近8年", "與今年同週期"],
      statsTitle: "所選期間統計", breakdownTitle: "各年度明細",
      year: "年份", annual: "全年",
      rows: ["平均值", "中位數", "勝率", "上漲月平均", "下跌月平均", "最大", "最小", "樣本數"],
      prelim: "暫定", ytd: "年初至今",
      legendPartial: "虛線框 = 當月（未收盤，不列入統計）", legendOut: "淡色列 = 未列入統計的年份",
      foot: "資料：Bitstamp BTC/USD 日線（UTC），漲跌幅 = 月底收盤價 ÷ 月初開盤價 − 1。最後更新 {t}。過去的規律不代表未來表現。",
      open: "開盤", close: "收盤", current: "現價", ret: "漲跌幅",
      loading: "資料載入中…", error: "無法載入資料，請稍後重新整理頁面。"
    },
    ko: {
      name: "한국어", locale: "ko-KR", tz: "UTC", tzLabel: "UTC", yearSuffix: "년",
      months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
      title: "비트코인 월별 수익률",
      sub: "기간과 반감기 사이클을 선택하면 평균·중앙값·승률이 해당 조건으로 다시 계산됩니다.",
      tileNow: "{m} 현재까지 ({y}년)",
      tileNowNote: "선택 기간 중앙값 {med} · 과거 {n}회 중 {rank}위 수준",
      tileNone: "선택 기간에 비교할 데이터가 없습니다",
      tileNext: "다음 달({m}) 중앙값 · 선택 기간",
      tileNextNote: "승률 {p}% ({wl}) · 평균 {mean}",
      wl: "{w}승 {l}패",
      start: "시작 연도", end: "종료 연도", latest: "최신 (마감된 월까지)", cycle: "사이클", allYears: "전체 연도",
      phases: ["반감기 해", "반감기 1년 후", "반감기 2년 후", "반감기 3년 후"],
      presets: ["전체 기간", "최근 4년", "최근 8년", "올해와 같은 사이클"],
      statsTitle: "선택 기간 통계", breakdownTitle: "연도별 상세",
      year: "연도", annual: "연간",
      rows: ["평균", "중앙값", "승률", "상승 월 평균", "하락 월 평균", "최대", "최소", "표본 수"],
      prelim: "잠정", ytd: "연초 대비",
      legendPartial: "점선 테두리 = 이번 달 (미확정, 집계 제외)", legendOut: "흐린 행 = 집계 대상이 아닌 연도",
      foot: "데이터: Bitstamp BTC/USD 일봉(UTC), 수익률 = 월말 종가 ÷ 월초 시가 − 1. 최종 업데이트 {t}. 과거의 경향이 미래의 수익을 보장하지 않습니다.",
      open: "시가", close: "종가", current: "현재가", ret: "수익률",
      loading: "데이터를 불러오는 중…", error: "데이터를 불러오지 못했습니다. 잠시 후 새로고침해 주세요."
    },
    es: {
      name: "Español", locale: "es-ES", tz: "UTC", tzLabel: "UTC", yearSuffix: "",
      months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      title: "Rentabilidad mensual de Bitcoin",
      sub: "Elige un periodo y una fase del ciclo del halving para recalcular la media, la mediana y el porcentaje de meses al alza.",
      tileNow: "{m} hasta hoy ({y})",
      tileNowNote: "Mediana del periodo {med} · puesto {rank} de {n}",
      tileNone: "No hay meses comparables en el periodo seleccionado",
      tileNext: "Mediana del próximo mes ({m}) · periodo seleccionado",
      tileNextNote: "Meses al alza {p}% ({wl}) · Media {mean}",
      wl: "{w}↑ {l}↓",
      start: "Desde", end: "Hasta", latest: "Último (meses cerrados)", cycle: "Ciclo", allYears: "Todos los años",
      phases: ["Año del halving", "1 año tras el halving", "2 años tras el halving", "3 años tras el halving"],
      presets: ["Todo", "Últimos 4 años", "Últimos 8 años", "Mismo ciclo que este año"],
      statsTitle: "Estadísticas del periodo seleccionado", breakdownTitle: "Detalle por año",
      year: "Año", annual: "Anual",
      rows: ["Media", "Mediana", "Meses al alza", "Media meses al alza", "Media meses a la baja", "Máximo", "Mínimo", "Muestra"],
      prelim: "provis.", ytd: "en el año",
      legendPartial: "Borde discontinuo = mes en curso (sin cerrar, excluido)", legendOut: "Filas atenuadas = años fuera de la selección",
      foot: "Datos: velas diarias de Bitstamp BTC/USD (UTC). Rentabilidad = cierre del mes ÷ apertura del mes − 1. Última actualización {t}. Los patrones pasados no garantizan resultados futuros.",
      open: "Apertura", close: "Cierre", current: "Actual", ret: "Rentabilidad",
      loading: "Cargando datos…", error: "No se pudieron cargar los datos. Vuelve a cargar la página más tarde."
    }
  };
  var LANGS = ["ja", "en", "zh-Hans", "zh-Hant", "ko", "es"];

  function pickLang(root) {
    var forced = root.getAttribute("data-lang");
    if (forced && I18N[forced]) return forced;
    try { var s = localStorage.getItem(STORE_KEY); if (s && I18N[s]) return s; } catch (e) {}
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "ja";
    nav = nav.toLowerCase();
    if (nav.indexOf("zh") === 0) return /tw|hk|mo|hant/.test(nav) ? "zh-Hant" : "zh-Hans";
    var base = nav.split("-")[0];
    return I18N[base] ? base : "ja";
  }
  function tpl(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }

  // ---------- スタイル ----------
  var CSS = [
    ".btcs{--navy:#1E3A5F;--blue:#3B82C4;--red:#C0392B;--gold:#D4A849;--ink:#1A1A2E;--muted:#4A5568;--line:#E2E8F0;--soft:#F5F7FA;--bg:#FFFFFF;",
    "font-family:'Noto Sans JP','Hiragino Sans','Yu Gothic','PingFang SC','Microsoft YaHei','Malgun Gothic',sans-serif;color:var(--ink);background:var(--bg);font-size:14px;line-height:1.5;max-width:1200px;margin:0 auto}",
    ".btcs *{box-sizing:border-box}",
    ".btcs .btcs-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:8px 16px;margin-bottom:16px}",
    ".btcs .btcs-head>div{min-width:0;flex:1 1 320px}",
    ".btcs h2{font-size:22px;font-weight:700;color:var(--navy);margin:0 0 4px;text-wrap:balance}",
    ".btcs h3{font-size:15px;font-weight:700;color:var(--navy);margin:0;letter-spacing:.02em}",
    ".btcs .btcs-sub{color:var(--muted);font-size:13px;margin:0}",
    ".btcs .btcs-lang{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:13px}",
    ".btcs .btcs-lang svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.6}",
    ".btcs .btcs-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:16px}",
    ".btcs .btcs-tile{background:var(--soft);border-radius:8px;padding:14px 16px}",
    ".btcs .btcs-tile-label{font-size:12px;color:var(--muted);letter-spacing:.04em}",
    ".btcs .btcs-tile-main{font-size:28px;font-weight:800;letter-spacing:.03em;font-variant-numeric:tabular-nums;color:var(--navy)}",
    ".btcs .btcs-tile-main.up{color:var(--blue)}.btcs .btcs-tile-main.down{color:var(--red)}",
    ".btcs .btcs-tile-note{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}",
    ".btcs .btcs-controls{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;margin-bottom:16px}",
    ".btcs .btcs-field{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted)}",
    ".btcs select{font:inherit;font-size:14px;padding:5px 8px;border:1px solid #CBD5E0;border-radius:6px;background:#fff;color:var(--ink);max-width:100%}",
    ".btcs .btcs-btns{display:flex;flex-wrap:wrap;gap:6px}",
    ".btcs button{font:inherit;font-size:13px;padding:5px 12px;border:1px solid var(--blue);border-radius:999px;background:#fff;color:var(--blue);cursor:pointer}",
    ".btcs button[aria-pressed=true]{background:var(--blue);color:#fff}",
    ".btcs button:focus-visible,.btcs select:focus-visible{outline:2px solid var(--gold);outline-offset:2px}",
    ".btcs .btcs-sec{display:flex;align-items:baseline;gap:12px;margin:0 0 8px}",
    ".btcs .btcs-scroll{overflow-x:auto;border-radius:8px}",
    ".btcs table{border-collapse:separate;width:100%;min-width:980px;font-variant-numeric:tabular-nums}",
    ".btcs th,.btcs td{text-align:center;white-space:nowrap}",
    ".btcs th.btcs-y{position:sticky;left:0;z-index:1;text-align:left}",
    // 統計パネル: ネイビー見出し + 白地 + ミニバー
    ".btcs .btcs-stats-wrap{border:1px solid var(--navy);margin-bottom:28px}",
    ".btcs .btcs-stats{border-spacing:0}",
    ".btcs .btcs-stats thead th{background:var(--navy);color:#fff;font-weight:500;font-size:13px;padding:8px 4px}",
    ".btcs .btcs-stats thead th.btcs-y{padding-left:12px}",
    ".btcs .btcs-stats tbody th.btcs-y{background:#fff;color:var(--navy);font-weight:700;font-size:12px;padding:8px 12px;min-width:120px}",
    ".btcs .btcs-stats tbody td{background:#fff;font-size:13px;padding:8px 6px;border-top:1px solid var(--line)}",
    ".btcs .btcs-stats tbody th{border-top:1px solid var(--line)}",
    ".btcs .btcs-stats tbody tr.btcs-key td{font-weight:700;font-size:14px}",
    ".btcs .btcs-stats tbody tr.btcs-minor td,.btcs .btcs-stats tbody tr.btcs-minor th{color:var(--muted);font-weight:400;font-size:12px}",
    ".btcs .btcs-stats td.btcs-now{background:#FFF8E6}",
    ".btcs .btcs-stats thead th.btcs-now{box-shadow:inset 0 -3px 0 var(--gold)}",
    ".btcs .btcs-bar{display:block;position:relative;height:5px;margin:5px auto 0;width:84%;background:var(--soft);border-radius:3px}",
    ".btcs .btcs-bar::after{content:'';position:absolute;left:50%;top:-2px;bottom:-2px;width:1px;background:#A0AEC0}",
    ".btcs .btcs-bar i{position:absolute;top:0;bottom:0;border-radius:3px}",
    ".btcs .btcs-meter{display:block;position:relative;height:5px;margin:5px auto 0;width:84%;background:var(--soft);border-radius:3px}",
    ".btcs .btcs-meter i{position:absolute;left:0;top:0;bottom:0;border-radius:3px}",
    ".btcs .btcs-meter::after{content:'';position:absolute;left:50%;top:-2px;bottom:-2px;width:1px;background:#A0AEC0}",
    ".btcs .btcs-wl{display:block;font-size:11px;font-weight:400;color:var(--muted)}",
    // ヒートマップ
    ".btcs .btcs-heat{border-spacing:2px}",
    ".btcs .btcs-heat th,.btcs .btcs-heat td{padding:7px 4px;font-size:13px;border-radius:3px}",
    ".btcs .btcs-heat thead th{color:var(--muted);font-weight:500;background:var(--bg)}",
    ".btcs .btcs-heat th.btcs-y{background:var(--bg);color:var(--navy);font-weight:700;min-width:64px;padding-left:8px}",
    ".btcs .btcs-heat tr.btcs-out td{opacity:.28}",
    ".btcs .btcs-heat tr.btcs-out th.btcs-y{color:#A0AEC0;font-weight:500}",
    ".btcs td.btcs-partial{outline:2px dashed var(--gold);outline-offset:-2px}",
    ".btcs td small{display:block;font-size:10px;color:var(--muted);line-height:1}",
    ".btcs td.btcs-annual{font-weight:700}",
    ".btcs .btcs-legend{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin-top:10px;font-size:12px;color:var(--muted)}",
    ".btcs .btcs-ramp{display:inline-flex;align-items:center;gap:6px}",
    ".btcs .btcs-ramp i{display:inline-block;width:120px;height:10px;border-radius:2px;background:linear-gradient(90deg,rgba(192,57,43,.63),rgba(192,57,43,.08) 45%,#fff 50%,rgba(59,130,196,.08) 55%,rgba(59,130,196,.63))}",
    ".btcs .btcs-foot{margin-top:12px;font-size:12px;color:var(--muted)}",
    ".btcs .btcs-tip{position:fixed;pointer-events:none;background:var(--ink);color:#fff;font-size:12px;padding:6px 9px;border-radius:6px;z-index:10;font-variant-numeric:tabular-nums;line-height:1.5}",
    "@media (max-width:600px){.btcs h2{font-size:19px}.btcs .btcs-tile-main{font-size:24px}}"
  ].join("\n");

  function fmt(v, digits) {
    if (v == null || isNaN(v)) return "–";
    return (v > 0 ? "+" : "") + v.toFixed(digits == null ? 2 : digits) + "%";
  }
  function price(v) { return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 2 }); }
  function tint(v, cap) {
    if (v == null || isNaN(v) || v === 0) return "";
    var a = Math.min(Math.abs(v) / (cap || 30), 1) * 0.55 + 0.08;
    return v > 0 ? "rgba(59,130,196," + a.toFixed(3) + ")" : "rgba(192,57,43," + a.toFixed(3) + ")";
  }
  function median(xs) {
    var s = xs.slice().sort(function (a, b) { return a - b; });
    var n = s.length;
    if (!n) return null;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  }
  function mean(xs) { return xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : null; }
  function phaseOf(y) { return ((y - HALVING_BASE) % 4 + 4) % 4; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function build(root, data, lang) {
    // --- データの索引 ---
    var cells = {}; // "YYYY-M" -> 月次レコード
    var maxYear = FIRST_YEAR, partialKey = null;
    data.months.forEach(function (m) {
      var y = +m.month.slice(0, 4), mo = +m.month.slice(5, 7);
      if (y < FIRST_YEAR) return;
      cells[y + "-" + mo] = m;
      if (y > maxYear) maxYear = y;
      if (m.partial) partialKey = y + "-" + mo;
    });
    var years = [];
    for (var y = maxYear; y >= FIRST_YEAR; y--) years.push(y);
    var lastFullYear = cells[maxYear + "-12"] && !cells[maxYear + "-12"].partial ? maxYear : maxYear - 1;
    var nowMo = partialKey ? +partialKey.split("-")[1] : null;

    function annual(y) {
      var jan = cells[y + "-1"], last = null;
      for (var mo = 12; mo >= 1; mo--) { if (cells[y + "-" + mo]) { last = cells[y + "-" + mo]; break; } }
      if (!jan || !last) return null;
      return { v: (last.close / jan.open - 1) * 100, partial: last.partial || last.month.slice(5) !== "12" };
    }

    var state = { start: FIRST_YEAR, end: "latest", phase: "all", lang: lang };
    var presetDefs = [
      { start: FIRST_YEAR, end: "latest", phase: "all" },
      { start: lastFullYear - 3, end: lastFullYear, phase: "all" },
      { start: lastFullYear - 7, end: lastFullYear, phase: "all" },
      { start: FIRST_YEAR, end: "latest", phase: String(phaseOf(maxYear)) }
    ];

    function inRange(y) {
      var end = state.end === "latest" ? maxYear : state.end;
      if (y < state.start || y > end) return false;
      if (state.phase !== "all" && phaseOf(y) !== +state.phase) return false;
      return true;
    }
    function sample(mo) { // mo: 1-12 or "annual"
      var xs = [];
      years.forEach(function (y) {
        if (!inRange(y)) return;
        if (mo === "annual") { var a = annual(y); if (a && !a.partial) xs.push(a.v); return; }
        var c = cells[y + "-" + mo];
        if (c && !c.partial) xs.push(c.return_pct);
      });
      return xs;
    }

    // 言語が変わるたびに骨組みごと描き直す（選択状態は state に保持）
    function shell() {
      var t = I18N[state.lang];
      root.setAttribute("lang", state.lang);
      var langOpts = LANGS.map(function (k) {
        return "<option value='" + k + "'" + (k === state.lang ? " selected" : "") + ">" + I18N[k].name + "</option>";
      }).join("");
      root.innerHTML =
        "<div class='btcs-head'><div><h2>" + esc(t.title) + "</h2><p class='btcs-sub'>" + esc(t.sub) + "</p></div>" +
        "<label class='btcs-lang' for='btcs-lang'><svg viewBox='0 0 24 24' aria-hidden='true'><circle cx='12' cy='12' r='9'/><path d='M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z'/></svg>" +
        "<select id='btcs-lang' aria-label='Language'>" + langOpts + "</select></label></div>" +
        "<div class='btcs-tiles'></div>" +
        "<div class='btcs-controls'>" +
        "<label class='btcs-field' for='btcs-start'>" + esc(t.start) + " <select id='btcs-start'></select></label>" +
        "<label class='btcs-field' for='btcs-end'>" + esc(t.end) + " <select id='btcs-end'></select></label>" +
        "<label class='btcs-field' for='btcs-phase'>" + esc(t.cycle) + " <select id='btcs-phase'></select></label>" +
        "<div class='btcs-btns' role='group'></div></div>" +
        "<div class='btcs-sec'><h3>" + esc(t.statsTitle) + "</h3></div>" +
        "<div class='btcs-scroll btcs-stats-wrap'><table class='btcs-stats'><thead></thead><tbody></tbody></table></div>" +
        "<div class='btcs-sec'><h3>" + esc(t.breakdownTitle) + "</h3></div>" +
        "<div class='btcs-scroll'><table class='btcs-heat'><thead></thead><tbody></tbody></table></div>" +
        "<div class='btcs-legend'><span class='btcs-ramp'>≤ -30% <i></i> ≥ +30%</span>" +
        "<span>" + esc(t.legendPartial) + "</span><span>" + esc(t.legendOut) + "</span></div>" +
        "<p class='btcs-foot'></p>";

      var $ = function (s) { return root.querySelector(s); };
      var startSel = $("#btcs-start"), endSel = $("#btcs-end"), phaseSel = $("#btcs-phase");
      years.slice().reverse().forEach(function (y) { startSel.add(new Option(y + t.yearSuffix, y)); });
      endSel.add(new Option(t.latest, "latest"));
      years.forEach(function (y) { endSel.add(new Option(y + t.yearSuffix, y)); });
      phaseSel.add(new Option(t.allYears, "all"));
      t.phases.forEach(function (p, i) {
        var ex = years.filter(function (y) { return phaseOf(y) === i; }).slice(0, 3).reverse().join(", ");
        phaseSel.add(new Option(p + " (…" + ex + ")", String(i)));
      });
      var btnBox = $(".btcs-btns");
      presetDefs.forEach(function (p, i) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = t.presets[i];
        b.addEventListener("click", function () { state.start = p.start; state.end = p.end; state.phase = p.phase; render(); });
        p.el = b; btnBox.appendChild(b);
      });
      startSel.addEventListener("change", function () { state.start = +startSel.value; render(); });
      endSel.addEventListener("change", function () { state.end = endSel.value === "latest" ? "latest" : +endSel.value; render(); });
      phaseSel.addEventListener("change", function () { state.phase = phaseSel.value; render(); });
      $("#btcs-lang").addEventListener("change", function (e) {
        state.lang = e.target.value;
        try { localStorage.setItem(STORE_KEY, state.lang); } catch (err) {}
        shell();
      });

      var monthHead = t.months.map(function (m, i) {
        return "<th" + (i + 1 === nowMo ? " class='btcs-now'" : "") + ">" + m + "</th>";
      }).join("");
      $(".btcs-stats thead").innerHTML = "<tr><th class='btcs-y'></th>" + monthHead + "<th>" + esc(t.annual) + "</th></tr>";
      $(".btcs-heat thead").innerHTML = "<tr><th class='btcs-y'>" + esc(t.year) + "</th>" +
        t.months.map(function (m) { return "<th>" + m + "</th>"; }).join("") + "<th>" + esc(t.annual) + "</th></tr>";

      var upd = data.updated_utc ? new Date(data.updated_utc) : null;
      var when = upd ? upd.toLocaleString(t.locale, { timeZone: t.tz, year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) + " (" + t.tzLabel + ")" : "–";
      $(".btcs-foot").textContent = tpl(t.foot, { t: when });

      render();
    }

    function render() {
      var t = I18N[state.lang];
      var $ = function (s) { return root.querySelector(s); };
      if (state.end !== "latest" && state.end < state.start) state.end = state.start;
      $("#btcs-start").value = state.start; $("#btcs-end").value = state.end; $("#btcs-phase").value = state.phase;
      presetDefs.forEach(function (p) {
        p.el.setAttribute("aria-pressed", p.start === state.start && p.end === state.end && p.phase === state.phase ? "true" : "false");
      });

      // --- 統計パネル ---
      var cols = []; for (var mo = 1; mo <= 12; mo++) cols.push(mo); cols.push("annual");
      var samples = cols.map(sample);
      var means = samples.map(function (xs) { return mean(xs); });
      var meds = samples.map(function (xs) { return median(xs); });
      // ミニバーの目盛りは月の列だけで決める（年間列は別スケール）
      function capOf(arr) {
        var m = 0; arr.slice(0, 12).forEach(function (v) { if (v != null && Math.abs(v) > m) m = Math.abs(v); });
        return m || 1;
      }
      var capMean = capOf(means), capMed = capOf(meds);
      function divBar(v, cap) {
        if (v == null) return "";
        var w = Math.min(Math.abs(v) / cap, 1) * 50;
        var side = v >= 0 ? "left:50%;background:var(--blue)" : "right:50%;background:var(--red)";
        return "<span class='btcs-bar' aria-hidden='true'><i style='" + side + ";width:" + w.toFixed(1) + "%'></i></span>";
      }
      function td(i, inner) { return "<td" + (cols[i] === nowMo ? " class='btcs-now'" : "") + ">" + inner + "</td>"; }
      function row(label, cls, fn) {
        return "<tr class='" + cls + "'><th class='btcs-y'>" + esc(label) + "</th>" +
          samples.map(function (xs, i) { return td(i, xs.length ? fn(xs, i) : "–"); }).join("") + "</tr>";
      }
      var R = t.rows;
      var stats =
        row(R[0], "btcs-key", function (xs, i) {
          return fmt(means[i]) + (cols[i] === "annual" ? divBar(means[i], Math.max(Math.abs(means[i]), 1)) : divBar(means[i], capMean));
        }) +
        row(R[1], "btcs-key", function (xs, i) {
          return fmt(meds[i]) + (cols[i] === "annual" ? divBar(meds[i], Math.max(Math.abs(meds[i]), 1)) : divBar(meds[i], capMed));
        }) +
        row(R[2], "btcs-key", function (xs) {
          var w = xs.filter(function (x) { return x > 0; }).length, p = w / xs.length * 100;
          var color = p > 50 ? "var(--blue)" : p < 50 ? "var(--red)" : "#A0AEC0";
          return Math.round(p) + "%<span class='btcs-wl'>" + tpl(t.wl, { w: w, l: xs.length - w }) + "</span>" +
            "<span class='btcs-meter' aria-hidden='true'><i style='width:" + p.toFixed(1) + "%;background:" + color + "'></i></span>";
        }) +
        row(R[3], "", function (xs) { var u = xs.filter(function (x) { return x > 0; }); return fmt(mean(u)); }) +
        row(R[4], "", function (xs) { var d = xs.filter(function (x) { return x <= 0; }); return fmt(mean(d)); }) +
        row(R[5], "btcs-minor", function (xs) { return fmt(Math.max.apply(null, xs)); }) +
        row(R[6], "btcs-minor", function (xs) { return fmt(Math.min.apply(null, xs)); }) +
        row(R[7], "btcs-minor", function (xs) { return "n=" + xs.length; });
      $(".btcs-stats tbody").innerHTML = stats;

      // --- 年別ヒートマップ ---
      var html = "";
      years.forEach(function (y) {
        html += "<tr class='" + (inRange(y) ? "" : "btcs-out") + "'><th class='btcs-y'>" + y + "</th>";
        for (var mo = 1; mo <= 12; mo++) {
          var c = cells[y + "-" + mo];
          if (!c) { html += "<td></td>"; continue; }
          html += "<td" + (c.partial ? " class='btcs-partial'" : "") + " style='background:" + tint(c.return_pct) + "' data-k='" + y + "-" + mo + "'>" +
            fmt(c.return_pct) + (c.partial ? "<small>" + esc(t.prelim) + "</small>" : "") + "</td>";
        }
        var a = annual(y);
        html += a ? "<td class='btcs-annual" + (a.partial ? " btcs-partial" : "") + "' style='background:" + tint(a.v, 100) + "'>" +
          fmt(a.v) + (a.partial ? "<small>" + esc(t.ytd) + "</small>" : "") + "</td>" : "<td></td>";
        html += "</tr>";
      });
      $(".btcs-heat tbody").innerHTML = html;

      // --- 上部カード ---
      var tiles = "";
      if (nowMo) {
        var cur = cells[partialKey], xs = samples[nowMo - 1];
        var rank = xs.filter(function (x) { return x > cur.return_pct; }).length + 1;
        tiles += tile(tpl(t.tileNow, { m: t.months[nowMo - 1], y: partialKey.split("-")[0] }), fmt(cur.return_pct), cur.return_pct,
          xs.length ? tpl(t.tileNowNote, { med: fmt(median(xs)), n: xs.length, rank: rank }) : t.tileNone);
      }
      var nextMo = nowMo ? nowMo % 12 + 1 : 1, nx = samples[nextMo - 1];
      if (nx.length) {
        var wins = nx.filter(function (x) { return x > 0; }).length;
        tiles += tile(tpl(t.tileNext, { m: t.months[nextMo - 1] }), fmt(median(nx)), median(nx),
          tpl(t.tileNextNote, { p: Math.round(wins / nx.length * 100), wl: tpl(t.wl, { w: wins, l: nx.length - wins }), mean: fmt(mean(nx)) }));
      }
      $(".btcs-tiles").innerHTML = tiles;
    }
    function tile(label, main, v, note) {
      return "<div class='btcs-tile'><div class='btcs-tile-label'>" + esc(label) + "</div><div class='btcs-tile-main " +
        (v > 0 ? "up" : v < 0 ? "down" : "") + "'>" + main + "</div><div class='btcs-tile-note'>" + esc(note) + "</div></div>";
    }

    // --- ツールチップ（ヒートマップのセル） ---
    var tip = document.createElement("div"); tip.className = "btcs-tip"; tip.hidden = true;
    root.addEventListener("mousemove", function (e) {
      var td = e.target.closest && e.target.closest("td[data-k]");
      if (!td) { tip.hidden = true; return; }
      var t = I18N[state.lang], c = cells[td.getAttribute("data-k")];
      tip.innerHTML = c.month + (c.partial ? " (" + esc(t.prelim) + ")" : "") + "<br>" + esc(t.open) + " " + price(c.open) + "<br>" +
        esc(c.partial ? t.current : t.close) + " " + price(c.close) + "<br>" + esc(t.ret) + " " + fmt(c.return_pct);
      if (!tip.isConnected) root.appendChild(tip);
      tip.hidden = false;
      tip.style.left = Math.min(e.clientX + 14, window.innerWidth - 190) + "px";
      tip.style.top = e.clientY + 14 + "px";
    });
    root.addEventListener("mouseleave", function () { tip.hidden = true; });

    shell();
  }

  function init() {
    var root = document.getElementById("btc-seasonality");
    if (!root) return;
    root.classList.add("btcs");
    var style = document.createElement("style"); style.textContent = CSS; document.head.appendChild(style);
    var lang = pickLang(root);
    if (window.BTCS_DATA) { build(root, window.BTCS_DATA, lang); return; }
    root.textContent = I18N[lang].loading;
    fetch(DATA_URL).then(function (r) { return r.json(); }).then(function (d) { build(root, d, lang); })
      .catch(function () { root.textContent = I18N[lang].error; });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
