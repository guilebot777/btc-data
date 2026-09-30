/* BTC月別騰落率ダッシュボード（cocosta.jp 埋め込み用）
 * 使い方: <div id="btc-seasonality"></div> を置いてこのスクリプトを読み込む。
 *   言語を固定したい場合は <div id="btc-seasonality" data-lang="en"> のように指定する。
 * データは window.BTCS_DATA があればそれを、なければ jsDelivr の monthly.json を使う。
 */
(function () {
  var DATA_URLS = [
    "https://cdn.jsdelivr.net/gh/guilebot777/btc-data@main/data/monthly.json",
    "https://raw.githubusercontent.com/guilebot777/btc-data/main/data/monthly.json"
  ];
  var FIRST_YEAR = 2013;
  var HALVING_BASE = 2012; // 2012, 2016, 2020, 2024 ...
  var STORE_KEY = "btcs-lang";
  var PAGE_URL = "https://cocosta.jp/tools/btc-monthly-returns/";

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
      hl: "金色の列 = 今月、青の列 = 来月",
      save: "画像で保存", post: "Xでポスト", latestShort: "最新", rangeSep: "〜", cardCond: "集計期間 {range} ・ {cycle}", cardLegend: "棒 = 中央値　下段 = 勝率", asOf: "{d}時点", shareText: "ビットコイン月別騰落率（{range}・{cycle}）",
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
      hl: "Gold column = this month, blue column = next month",
      save: "Save image", post: "Post on X", latestShort: "latest", rangeSep: "–", cardCond: "Period {range} · {cycle}", cardLegend: "Bars = median   Below = win rate", asOf: "as of {d}", shareText: "Bitcoin monthly returns ({range}, {cycle})",
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
      hl: "金色列 = 本月，蓝色列 = 下月",
      save: "保存图片", post: "分享到X", latestShort: "最新", rangeSep: "–", cardCond: "统计期间 {range} · {cycle}", cardLegend: "柱 = 中位数　下方 = 胜率", asOf: "截至{d}", shareText: "比特币月度涨跌幅（{range}・{cycle}）",
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
      hl: "金色欄 = 本月，藍色欄 = 下個月",
      save: "儲存圖片", post: "分享到X", latestShort: "最新", rangeSep: "–", cardCond: "統計期間 {range} · {cycle}", cardLegend: "長條 = 中位數　下方 = 勝率", asOf: "截至{d}", shareText: "比特幣月度漲跌幅（{range}・{cycle}）",
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
      hl: "금색 열 = 이번 달, 파란색 열 = 다음 달",
      save: "이미지 저장", post: "X에 공유", latestShort: "최신", rangeSep: "–", cardCond: "집계 기간 {range} · {cycle}", cardLegend: "막대 = 중앙값   아래 = 승률", asOf: "{d} 기준", shareText: "비트코인 월별 수익률 ({range}, {cycle})",
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
      hl: "Columna dorada = este mes, columna azul = próximo mes",
      save: "Guardar imagen", post: "Publicar en X", latestShort: "último", rangeSep: "–", cardCond: "Periodo {range} · {cycle}", cardLegend: "Barras = mediana   Abajo = meses al alza", asOf: "a {d}", shareText: "Rentabilidad mensual de Bitcoin ({range}, {cycle})",
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
  var COLS = "<colgroup><col class='btcs-cy'>" + new Array(13).join("<col>") + "<col class='btcs-ca'></colgroup>";
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
    // 読みやすさ優先: UDフォント、本文17px、濃い文字色（純黒は避ける）、薄いグレー文字は使わない
    ".btcs{--navy:#1E3A5F;--blue:#2F6FAE;--red:#B03A2E;--gold:#C9982F;--ink:#1F2933;--muted:#3E4C59;--line:#D5DCE4;--soft:#F3F5F8;--bg:#FFFFFF;",
    "--ui:'BIZ UDPGothic','Noto Sans JP','Hiragino Sans','Yu Gothic','PingFang SC','Microsoft YaHei','Malgun Gothic',sans-serif;",
    "--num:var(--ui);",
    "font-family:var(--ui);color:var(--ink);background:var(--bg);font-size:17px;line-height:1.6;max-width:1400px;margin:0 auto}",
    ".btcs *{box-sizing:border-box}",
    ".btcs .btcs-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:10px 20px;margin-bottom:20px}",
    ".btcs .btcs-head>div{min-width:0;flex:1 1 320px}",
    ".btcs .btcs-brand{display:inline-block;font-size:15px;font-weight:700;color:var(--navy);letter-spacing:.08em;margin:0 0 14px;text-decoration:none}",
    ".btcs .btcs-brand:hover{text-decoration:underline}",
    ".btcs h1{font-size:clamp(28px,4vw,38px);line-height:1.3;font-weight:700;color:var(--navy);margin:0 0 10px;text-wrap:balance}",
    ".btcs h2{font-size:26px;font-weight:700;color:var(--navy);margin:0 0 6px;text-wrap:balance}",
    ".btcs h3{font-size:20px;font-weight:700;color:var(--navy);margin:0}",
    ".btcs .btcs-sub{color:var(--muted);font-size:17px;margin:0}",
    ".btcs .btcs-lang{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:16px}",
    ".btcs .btcs-lang svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.6}",
    ".btcs .btcs-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-bottom:20px}",
    ".btcs .btcs-tile{background:var(--soft);border-radius:8px;padding:18px 20px}",
    ".btcs .btcs-tile-label{font-size:16px;color:var(--muted);font-weight:700}",
    ".btcs .btcs-tile-main{font-family:var(--num);font-size:36px;font-weight:700;color:var(--navy);line-height:1.3;margin:2px 0}",
    ".btcs .btcs-tile-main.up{color:var(--blue)}.btcs .btcs-tile-main.down{color:var(--red)}",
    ".btcs .btcs-tile-note{font-size:16px;color:var(--ink)}",
    ".btcs .btcs-controls{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;margin-bottom:24px}",
    ".btcs .btcs-field{display:flex;flex-wrap:wrap;max-width:100%;min-width:0;align-items:center;gap:8px;font-size:16px;color:var(--ink);font-weight:700}",
    ".btcs select{font:inherit;font-weight:400;font-size:17px;min-height:44px;padding:6px 10px;border:1.5px solid #9AA5B1;border-radius:6px;background:#fff;color:var(--ink);max-width:100%}",
    ".btcs .btcs-btns{display:flex;flex-wrap:wrap;gap:8px}",
    ".btcs button{font:inherit;font-size:16px;font-weight:700;min-height:44px;padding:6px 18px;border:1.5px solid var(--blue);border-radius:999px;background:#fff;color:var(--blue);cursor:pointer}",
    ".btcs button[aria-pressed=true]{background:var(--blue);color:#fff}",
    ".btcs button:focus-visible,.btcs select:focus-visible{outline:3px solid var(--gold);outline-offset:2px}",
    ".btcs .btcs-sec{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px;margin:0 0 10px}",
    ".btcs .btcs-hl{font-size:15px;color:var(--muted)}",
    ".btcs .btcs-acts{margin-left:auto;display:flex;flex-wrap:wrap;gap:8px}",
    ".btcs .btcs-acts button,.btcs .btcs-acts a{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:15px;font-weight:700;min-height:40px;padding:6px 14px;border-radius:6px;cursor:pointer;text-decoration:none}",
    ".btcs .btcs-acts button{background:var(--navy);color:#fff;border:1.5px solid var(--navy)}",
    ".btcs .btcs-acts a{background:#fff;color:var(--ink);border:1.5px solid #9AA5B1}",
    ".btcs .btcs-acts svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2}",
    ".btcs .btcs-acts a:focus-visible{outline:3px solid var(--gold);outline-offset:2px}",
    ".btcs .btcs-hl b{display:inline-block;width:14px;height:14px;border-radius:3px;vertical-align:-2px;margin:0 4px 0 0}",
    // 2つの表は同じ列幅（固定レイアウト + 同じ最小幅 + 同じ枠）で縦に揃える
    ".btcs .btcs-scroll{overflow-x:auto;border:1px solid transparent;border-radius:8px}",
    ".btcs table{table-layout:fixed;border-collapse:separate;border-spacing:2px;width:100%;min-width:1100px;font-variant-numeric:tabular-nums}",
    ".btcs col.btcs-cy{width:112px}",
    ".btcs col.btcs-ca{width:96px}",
    ".btcs th,.btcs td{text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".btcs th.btcs-y{position:sticky;left:0;z-index:1;text-align:left;white-space:normal}",
    ".btcs td{font-family:var(--num)}",
    // 統計パネル: 紺の見出し帯 + 白地 + ミニバー
    ".btcs .btcs-stats-wrap{border-color:var(--navy);margin-bottom:36px}",
    ".btcs .btcs-stats thead th{background:var(--navy);color:#fff;font-weight:700;font-size:16px;padding:10px 4px;border-radius:3px}",
    ".btcs .btcs-stats thead th.btcs-y{padding-left:12px}",
    ".btcs .btcs-stats tbody th.btcs-y{background:#fff;color:var(--navy);font-weight:700;font-size:15px;padding:10px 8px;line-height:1.3}",
    ".btcs .btcs-stats tbody td{background:#fff;font-size:16px;padding:10px 2px;box-shadow:0 -1px 0 var(--line)}",
    ".btcs .btcs-stats tbody tr.btcs-key td{font-weight:700;font-size:17px}",
    ".btcs .btcs-stats tbody tr.btcs-minor td,.btcs .btcs-stats tbody tr.btcs-minor th{font-size:15px;font-weight:400;color:var(--muted)}",
    ".btcs .btcs-stats td.btcs-now{background:#FFF6E0}",
    ".btcs .btcs-stats thead th.btcs-now{box-shadow:inset 0 -4px 0 var(--gold)}",
    ".btcs .btcs-stats td.btcs-next{background:#EAF2FA}",
    ".btcs .btcs-stats thead th.btcs-next{box-shadow:inset 0 -4px 0 #7FB2E0}",
    ".btcs .btcs-bar,.btcs .btcs-meter{display:block;position:relative;height:7px;margin:7px auto 0;width:84%;background:#E4E9EF;border-radius:4px}",
    ".btcs .btcs-bar::after,.btcs .btcs-meter::after{content:'';position:absolute;left:50%;top:-3px;bottom:-3px;width:2px;background:#7B8794}",
    ".btcs .btcs-bar i,.btcs .btcs-meter i{position:absolute;top:0;bottom:0;border-radius:4px}",
    ".btcs .btcs-meter i{left:0}",
    ".btcs .btcs-wl{display:block;font-family:var(--ui);font-size:14px;font-weight:400;color:var(--muted)}",
    // ヒートマップ
    ".btcs .btcs-heat th,.btcs .btcs-heat td{padding:9px 2px;font-size:16px;border-radius:3px}",
    ".btcs .btcs-heat thead th{color:var(--ink);font-weight:700;background:var(--bg)}",
    ".btcs .btcs-heat th.btcs-y{background:var(--bg);color:var(--navy);font-weight:700;padding-left:12px}",
    ".btcs .btcs-heat tr.btcs-out td{opacity:.4}",
    ".btcs .btcs-heat tr.btcs-out th.btcs-y{color:#7B8794;font-weight:400}",
    ".btcs td.btcs-partial{outline:2px dashed var(--gold);outline-offset:-2px}",
    ".btcs td small{display:block;font-family:var(--ui);font-size:12px;color:var(--muted);line-height:1.1}",
    ".btcs td.btcs-annual{font-weight:700}",
    ".btcs .btcs-legend{display:flex;flex-wrap:wrap;align-items:center;gap:8px 20px;margin-top:12px;font-size:15px;color:var(--muted)}",
    ".btcs .btcs-ramp{display:inline-flex;align-items:center;gap:8px}",
    ".btcs .btcs-ramp i{display:inline-block;width:140px;height:12px;border-radius:2px;background:linear-gradient(90deg,rgba(176,58,46,.63),rgba(176,58,46,.08) 45%,#fff 50%,rgba(47,111,174,.08) 55%,rgba(47,111,174,.63))}",
    ".btcs .btcs-foot{margin-top:14px;font-size:15px;color:var(--muted)}",
    ".btcs .btcs-tip{position:fixed;pointer-events:none;background:var(--ink);color:#fff;font-size:15px;padding:8px 11px;border-radius:6px;z-index:10;line-height:1.5}",
    "@media (max-width:600px){.btcs h1{font-size:28px}.btcs h2{font-size:22px}.btcs .btcs-tile-main{font-size:30px}.btcs col.btcs-cy{width:104px}}"
  ].join("\n");

  function fmt(v, digits) {
    if (v == null || isNaN(v)) return "–";
    // 読みやすさ優先で小数1桁。100%以上は整数にして列幅に収める（+186.76% → +187%）
    if (digits == null) digits = Math.abs(v) >= 100 ? 0 : 1;
    return (v > 0 ? "+" : "") + v.toFixed(digits) + "%";
  }
  function price(v) { return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 2 }); }
  function tint(v, cap) {
    if (v == null || isNaN(v) || v === 0) return "";
    var a = Math.min(Math.abs(v) / (cap || 30), 1) * 0.55 + 0.08;
    return v > 0 ? "rgba(47,111,174," + a.toFixed(3) + ")" : "rgba(176,58,46," + a.toFixed(3) + ")";
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
    var nextMoCol = nowMo ? nowMo % 12 + 1 : null;
    function hlClass(col) { return col === nowMo ? " class='btcs-now'" : col === nextMoCol ? " class='btcs-next'" : ""; }

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
      var asPage = root.hasAttribute("data-page"), hTag = asPage ? "h1" : "h2";
      root.innerHTML =
        "<div class='btcs-head'><div>" + (asPage ? "<a class='btcs-brand' href='https://cocosta.jp/'>COCOSTA</a>" : "") +
        "<" + hTag + ">" + esc(t.title) + "</" + hTag + "><p class='btcs-sub'>" + esc(t.sub) + "</p></div>" +
        "<label class='btcs-lang' for='btcs-lang'><svg viewBox='0 0 24 24' aria-hidden='true'><circle cx='12' cy='12' r='9'/><path d='M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z'/></svg>" +
        "<select id='btcs-lang' aria-label='Language'>" + langOpts + "</select></label></div>" +
        "<div class='btcs-tiles'></div>" +
        "<div class='btcs-controls'>" +
        "<label class='btcs-field' for='btcs-start'>" + esc(t.start) + " <select id='btcs-start'></select></label>" +
        "<label class='btcs-field' for='btcs-end'>" + esc(t.end) + " <select id='btcs-end'></select></label>" +
        "<label class='btcs-field' for='btcs-phase'>" + esc(t.cycle) + " <select id='btcs-phase'></select></label>" +
        "<div class='btcs-btns' role='group'></div></div>" +
        "<div class='btcs-sec'><h3>" + esc(t.statsTitle) + "</h3>" +
        (nowMo ? "<span class='btcs-hl'><b style='background:#FFF6E0;box-shadow:inset 0 -3px 0 var(--gold)'></b><b style='background:#EAF2FA;box-shadow:inset 0 -3px 0 #7FB2E0'></b>" + esc(t.hl) + "</span>" : "") +
        "<span class='btcs-acts'><button type='button' class='btcs-save'><svg viewBox='0 0 24 24' aria-hidden='true'><path d='M12 4v11m0 0l-4-4m4 4l4-4M5 19h14'/></svg>" + esc(t.save) + "</button>" +
        "<a class='btcs-post' target='_blank' rel='noopener'><svg viewBox='0 0 24 24' aria-hidden='true'><path d='M4 4l16 16M20 4L4 20' /></svg>" + esc(t.post) + "</a></span>" + "</div>" +
        "<div class='btcs-scroll btcs-stats-wrap'><table class='btcs-stats'>" + COLS + "<thead></thead><tbody></tbody></table></div>" +
        "<div class='btcs-sec'><h3>" + esc(t.breakdownTitle) + "</h3></div>" +
        "<div class='btcs-scroll btcs-heat-wrap'><table class='btcs-heat'>" + COLS + "<thead></thead><tbody></tbody></table></div>" +
        "<div class='btcs-legend'><span class='btcs-ramp'>≤ -30% <i></i> ≥ +30%</span>" +
        "<span>" + esc(t.legendPartial) + "</span><span>" + esc(t.legendOut) + "</span></div>" +
        "<p class='btcs-foot'></p>";

      var $ = function (s) { return root.querySelector(s); };
      var startSel = $("#btcs-start"), endSel = $("#btcs-end"), phaseSel = $("#btcs-phase");
      years.forEach(function (y) { startSel.add(new Option(y + t.yearSuffix, y)); });
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
      // 横スクロール時も2つの表の列がずれないよう、スクロール位置を同期する
      var sw = $(".btcs-stats-wrap"), hw = $(".btcs-heat-wrap"), syncing = false;
      [[sw, hw], [hw, sw]].forEach(function (pair) {
        pair[0].addEventListener("scroll", function () {
          if (syncing) return; syncing = true; pair[1].scrollLeft = pair[0].scrollLeft;
          requestAnimationFrame(function () { syncing = false; });
        });
      });
      $("#btcs-lang").addEventListener("change", function (e) {
        state.lang = e.target.value;
        try { localStorage.setItem(STORE_KEY, state.lang); } catch (err) {}
        shell();
      });

      var monthHead = t.months.map(function (m, i) {
        return "<th" + hlClass(i + 1) + ">" + m + "</th>";
      }).join("");
      $(".btcs-stats thead").innerHTML = "<tr><th class='btcs-y'></th>" + monthHead + "<th>" + esc(t.annual) + "</th></tr>";
      $(".btcs-heat thead").innerHTML = "<tr><th class='btcs-y'>" + esc(t.year) + "</th>" +
        t.months.map(function (m) { return "<th>" + m + "</th>"; }).join("") + "<th>" + esc(t.annual) + "</th></tr>";

      var upd = data.updated_utc ? new Date(data.updated_utc) : null;
      var when = upd ? upd.toLocaleString(t.locale, { timeZone: t.tz, year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) + " (" + t.tzLabel + ")" : "–";
      $(".btcs-foot").textContent = tpl(t.foot, { t: when });

      render();
      try { root.dispatchEvent(new CustomEvent("btcs:lang", { bubbles: true, detail: { lang: state.lang } })); } catch (e) {}
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
      lastSamples = samples;
      updatePostLink();
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
      function td(i, inner) { return "<td" + hlClass(cols[i]) + ">" + inner + "</td>"; }
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


    // ---------- X向けの画像カード ----------
    var lastSamples = null;
    function condParts() {
      var t = I18N[state.lang];
      var range = state.start + t.yearSuffix + t.rangeSep + (state.end === "latest" ? t.latestShort : state.end + t.yearSuffix);
      var cycle = state.phase === "all" ? t.allYears : t.phases[+state.phase];
      return { range: range, cycle: cycle };
    }
    function updatePostLink() {
      var a = root.querySelector(".btcs-post");
      if (!a) return;
      var t = I18N[state.lang];
      a.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(tpl(t.shareText, condParts())) + "&url=" + encodeURIComponent(PAGE_URL);
    }
    function drawCard() {
      var t = I18N[state.lang], W = 1200, H = 675, S = 2;
      var cv = document.createElement("canvas"); cv.width = W * S; cv.height = H * S;
      var c = cv.getContext("2d"); c.scale(S, S);
      var F = "'BIZ UDPGothic','Noto Sans JP','Hiragino Sans','Yu Gothic','PingFang SC','Malgun Gothic',sans-serif";
      var NAVY = "#1E3A5F", INK = "#1F2933", MUTED = "#3E4C59", BLUE = "#2F6FAE", RED = "#B03A2E", GOLD = "#C9982F";
      function text(str, x, y, size, color, weight, align) {
        c.font = (weight || 400) + " " + size + "px " + F; c.fillStyle = color; c.textAlign = align || "left"; c.fillText(str, x, y);
      }
      c.fillStyle = "#FFFFFF"; c.fillRect(0, 0, W, H);
      c.fillStyle = NAVY; c.fillRect(0, 0, W, 10);
      var cond = condParts();
      text("COCOSTA", 56, 60, 18, NAVY, 700);
      text(t.title, 56, 112, 40, NAVY, 700);
      text(tpl(t.cardCond, cond), 56, 152, 22, INK, 400);
      text(t.cardLegend, 1144, 152, 18, MUTED, 400, "right");

      var x0 = 56, colW = 1088 / 12, zeroY = 340, half = 105;
      var meds = lastSamples.slice(0, 12).map(function (xs) { return median(xs); });
      var wins = lastSamples.slice(0, 12).map(function (xs) {
        return xs.length ? { p: xs.filter(function (x) { return x > 0; }).length / xs.length, w: xs.filter(function (x) { return x > 0; }).length, n: xs.length } : null;
      });
      var cap = Math.max(5, Math.max.apply(null, meds.map(function (v) { return v == null ? 0 : Math.abs(v); })));
      var nextMo = nowMo ? nowMo % 12 + 1 : null;
      for (var i = 0; i < 12; i++) {
        var cx = x0 + colW * i + colW / 2, mo = i + 1;
        if (mo === nowMo || mo === nextMo) {
          c.fillStyle = mo === nowMo ? "#FFF6E0" : "#EAF2FA"; c.fillRect(x0 + colW * i + 3, 180, colW - 6, 410);
          c.fillStyle = mo === nowMo ? GOLD : "#7FB2E0"; c.fillRect(x0 + colW * i + 3, 180, colW - 6, 4);
        }
      }
      c.fillStyle = "#7B8794"; c.fillRect(x0, zeroY, 1088, 1.5);
      for (i = 0; i < 12; i++) {
        cx = x0 + colW * i + colW / 2;
        var v = meds[i];
        if (v != null) {
          var h = Math.max(Math.abs(v) / cap * half, 2), y = v >= 0 ? zeroY - h : zeroY + 1.5;
          c.fillStyle = v >= 0 ? BLUE : RED;
          c.beginPath();
          if (c.roundRect) c.roundRect(cx - 22, y, 44, h, v >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4]); else c.rect(cx - 22, y, 44, h);
          c.fill();
          text(fmt(v), cx, v >= 0 ? y - 10 : y + h + 26, 20, INK, 700, "center");
        } else {
          text("–", cx, zeroY - 10, 20, MUTED, 700, "center");
        }
        text(t.months[i], cx, 522, 20, NAVY, 700, "center");
        var wr = wins[i];
        text(wr ? Math.round(wr.p * 100) + "%" : "–", cx, 556, 22, wr && wr.p > 0.5 ? BLUE : wr && wr.p < 0.5 ? RED : INK, 700, "center");
        if (wr) text(tpl(t.wl, { w: wr.w, l: wr.n - wr.w }), cx, 580, 15, MUTED, 400, "center");
      }
      c.fillStyle = "#D5DCE4"; c.fillRect(56, 612, 1088, 1);
      var upd = data.updated_utc ? new Date(data.updated_utc) : new Date();
      var d = upd.toLocaleDateString(t.locale, { timeZone: t.tz, year: "numeric", month: "short", day: "numeric" });
      text("Bitstamp BTC/USD (UTC) · " + tpl(t.asOf, { d: d }), 56, 648, 16, MUTED, 400);
      text(PAGE_URL.replace(/^https:\/\//, "").replace(/\/$/, ""), 1144, 648, 18, NAVY, 700, "right");
      return cv;
    }
    function saveCard(btn) {
      var t = I18N[state.lang];
      var chars = t.title + t.cardLegend + tpl(t.cardCond, condParts()) + t.months.join("") + "COCOSTA0123456789+-–%.·" + t.wl + t.asOf;
      var fontReady = document.fonts && document.fonts.load
        ? Promise.all([document.fonts.load("700 20px 'BIZ UDPGothic'", chars), document.fonts.load("400 20px 'BIZ UDPGothic'", chars)]).catch(function () {})
        : Promise.resolve();
      btn.disabled = true;
      fontReady.then(function () {
        drawCard().toBlob(function (blob) {
          btn.disabled = false;
          if (!blob) return;
          var name = "btc-monthly-returns-" + state.start + "-" + state.end + (state.phase === "all" ? "" : "-cycle" + state.phase) + ".png";
          var file = null;
          try { file = new File([blob], name, { type: "image/png" }); } catch (e) {}
          var touch = window.matchMedia && window.matchMedia("(pointer:coarse)").matches;
          // スマホは共有シート（Xアプリや写真に保存）、PCはダウンロード
          if (touch && file && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], text: tpl(t.shareText, condParts()) + " " + PAGE_URL }).catch(function () {});
            return;
          }
          var url = URL.createObjectURL(blob), a = document.createElement("a");
          a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        }, "image/png");
      });
    }
    root.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest(".btcs-save");
      if (b) saveCard(b);
    });

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
    // jsDelivr が落ちていたら GitHub から直接読む
    (function load(i) {
      fetch(DATA_URLS[i]).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { build(root, d, lang); })
        .catch(function () { if (i + 1 < DATA_URLS.length) load(i + 1); else root.textContent = I18N[lang].error; });
    })(0);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
