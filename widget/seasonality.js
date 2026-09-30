/* BTC月別騰落率ダッシュボード（cocosta.jp 埋め込み用）
 * 使い方: <div id="btc-seasonality"></div> を置いてこのスクリプトを読み込む。
 * データは window.BTCS_DATA があればそれを、なければ jsDelivr の monthly.json を使う。
 */
(function () {
  var DATA_URL = "https://cdn.jsdelivr.net/gh/guilebot777/btc-data@main/data/monthly.json";
  var FIRST_YEAR = 2013;
  var HALVING_BASE = 2012; // 2012, 2016, 2020, 2024 ...
  var MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  var PHASES = ["半減期の年", "半減期の翌年", "半減期の2年後", "半減期の3年後"];

  var CSS = [
    ".btcs{--navy:#1E3A5F;--blue:#3B82C4;--red:#C0392B;--gold:#D4A849;--ink:#1A1A2E;--muted:#4A5568;--line:#E2E8F0;--soft:#F5F7FA;--bg:#FFFFFF;",
    "font-family:'Noto Sans JP','Hiragino Sans','Yu Gothic',sans-serif;color:var(--ink);background:var(--bg);font-size:14px;line-height:1.5;max-width:1200px;margin:0 auto}",
    ".btcs *{box-sizing:border-box}",
    ".btcs h2{font-size:22px;font-weight:700;color:var(--navy);margin:0 0 4px;text-wrap:balance}",
    ".btcs .btcs-sub{color:var(--muted);font-size:13px;margin:0 0 16px}",
    ".btcs .btcs-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:16px}",
    ".btcs .btcs-tile{background:var(--soft);border-radius:8px;padding:14px 16px}",
    ".btcs .btcs-tile-label{font-size:12px;color:var(--muted);letter-spacing:.04em}",
    ".btcs .btcs-tile-main{font-size:28px;font-weight:800;letter-spacing:.03em;font-variant-numeric:tabular-nums;color:var(--navy)}",
    ".btcs .btcs-tile-main.up{color:var(--blue)}.btcs .btcs-tile-main.down{color:var(--red)}",
    ".btcs .btcs-tile-note{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}",
    ".btcs .btcs-controls{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;margin-bottom:12px}",
    ".btcs .btcs-field{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted)}",
    ".btcs select{font:inherit;font-size:14px;padding:5px 8px;border:1px solid #CBD5E0;border-radius:6px;background:#fff;color:var(--ink)}",
    ".btcs .btcs-btns{display:flex;flex-wrap:wrap;gap:6px}",
    ".btcs button{font:inherit;font-size:13px;padding:5px 12px;border:1px solid var(--blue);border-radius:999px;background:#fff;color:var(--blue);cursor:pointer}",
    ".btcs button[aria-pressed=true]{background:var(--blue);color:#fff}",
    ".btcs button:focus-visible,.btcs select:focus-visible{outline:2px solid var(--gold);outline-offset:2px}",
    ".btcs .btcs-scroll{overflow-x:auto;border:1px solid var(--line);border-radius:8px}",
    ".btcs table{border-collapse:separate;border-spacing:2px;width:100%;min-width:980px;font-variant-numeric:tabular-nums}",
    ".btcs th,.btcs td{padding:7px 4px;text-align:center;font-size:13px;white-space:nowrap;border-radius:3px}",
    ".btcs thead th{color:var(--muted);font-weight:500;background:var(--bg)}",
    ".btcs th.btcs-y{position:sticky;left:0;background:var(--bg);color:var(--navy);font-weight:700;z-index:1;min-width:64px}",
    ".btcs tr.btcs-out td{opacity:.28}",
    ".btcs tr.btcs-out th.btcs-y{color:#A0AEC0;font-weight:500}",
    ".btcs td.btcs-partial{outline:2px dashed var(--gold);outline-offset:-2px}",
    ".btcs td.btcs-partial small{display:block;font-size:10px;color:var(--muted);line-height:1}",
    ".btcs td.btcs-annual{font-weight:700}",
    ".btcs tbody.btcs-stats th.btcs-y{font-weight:500;color:var(--muted);font-size:12px}",
    ".btcs tbody.btcs-stats tr:first-child th,.btcs tbody.btcs-stats tr:first-child td{border-top:2px solid var(--navy)}",
    ".btcs tbody.btcs-stats td{background:var(--soft)}",
    ".btcs td.btcs-now{box-shadow:inset 0 0 0 2px var(--gold)}",
    ".btcs .btcs-legend{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin-top:10px;font-size:12px;color:var(--muted)}",
    ".btcs .btcs-ramp{display:inline-flex;align-items:center;gap:6px}",
    ".btcs .btcs-ramp i{display:inline-block;width:120px;height:10px;border-radius:2px;background:linear-gradient(90deg,rgba(192,57,43,.63),rgba(192,57,43,.08) 45%,#fff 50%,rgba(59,130,196,.08) 55%,rgba(59,130,196,.63))}",
    ".btcs .btcs-foot{margin-top:12px;font-size:12px;color:var(--muted)}",
    ".btcs .btcs-tip{position:fixed;pointer-events:none;background:var(--ink);color:#fff;font-size:12px;padding:6px 9px;border-radius:6px;z-index:10;font-variant-numeric:tabular-nums;line-height:1.5}",
    "@media (max-width:600px){.btcs h2{font-size:19px}.btcs .btcs-tile-main{font-size:24px}}"
  ].join("\n");

  function fmt(v, digits) {
    if (v == null || isNaN(v)) return "–";
    var s = v.toFixed(digits == null ? 2 : digits);
    return (v > 0 ? "+" : "") + s + "%";
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

  function build(root, data) {
    // --- index data ---
    var cells = {}; // "YYYY-M" -> month record
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
    // 最後に確定した年（12月まで確定）
    var lastFullYear = cells[maxYear + "-12"] && !cells[maxYear + "-12"].partial ? maxYear : maxYear - 1;

    function annual(y) {
      var jan = cells[y + "-1"], last = null, partial = false;
      for (var mo = 12; mo >= 1; mo--) { if (cells[y + "-" + mo]) { last = cells[y + "-" + mo]; break; } }
      if (!jan || !last) return null;
      partial = last.partial || last.month.slice(5) !== "12";
      return { v: (last.close / jan.open - 1) * 100, partial: partial };
    }

    var state = { start: FIRST_YEAR, end: "latest", phase: "all" };

    root.innerHTML =
      '<h2>ビットコイン月別騰落率</h2>' +
      '<p class="btcs-sub">集計する期間とサイクルを選ぶと、平均・中央値・勝率がその条件で再計算されます。</p>' +
      '<div class="btcs-tiles"></div>' +
      '<div class="btcs-controls">' +
      '<label class="btcs-field" for="btcs-start">開始年 <select id="btcs-start"></select></label>' +
      '<label class="btcs-field" for="btcs-end">終了年 <select id="btcs-end"></select></label>' +
      '<label class="btcs-field" for="btcs-phase">サイクル <select id="btcs-phase"></select></label>' +
      '<div class="btcs-btns" role="group" aria-label="期間プリセット"></div>' +
      '</div>' +
      '<div class="btcs-scroll"><table><thead></thead><tbody class="btcs-years"></tbody><tbody class="btcs-stats"></tbody></table></div>' +
      '<div class="btcs-legend"><span class="btcs-ramp">-30%以下 <i></i> +30%以上</span>' +
      '<span>点線の枠 = 当月（未確定・集計対象外）</span><span>薄い行 = 集計対象外の年</span></div>' +
      '<p class="btcs-foot"></p>';

    var $ = function (s) { return root.querySelector(s); };
    var startSel = $("#btcs-start"), endSel = $("#btcs-end"), phaseSel = $("#btcs-phase");
    years.slice().reverse().forEach(function (y) { startSel.add(new Option(y + "年", y)); });
    endSel.add(new Option("最新（確定分まで）", "latest"));
    years.forEach(function (y) { endSel.add(new Option(y + "年", y)); });
    phaseSel.add(new Option("すべての年", "all"));
    PHASES.forEach(function (p, i) {
      var ex = years.filter(function (y) { return phaseOf(y) === i; }).slice(0, 3).reverse().join("・");
      phaseSel.add(new Option(p + "（" + ex + "…）", String(i)));
    });

    var presets = [
      { label: "全期間", start: FIRST_YEAR, end: "latest", phase: "all" },
      { label: "直近4年", start: lastFullYear - 3, end: lastFullYear, phase: "all" },
      { label: "直近8年", start: lastFullYear - 7, end: lastFullYear, phase: "all" },
      { label: "今年と同じサイクル", start: FIRST_YEAR, end: "latest", phase: String(phaseOf(maxYear)) }
    ];
    var btnBox = $(".btcs-btns");
    presets.forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = p.label;
      b.addEventListener("click", function () { state.start = p.start; state.end = p.end; state.phase = p.phase; render(); });
      p.el = b; btnBox.appendChild(b);
    });
    startSel.addEventListener("change", function () { state.start = +startSel.value; render(); });
    endSel.addEventListener("change", function () { state.end = endSel.value === "latest" ? "latest" : +endSel.value; render(); });
    phaseSel.addEventListener("change", function () { state.phase = phaseSel.value; render(); });

    // head
    var head = "<tr><th class='btcs-y'>年</th>" + MONTHS.map(function (m) { return "<th>" + m + "</th>"; }).join("") + "<th>年間</th></tr>";
    $("thead").innerHTML = head;

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

    var nowMo = partialKey ? +partialKey.split("-")[1] : null;

    function render() {
      if (state.end !== "latest" && state.end < state.start) state.end = state.start;
      startSel.value = state.start; endSel.value = state.end; phaseSel.value = state.phase;
      presets.forEach(function (p) {
        p.el.setAttribute("aria-pressed", p.start === state.start && p.end === state.end && p.phase === state.phase ? "true" : "false");
      });

      // year rows
      var html = "";
      years.forEach(function (y) {
        html += "<tr class='" + (inRange(y) ? "" : "btcs-out") + "'><th class='btcs-y'>" + y + "</th>";
        for (var mo = 1; mo <= 12; mo++) {
          var c = cells[y + "-" + mo];
          if (!c) { html += "<td></td>"; continue; }
          var cls = c.partial ? " class='btcs-partial'" : "";
          html += "<td" + cls + " style='background:" + tint(c.return_pct) + "' data-k='" + y + "-" + mo + "'>" +
            fmt(c.return_pct) + (c.partial ? "<small>暫定</small>" : "") + "</td>";
        }
        var a = annual(y);
        html += a ? "<td class='btcs-annual" + (a.partial ? " btcs-partial" : "") + "' style='background:" + tint(a.v, 100) + "'>" +
          fmt(a.v) + (a.partial ? "<small>年初来</small>" : "") + "</td>" : "<td></td>";
        html += "</tr>";
      });
      $(".btcs-years").innerHTML = html;

      // stats rows
      var cols = []; for (var mo = 1; mo <= 12; mo++) cols.push(mo); cols.push("annual");
      var samples = cols.map(sample);
      function row(label, fn, tintFn) {
        return "<tr><th class='btcs-y'>" + label + "</th>" + samples.map(function (xs, i) {
          var r = xs.length ? fn(xs) : null;
          var txt = r == null ? "–" : r.text;
          var bg = r && tintFn ? tintFn(r.v, cols[i]) : "";
          var now = cols[i] === nowMo ? " class='btcs-now'" : "";
          return "<td" + now + (bg ? " style='background:" + bg + "'" : "") + ">" + txt + "</td>";
        }).join("") + "</tr>";
      }
      var capFor = function (v, col) { return tint(v, col === "annual" ? 100 : 30); };
      var stats =
        row("平均", function (xs) { var v = mean(xs); return { v: v, text: fmt(v) }; }, capFor) +
        row("中央値", function (xs) { var v = median(xs); return { v: v, text: fmt(v) }; }, capFor) +
        row("勝率", function (xs) {
          var w = xs.filter(function (x) { return x > 0; }).length;
          return { v: (w / xs.length - 0.5) * 100, text: Math.round(w / xs.length * 100) + "%<br><small style='color:#4A5568'>" + w + "勝" + (xs.length - w) + "敗</small>" };
        }, function (v) { return tint(v, 50); }) +
        row("上昇時の平均", function (xs) { var u = xs.filter(function (x) { return x > 0; }); return u.length ? { text: fmt(mean(u)) } : null; }) +
        row("下落時の平均", function (xs) { var d = xs.filter(function (x) { return x <= 0; }); return d.length ? { text: fmt(mean(d)) } : null; }) +
        row("最大", function (xs) { return { text: fmt(Math.max.apply(null, xs)) }; }) +
        row("最小", function (xs) { return { text: fmt(Math.min.apply(null, xs)) }; }) +
        row("サンプル数", function (xs) { return { text: "n=" + xs.length }; });
      $(".btcs-stats").innerHTML = stats;

      // tiles: 今月 / 来月
      var tiles = "";
      if (nowMo) {
        var cur = cells[partialKey], xs = samples[nowMo - 1];
        var rank = xs.filter(function (x) { return x > cur.return_pct; }).length + 1;
        tiles += tile(MONTHS[nowMo - 1] + "の途中経過（" + partialKey.split("-")[0] + "年）", fmt(cur.return_pct), cur.return_pct,
          xs.length ? "選択期間の中央値 " + fmt(median(xs)) + " ・ 過去" + xs.length + "回中 上から" + rank + "番目の水準" : "選択期間に比較対象がありません");
      }
      var nextMo = nowMo ? nowMo % 12 + 1 : 1, nx = samples[nextMo - 1];
      if (nx.length) {
        var wins = nx.filter(function (x) { return x > 0; }).length;
        tiles += tile("来月（" + MONTHS[nextMo - 1] + "）の中央値・選択期間", fmt(median(nx)), median(nx),
          "勝率 " + Math.round(wins / nx.length * 100) + "%（" + wins + "勝" + (nx.length - wins) + "敗）・ 平均 " + fmt(mean(nx)));
      }
      $(".btcs-tiles").innerHTML = tiles;
    }
    function tile(label, main, v, note) {
      return "<div class='btcs-tile'><div class='btcs-tile-label'>" + label + "</div><div class='btcs-tile-main " +
        (v > 0 ? "up" : v < 0 ? "down" : "") + "'>" + main + "</div><div class='btcs-tile-note'>" + note + "</div></div>";
    }

    // tooltip
    var tip = document.createElement("div"); tip.className = "btcs-tip"; tip.hidden = true; root.appendChild(tip);
    root.addEventListener("mousemove", function (e) {
      var td = e.target.closest && e.target.closest("td[data-k]");
      if (!td) { tip.hidden = true; return; }
      var c = cells[td.getAttribute("data-k")];
      tip.innerHTML = c.month + (c.partial ? "（暫定）" : "") + "<br>始値 " + price(c.open) + "<br>" + (c.partial ? "現在値 " : "終値 ") + price(c.close) + "<br>騰落率 " + fmt(c.return_pct);
      tip.hidden = false;
      tip.style.left = Math.min(e.clientX + 14, window.innerWidth - 180) + "px";
      tip.style.top = e.clientY + 14 + "px";
    });
    root.addEventListener("mouseleave", function () { tip.hidden = true; });

    var upd = data.updated_utc ? new Date(data.updated_utc) : null;
    $(".btcs-foot").textContent = "データ: Bitstamp BTC/USD 日足（UTC）、騰落率 = 月末終値 ÷ 月初始値 − 1。" +
      (upd ? "最終更新 " + upd.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) + "（日本時間）。" : "") +
      "過去の傾向は将来の値動きを保証するものではありません。";

    render();
  }

  function init() {
    var root = document.getElementById("btc-seasonality");
    if (!root) return;
    root.classList.add("btcs");
    var style = document.createElement("style"); style.textContent = CSS; document.head.appendChild(style);
    if (window.BTCS_DATA) { build(root, window.BTCS_DATA); return; }
    root.textContent = "データを読み込んでいます…";
    fetch(DATA_URL).then(function (r) { return r.json(); }).then(function (d) { build(root, d); })
      .catch(function () { root.textContent = "データを読み込めませんでした。時間をおいて再読み込みしてください。"; });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
