"use strict";

const copyButton = document.getElementById("copy-citation");
const citation = document.getElementById("bibtex");
const copyStatus = document.getElementById("copy-status");

if (copyButton && citation && copyStatus) {
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    const text = citation.textContent.trim();
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      copyStatus.textContent = "Placeholder BibTeX copied.";
    } catch {
      // Keep a selectable citation available when clipboard permissions are unavailable.
      const range = document.createRange();
      range.selectNodeContents(citation);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        copyStatus.textContent = "Citation selected. Press Ctrl+C (or Cmd+C) to copy.";
      } else {
        copyStatus.textContent = "Please select the citation text and copy it manually.";
      }
    }
  });
}

if ("IntersectionObserver" in window) {
  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (!visible.length) return;
    const current = `#${visible[0].target.id}`;
    links.forEach(link => {
      if (link.getAttribute("href") === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-75px 0px -55% 0px", threshold: 0 });
  sections.forEach(section => observer.observe(section));
}
