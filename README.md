# SACQ project page

Static academic project page for **SACQ: Structure-Aware Codebook Quantization for Ultra-Low-Bit Vision-Language-Action Models**.

The page is plain HTML/CSS/JavaScript with local assets and system fonts. There are no runtime dependencies, no external scripts, and no network calls. Equations are MathML (rendered natively by current browsers); the two teaser charts and the limited-refinement chart are drawn as SVG at load time from `js/data.js`. All quantitative claims come from the manuscript and are listed in `data/paper_tables.json`.

## Local preview

```bash
cd sacq_project_page
python -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000/>. Opening `index.html` directly from disk also works; on a `file:` URL the clipboard may be unavailable, in which case the Copy button selects the citation for manual copying.

## Files

```text
index.html                 page content (tables are generated, see below)
css/style.css              typography, layout, responsive rules, chart tokens
js/data.js                 generated chart data (do not edit by hand)
js/charts.js               SVG charts: Figure 1(a), Figure 1(b), Table 8 chart
js/main.js                 nav highlighting, SimplER tabs, suite selector, Copy BibTeX
data/paper_tables.json     every number shown on the page, keyed by paper table
tools/build_site.py        regenerates the tables in index.html and js/data.js
assets/method-overview.svg method overview figure (desktop)
assets/method-overview.png the same figure rasterized, cropped per stage on phones
assets/libero-panel-a.svg  static Figure 1(a)/(b) exports, shown only without JavaScript
assets/libero-panel-b.svg
assets/favicon.svg
figure/                    source PDFs of the figures above
SOURCE_NOTES.md            content provenance
```

To regenerate the figure assets after replacing a PDF in `figure/` (requires `mutool`):

```bash
mutool draw -F svg -o assets/method-overview.svg figure/sacq_overview.pdf
mutool draw -r 300 -F png -o assets/method-overview.png figure/sacq_overview.pdf
mutool draw -F svg -o assets/libero-panel-a.svg figure/libero_panel_a.pdf
mutool draw -F svg -o assets/libero-panel-b.svg figure/libero_panel_b.pdf
```

`mutool` appends the page number to the output name (`method-overview1.svg`); rename the files afterwards. The phone panels in `index.html` crop the PNG with fixed `viewBox` values that assume the current figure layout (4890×1873 at 300 dpi); adjust them if the figure's layout changes.

## Updating numbers

Edit `data/paper_tables.json`, then run

```bash
python tools/build_site.py
```

The script rewrites the table fragments between the `<!-- BUILD:name -->` markers in `index.html` and regenerates `js/data.js`. Bold cells (best within a bit-budget group) are computed from the data, so they match the manuscript's convention automatically. Commit the regenerated files; nothing runs at serve time.

Prose, captions, and the method section are edited directly in `index.html`.

## Responsive behaviour

Desktop shows the full method overview; phones show one panel per stage using SVG viewports into the same bitmap. Charts re-render on container resize. Tables scroll horizontally within their own region with the first column pinned.

## GitHub repository and hosting

Keep the repository **private** during preparation. GitHub Pages is not configured and no deployment workflow is included; hosting is decided at release time together with the paper. Note that the default Pages URL is `https://<owner>.github.io/<repository>/`, so the repository name (or a `gh-pages` branch of the code repository) determines the final address.

## Before public release

1. Verify the author list, affiliation, and corresponding-author marker against the released paper.
2. Point the Paper button at the arXiv abstract page (`index.html`, `RELEASE` comment in the hero).
3. Make the code repository public, or adjust the Code button.
4. Replace the placeholder BibTeX with the final citation.
5. Replace `assets/method-overview.png` with the final Figure 2 export if the manuscript figure changed.
6. Remove `<meta name="robots" content="noindex, nofollow">` when indexing is wanted. This metadata is not access control; repository/site privacy is a separate setting.
7. Re-check all numbers in `data/paper_tables.json` against the released paper and rerun the build.

The unreleased manuscript PDF, drafts, and rollout videos are not included in this repository.
