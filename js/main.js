/* Navigation highlighting, SimplER protocol tabs, chart suite control, and citation copying. */
(function () {
  "use strict";

  // ── Current-section highlighting in the sticky nav ──
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  function setCurrent(id) {
    links.forEach(function (a) {
      if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window && sections.length) {
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      var best = null, br = 0;
      sections.forEach(function (s) { if (visible[s.id] > br) { br = visible[s.id]; best = s.id; } });
      if (best) setCurrent(best);
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.1, 0.25, 0.5] });
    sections.forEach(function (s) { io.observe(s); });
  }

  // ── SimplER VM / VA tabs ──
  var tablist = document.querySelector(".tab-strip[role='tablist']");
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll("[role='tab']"));
    function activate(tab) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", selected ? "true" : "false");
        t.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
      tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { activate(t); });
      t.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); activate(next); }
      });
    });
  }

  // ── Suite selector for the limited-refinement chart ──
  var seg = document.getElementById("budget-suite");
  if (seg) {
    var buttons = Array.prototype.slice.call(seg.querySelectorAll("button[data-suite]"));
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        buttons.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        if (window.SACQCharts) window.SACQCharts.setBudgetSuite(b.getAttribute("data-suite"));
      });
    });
  }

  // ── Copy BibTeX ──
  var copyButton = document.getElementById("copy-citation");
  var bibtex = document.getElementById("bibtex");
  if (copyButton && bibtex) {
    copyButton.hidden = false;
    var resetTimer = null;
    function flash(label, cls) {
      copyButton.textContent = label;
      copyButton.classList.toggle("copied", cls === "copied");
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () { copyButton.textContent = "Copy BibTeX"; copyButton.classList.remove("copied"); }, 1800);
    }
    function selectText() {
      var range = document.createRange(); range.selectNodeContents(bibtex);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    }
    copyButton.addEventListener("click", function () {
      var txt = bibtex.textContent;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(txt).then(function () { flash("Copied", "copied"); }, function () { selectText(); flash("Selected — press Ctrl/Cmd+C"); });
      } else {
        selectText(); flash("Selected — press Ctrl/Cmd+C");
      }
    });
  }
})();
