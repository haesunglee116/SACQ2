/* SACQ project page charts. Plain SVG, no dependencies.
   Data comes from js/data.js (generated from data/paper_tables.json).
   Every value drawn here is also present in the page tables. */
(function () {
  "use strict";
  if (!window.SACQ_DATA) return;
  var DATA = window.SACQ_DATA;
  var NS = "http://www.w3.org/2000/svg";

  // Series identity: color, marker, and dash follow the entity in every chart.
  // Three hues (red, blue, orange) are validated for all-pairs separation; the
  // two context baselines (HQQ, TWLA) are neutral gray and carry their own
  // marker shape plus a direct label, so identity never rests on hue alone.
  var SERIES = {
    sacq:      { label: "SACQ",            color: "var(--series-sacq)",     marker: "circle",   dash: "",      emphasis: true },
    aqlm:      { label: "AQLM",            color: "var(--series-aqlm)",     marker: "pentagon", dash: "5 4" },
    actquant:  { label: "ActQuant",        color: "var(--series-actquant)", marker: "square",   dash: "7 5" },
    gptq:      { label: "GPTQ",            color: "var(--series-gptq)",     marker: "triangle", dash: "8 4 2 4" },
    hqq:       { label: "HQQ",             color: "var(--series-hqq)",      marker: "tridown",  dash: "2 4",   context: true },
    twla:      { label: "TWLA",            color: "var(--series-twla)",     marker: "diamond",  dash: "",      context: true },
    structure: { label: "Structure-aware", color: "var(--series-sacq)",     marker: "circle",   dash: "",      emphasis: true },
    local:     { label: "Layer-local",     color: "var(--series-local)",    marker: "square",   dash: "7 5" },
    euclid:    { label: "Euclidean",       color: "var(--series-euclid)",   marker: "triangle", dash: "2 4" }
  };

  function el(name, attrs, parent) {
    var node = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) if (attrs[k] != null) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }
  function text(parent, x, y, str, attrs) {
    var t = el("text", Object.assign({ x: x, y: y }, attrs || {}), parent);
    t.textContent = str;
    return t;
  }
  function linear(domain, range) {
    var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    var f = function (v) { return r0 + (v - d0) / (d1 - d0) * (r1 - r0); };
    f.invert = function (p) { return d0 + (p - r0) / (r1 - r0) * (d1 - d0); };
    return f;
  }
  function markerPath(kind, cx, cy, r) {
    switch (kind) {
      case "square": return "M" + (cx - r) + " " + (cy - r) + "h" + 2 * r + "v" + 2 * r + "h" + (-2 * r) + "Z";
      case "triangle": return "M" + cx + " " + (cy - r * 1.15) + "L" + (cx + r * 1.15) + " " + (cy + r * 0.85) + "L" + (cx - r * 1.15) + " " + (cy + r * 0.85) + "Z";
      case "tridown": return "M" + cx + " " + (cy + r * 1.15) + "L" + (cx + r * 1.15) + " " + (cy - r * 0.85) + "L" + (cx - r * 1.15) + " " + (cy - r * 0.85) + "Z";
      case "diamond": return "M" + cx + " " + (cy - r * 1.3) + "L" + (cx + r * 1.3) + " " + cy + "L" + cx + " " + (cy + r * 1.3) + "L" + (cx - r * 1.3) + " " + cy + "Z";
      case "pentagon": {
        var R = r * 1.2, pts = [];
        for (var k = 0; k < 5; k++) { var a = -Math.PI / 2 + k * 2 * Math.PI / 5; pts.push((cx + R * Math.cos(a)) + " " + (cy + R * Math.sin(a))); }
        return "M" + pts.join("L") + "Z";
      }
      default: return null;
    }
  }
  function drawMarker(parent, kind, cx, cy, r, color, cls) {
    var path = markerPath(kind, cx, cy, r);
    if (path) return el("path", { d: path, fill: color, "class": cls }, parent);
    return el("circle", { cx: cx, cy: cy, r: r, fill: color, "class": cls }, parent);
  }

  // ── Tooltip (one shared element, values lead, labels follow) ──
  var tip = document.getElementById("chart-tooltip");
  function showTip(title, rows, clientX, clientY) {
    if (!tip) return;
    while (tip.firstChild) tip.removeChild(tip.firstChild);
    if (title) {
      var t = document.createElement("div"); t.className = "tt-title"; t.textContent = title; tip.appendChild(t);
    }
    rows.forEach(function (r) {
      var row = document.createElement("div"); row.className = "tt-row";
      var key = document.createElement("span"); key.className = "tt-key";
      if (r.color) { var sw = document.createElement("span"); sw.className = "tt-swatch"; sw.style.background = r.color; key.appendChild(sw); }
      key.appendChild(document.createTextNode(r.label));
      var val = document.createElement("span"); val.className = "tt-value"; val.textContent = r.value;
      row.appendChild(key); row.appendChild(val); tip.appendChild(row);
    });
    tip.hidden = false;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var x = clientX + 14, y = clientY - h - 10;
    if (x + w > window.innerWidth - 8) x = clientX - w - 14;
    if (y < 8) y = clientY + 16;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip() { if (tip) tip.hidden = true; }
  function rectCenter(node) { var b = node.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }

  function legend(container, items) {
    var old = container.parentNode.querySelector(".chart-legend");
    if (old) old.parentNode.removeChild(old);
    var ul = document.createElement("ul"); ul.className = "chart-legend";
    items.forEach(function (it) {
      var li = document.createElement("li");
      var svg = el("svg", { viewBox: "0 0 26 12", "aria-hidden": "true" });
      if (it.ref) {
        el("line", { x1: 1, y1: 6, x2: 25, y2: 6, "class": "legend-ref" }, svg);
      } else if (it.bar) {
        el("rect", { x: 1, y: 2, width: 24, height: 8, rx: 2, fill: it.color }, svg);
      } else {
        el("line", { x1: 1, y1: 6, x2: 25, y2: 6, stroke: it.color, "stroke-dasharray": it.dash || null, "class": "legend-line" }, svg);
        drawMarker(svg, it.marker, 13, 6, 3.5, it.color, "legend-marker");
      }
      li.appendChild(svg);
      li.appendChild(document.createTextNode(it.label));
      ul.appendChild(li);
    });
    container.parentNode.insertBefore(ul, container.nextSibling);
  }

  // ── Figure 1(a): success vs nominal bpw ──────────────────────
  function renderSuccess(container) {
    var width = Math.max(300, container.clientWidth);
    var height = Math.round(Math.min(380, Math.max(250, width * 0.66)));
    var m = { top: 22, right: 18, bottom: 46, left: 50 };
    var innerW = width - m.left - m.right, innerH = height - m.top - m.bottom;
    var x = linear([0.85, 3.15], [m.left, m.left + innerW]);
    var y = linear([0, 100], [m.top + innerH, m.top]);
    container.innerHTML = "";
    var svg = el("svg", { viewBox: "0 0 " + width + " " + height, width: width, height: height }, container);

    var grid = el("g", { "class": "grid" }, svg);
    [20, 40, 60, 80, 100].forEach(function (v) { el("line", { x1: m.left, x2: m.left + innerW, y1: y(v), y2: y(v) }, grid); });
    var axis = el("g", { "class": "axis" }, svg);
    el("line", { x1: m.left, x2: m.left + innerW, y1: y(0), y2: y(0) }, axis);
    el("line", { x1: m.left, x2: m.left, y1: m.top, y2: m.top + innerH }, axis);
    var ticks = el("g", { "class": "tick" }, svg);
    [1, 1.25, 1.5, 2, 2.5, 3].forEach(function (v) {
      el("line", { x1: x(v), x2: x(v), y1: y(0), y2: y(0) + 5, "class": "tick-mark" }, axis);
      text(ticks, x(v), y(0) + 19, String(v), { "text-anchor": "middle" });
    });
    [0, 20, 40, 60, 80, 100].forEach(function (v) { text(ticks, m.left - 8, y(v) + 4, String(v), { "text-anchor": "end" }); });
    text(svg, m.left + innerW / 2, height - 8, "Nominal L/A bits per weight", { "text-anchor": "middle", "class": "axis-title" });
    text(svg, 14, m.top + innerH / 2, "Average success (%)", { "text-anchor": "middle", "class": "axis-title", transform: "rotate(-90 14 " + (m.top + innerH / 2) + ")" });

    // BF16 reference
    var ref = DATA.success.bf16_avg;
    el("line", { x1: m.left, x2: m.left + innerW, y1: y(ref), y2: y(ref), "class": "ref-line" }, svg);
    text(svg, m.left + 8, y(ref) - 7, "BF16: " + ref.toFixed(2) + "%", { "class": "ref-label" });

    var hits = [];
    DATA.success.series.forEach(function (s) {
      var spec = SERIES[s.key];
      var pts = s.points.slice().sort(function (a, b) { return a[0] - b[0]; });
      if (pts.length > 1) {
        var d = pts.map(function (p, i) { return (i ? "L" : "M") + x(p[0]) + " " + y(p[1]); }).join("");
        el("path", { d: d, stroke: spec.color, "stroke-dasharray": spec.dash || null, "class": "series-line" + (spec.emphasis ? " emphasis" : "") }, svg);
      }
      pts.forEach(function (p) {
        var g = el("g", null, svg);
        var hit = el("circle", { cx: x(p[0]), cy: y(p[1]), r: 14, "class": "hit", tabindex: 0, role: "img",
          "aria-label": spec.label + " at " + p[0] + " bits per weight: " + p[1].toFixed(2) + " percent" }, g);
        drawMarker(g, spec.marker, x(p[0]), y(p[1]), spec.emphasis ? 5 : 4.5, spec.color, "marker");
        hits.push({ node: hit, series: spec, point: p });
      });
    });
    // Direct labels: the SACQ-1.5b operating point, and the two gray context series.
    // The label sits below-left of the point with a leader line; the region left
    // of 1.5 bpw and below the SACQ line is empty (AQLM, ActQuant, GPTQ start at >= 1.5).
    var lx = x(1.5), ly = y(93.85);
    text(svg, lx - 30, ly + 48, "93.85%", { "text-anchor": "middle", "class": "direct-label" });
    el("line", { x1: lx - 3, x2: lx - 24, y1: ly + 8, y2: ly + 35, stroke: "var(--chart-axis)", "stroke-width": 1 }, svg);
    DATA.success.series.forEach(function (s) {
      var spec = SERIES[s.key];
      if (!spec.context) return;
      var last = s.points[s.points.length - 1];
      // TWLA sits between the SACQ and ActQuant lines; below-left is the clear quadrant.
      if (s.key === "twla") text(svg, x(last[0]) - 9, y(last[1]) + 18, spec.label, { "text-anchor": "end", "class": "direct-label muted" });
      else text(svg, x(last[0]) - 10, y(last[1]) + 4, spec.label, { "text-anchor": "end", "class": "direct-label muted" });
    });

    hits.forEach(function (h) {
      function show(e) {
        var c = e && e.clientX != null ? { x: e.clientX, y: e.clientY } : rectCenter(h.node);
        showTip(h.series.label + " · " + h.point[0] + " bpw", [{ label: "Average success", value: h.point[1].toFixed(2) + "%", color: h.series.color }], c.x, c.y);
      }
      h.node.addEventListener("pointerenter", show);
      h.node.addEventListener("pointermove", show);
      h.node.addEventListener("pointerleave", hideTip);
      h.node.addEventListener("focus", function () { show(null); });
      h.node.addEventListener("blur", hideTip);
    });
    legend(container, [{ ref: true, label: "BF16 reference" }].concat(DATA.success.series.map(function (s) { return SERIES[s.key]; })));
  }

  // ── Figure 1(b): resident memory bars ────────────────────────
  function renderMemory(container) {
    var rows = DATA.memory.rows;
    var width = Math.max(300, container.clientWidth);
    var rowH = 38, barH = 22;
    var m = { top: 14, right: 16, bottom: 44, left: 96 };
    var height = m.top + rows.length * rowH + m.bottom;
    var innerW = width - m.left - m.right;
    // Domain runs past the largest bar so the tip labels never clip.
    var x = linear([0, 8], [m.left, m.left + innerW]);
    container.innerHTML = "";
    var svg = el("svg", { viewBox: "0 0 " + width + " " + height, width: width, height: height }, container);
    var grid = el("g", { "class": "grid" }, svg);
    [2, 4, 6, 8].forEach(function (v) { el("line", { x1: x(v), x2: x(v), y1: m.top, y2: m.top + rows.length * rowH }, grid); });
    var axis = el("g", { "class": "axis" }, svg);
    el("line", { x1: m.left, x2: m.left, y1: m.top, y2: m.top + rows.length * rowH }, axis);
    el("line", { x1: m.left, x2: m.left + innerW, y1: m.top + rows.length * rowH, y2: m.top + rows.length * rowH }, axis);
    var ticks = el("g", { "class": "tick" }, svg);
    [0, 2, 4, 6, 8].forEach(function (v) { text(ticks, x(v), m.top + rows.length * rowH + 18, String(v), { "text-anchor": "middle" }); });
    text(svg, m.left + innerW / 2, height - 6, "Resident model memory (GB)", { "text-anchor": "middle", "class": "axis-title" });

    var base = rows[0].memory;
    rows.forEach(function (r, i) {
      var cy = m.top + i * rowH + rowH / 2;
      var w = x(r.memory) - x(0);
      var cls = r.ref ? "ref" : (r.featured ? "featured" : "ours");
      text(svg, m.left - 10, cy + 4, r.label, { "text-anchor": "end", "class": "cat-label" + (r.featured ? " featured" : "") });
      var g = el("g", null, svg);
      var hit = el("rect", { x: m.left, y: cy - rowH / 2, width: innerW, height: rowH, "class": "bar-hit", tabindex: 0, role: "img",
        "aria-label": r.label + ": " + r.memory.toFixed(3) + " gigabytes, success rate " + r.sr.toFixed(2) + " percent" }, g);
      // Square at the baseline, 4px rounded data-end.
      var rr = 4;
      var d = "M" + x(0) + " " + (cy - barH / 2) + "h" + (w - rr) + "a" + rr + " " + rr + " 0 0 1 " + rr + " " + rr + "v" + (barH - 2 * rr) + "a" + rr + " " + rr + " 0 0 1 " + (-rr) + " " + rr + "h" + (-(w - rr)) + "Z";
      el("path", { d: d, "class": "bar " + cls }, g);
      var label = r.memory.toFixed(3);
      var note = r.ref ? "SR " + r.sr.toFixed(2) + "%" : (base / r.memory).toFixed(2) + "× (SR " + r.sr.toFixed(2) + "%)";
      text(svg, x(r.memory) + 8, cy + 4, label, { "class": "bar-value" });
      // The note goes after the value when it fits; otherwise inside a wide bar;
      // otherwise it is left to the tooltip (and Table 1).
      var noteW = note.length * 6.6, noteX = x(r.memory) + 8 + 42;
      if (noteX + noteW <= width - 2) text(svg, noteX, cy + 4, note, { "class": "bar-note" });
      else if (w > noteW + 20) text(svg, x(r.memory) - 8, cy + 4, note, { "class": "bar-note inside", "text-anchor": "end" });
      function show(e) {
        var c = e && e.clientX != null ? { x: e.clientX, y: e.clientY } : rectCenter(hit);
        showTip(r.label, [
          { label: "Resident memory", value: r.memory.toFixed(3) + " GB" },
          { label: "Reduction vs BF16", value: r.ref ? "—" : (base / r.memory).toFixed(2) + "×" },
          { label: "LIBERO avg. success", value: r.sr.toFixed(2) + "%" }
        ], c.x, c.y);
      }
      hit.addEventListener("pointerenter", show);
      hit.addEventListener("pointermove", show);
      hit.addEventListener("pointerleave", hideTip);
      hit.addEventListener("focus", function () { show(null); });
      hit.addEventListener("blur", hideTip);
    });
    legend(container, [
      { bar: true, color: "var(--bar-ref)", label: "BF16" },
      { bar: true, color: "var(--bar-ours)", label: "SACQ" },
      { bar: true, color: "var(--bar-featured)", label: "SACQ-1.5b (highlighted operating point)" }
    ]);
  }

  // ── Table 8: success vs calibration budget ───────────────────
  var budgetSuite = "avg";
  var SUITE_LABEL = { avg: "Average", spatial: "Spatial", object: "Object", goal: "Goal", long: "Long" };
  function renderBudget(container) {
    var B = DATA.budget;
    var budgets = B.budgets;
    var width = Math.max(300, container.clientWidth);
    var height = Math.round(Math.min(380, Math.max(260, width * 0.5)));
    var m = { top: 24, right: 20, bottom: 50, left: 50 };
    var innerW = width - m.left - m.right, innerH = height - m.top - m.bottom;
    var lg = function (v) { return Math.log(v) / Math.LN2; };
    var x = linear([lg(budgets[0]) - 0.35, lg(budgets[budgets.length - 1]) + 0.35], [m.left, m.left + innerW]);
    var y = linear([0, 100], [m.top + innerH, m.top]);
    container.innerHTML = "";
    var svg = el("svg", { viewBox: "0 0 " + width + " " + height, width: width, height: height }, container);
    var grid = el("g", { "class": "grid" }, svg);
    [20, 40, 60, 80, 100].forEach(function (v) { el("line", { x1: m.left, x2: m.left + innerW, y1: y(v), y2: y(v) }, grid); });
    var axis = el("g", { "class": "axis" }, svg);
    el("line", { x1: m.left, x2: m.left + innerW, y1: y(0), y2: y(0) }, axis);
    el("line", { x1: m.left, x2: m.left, y1: m.top, y2: m.top + innerH }, axis);
    var ticks = el("g", { "class": "tick" }, svg);
    budgets.forEach(function (b) {
      el("line", { x1: x(lg(b)), x2: x(lg(b)), y1: y(0), y2: y(0) + 5 }, axis);
      text(ticks, x(lg(b)), y(0) + 19, b.toLocaleString("en-US"), { "text-anchor": "middle" });
    });
    [0, 20, 40, 60, 80, 100].forEach(function (v) { text(ticks, m.left - 8, y(v) + 4, String(v), { "text-anchor": "end" }); });
    text(svg, m.left + innerW / 2, height - 8, "Calibration observations per suite (log scale)", { "text-anchor": "middle", "class": "axis-title" });
    text(svg, 14, m.top + innerH / 2, SUITE_LABEL[budgetSuite] + " success (%)", { "text-anchor": "middle", "class": "axis-title", transform: "rotate(-90 14 " + (m.top + innerH / 2) + ")" });

    var ref = B.bf16[budgetSuite];
    el("line", { x1: m.left, x2: m.left + innerW, y1: y(ref), y2: y(ref), "class": "ref-line" }, svg);
    text(svg, m.left + 8, y(ref) - 7, "BF16: " + ref.toFixed(budgetSuite === "avg" ? 2 : 1) + "%", { "class": "ref-label" });

    var fmt = function (v) { return v.toFixed(budgetSuite === "avg" ? 2 : 1) + "%"; };
    B.fittings.forEach(function (f) {
      var spec = SERIES[f.key];
      var vals = f[budgetSuite];
      var d = vals.map(function (v, i) { return (i ? "L" : "M") + x(lg(budgets[i])) + " " + y(v); }).join("");
      el("path", { d: d, stroke: spec.color, "stroke-dasharray": spec.dash || null, "class": "series-line" + (spec.emphasis ? " emphasis" : "") }, svg);
      vals.forEach(function (v, i) { drawMarker(svg, spec.marker, x(lg(budgets[i])), y(v), spec.emphasis ? 5 : 4.5, spec.color, "marker"); });
    });
    // Direct labels: the structure-aware series at both ends.
    var sf = B.fittings[0];
    var v0 = sf[budgetSuite][0], vN = sf[budgetSuite][budgets.length - 1];
    text(svg, x(lg(budgets[0])), y(v0) - 12, fmt(v0), { "text-anchor": "middle", "class": "direct-label" });
    text(svg, x(lg(budgets[budgets.length - 1])) - 10, y(vN) - 11, fmt(vN), { "text-anchor": "end", "class": "direct-label" });

    // Crosshair + one tooltip listing every series at the snapped budget.
    var cross = el("line", { y1: m.top, y2: m.top + innerH, "class": "crosshair", visibility: "hidden" }, svg);
    var overlay = el("rect", { x: m.left, y: m.top, width: innerW, height: innerH, fill: "transparent" }, svg);
    var cols = budgets.map(function (b, i) {
      var g = el("g", null, svg);
      var r = el("rect", { x: x(lg(b)) - 1, y: m.top, width: 2, height: innerH, fill: "transparent", tabindex: 0, role: "img",
        "aria-label": b + " observations: " + B.fittings.map(function (f) { return f.label + " " + fmt(f[budgetSuite][i]); }).join(", "), "class": "hit" }, g);
      return r;
    });
    function showAt(i, clientX, clientY) {
      var px = x(lg(budgets[i]));
      cross.setAttribute("x1", px); cross.setAttribute("x2", px); cross.setAttribute("visibility", "visible");
      showTip(budgets[i].toLocaleString("en-US") + " observations · " + SUITE_LABEL[budgetSuite],
        B.fittings.map(function (f) { return { label: f.label, value: fmt(f[budgetSuite][i]), color: SERIES[f.key].color }; }),
        clientX, clientY);
    }
    function nearest(clientX) {
      var rect = svg.getBoundingClientRect();
      var sx = (clientX - rect.left) * (width / rect.width);
      var best = 0, bd = Infinity;
      budgets.forEach(function (b, i) { var d = Math.abs(x(lg(b)) - sx); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    overlay.addEventListener("pointermove", function (e) { showAt(nearest(e.clientX), e.clientX, e.clientY); });
    overlay.addEventListener("pointerleave", function () { cross.setAttribute("visibility", "hidden"); hideTip(); });
    cols.forEach(function (r, i) {
      r.addEventListener("focus", function () { var c = rectCenter(r); showAt(i, c.x, c.y - 40); });
      r.addEventListener("blur", function () { cross.setAttribute("visibility", "hidden"); hideTip(); });
    });
    legend(container, [{ ref: true, label: "BF16 reference" }].concat(B.fittings.map(function (f) { return SERIES[f.key]; })));
  }

  // ── Mount & resize ───────────────────────────────────────────
  var renderers = { success: renderSuccess, memory: renderMemory, budget: renderBudget };
  var charts = Array.prototype.slice.call(document.querySelectorAll("[data-chart]"));
  var pending = null;
  function renderAll() { charts.forEach(function (c) { var r = renderers[c.getAttribute("data-chart")]; if (r) r(c); }); }
  function scheduleRender() { if (pending) return; pending = requestAnimationFrame(function () { pending = null; renderAll(); }); }
  renderAll();
  if ("ResizeObserver" in window) {
    var lastW = {};
    var ro = new ResizeObserver(function (entries) {
      var changed = false;
      entries.forEach(function (e) { var w = Math.round(e.contentRect.width); var id = e.target.id; if (lastW[id] !== w) { lastW[id] = w; changed = true; } });
      if (changed) scheduleRender();
    });
    charts.forEach(function (c) { ro.observe(c); });
  } else {
    window.addEventListener("resize", scheduleRender);
  }

  window.SACQCharts = {
    setBudgetSuite: function (suite) {
      if (!SUITE_LABEL[suite]) return;
      budgetSuite = suite;
      var c = document.getElementById("fig-budget");
      if (c) renderBudget(c);
    }
  };
})();
