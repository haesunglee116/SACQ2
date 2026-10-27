# Content provenance

Source of truth: the SACQ preprint manuscript (`main_arxiv.tex`, author version with KAIST affiliation, as of 2026-10-27). The manuscript is not copied into this site.

Author metadata: Haesung Lee and Insu Han, KAIST; Insu Han is the corresponding author. The same metadata is used in the placeholder BibTeX.

## Manuscript mapping

| Page content | Source |
| --- | --- |
| Title, abstract | Abstract (verbatim) |
| Motivation cards | Section 1 (Introduction) |
| Vector-codebook representation, fitting objective | Sections 2.2, 2.3, 3 |
| Structure-aware metric construction, Eq. (2) and (4) | Section 3.1 |
| Role-specific metric tables | Appendix A.4, Tables 4 and 5 |
| Mixed-bit allocation, Eq. (7) | Section 3.2, Appendix B |
| Index reassignment, Eq. (8); action-level calibration, Eq. (9) | Section 3.3, Appendix C |
| Experimental setup | Section 4.1, Appendix D |
| LIBERO results | Table 1 |
| SimplER results (per task, VM and VA) | Table 2 |
| Component ablation | Table 3 |
| Limited-refinement study and chart | Appendix G, Table 8 |
| OpenVLA-OFT and LIBERO-Pro | Appendix F, Tables 6 and 7 |
| Limitations | Section 6 |

## Numbers

Every number on the page is stored once in `data/paper_tables.json` and rendered into `index.html` and `js/data.js` by `tools/build_site.py`. The stat tiles and prose repeat a few headline values by hand (93.85%, 94.10%, 1.175 GB, 5.677 GB, 4.83×, 63.76%, 58.90%, 52.27%, 53.45%); keep them in sync with the JSON when the manuscript changes.

## Figures

- Figure 1(a) and 1(b) are drawn as SVG at load time (`js/charts.js`) from Table 1 values, matching the manuscript figure's content: nominal L/A bpw on the x axis, the BF16 reference line, GPTQ-Ternary plotted on the GPTQ series at log2(3) ≈ 1.585 bpw, and resident memory of the full loaded policy with success-rate annotations. Series colors follow the manuscript figure for the three main series (SACQ red, ActQuant blue, GPTQ orange); HQQ and TWLA are drawn in neutral gray with distinct markers and direct labels so that every hue pair on the chart passes the colour-vision separation check. `assets/libero-panel-a.svg` and `libero-panel-b.svg` are the manuscript's own panel exports (`figure/libero_panel_a.pdf`, `libero_panel_b.pdf`), shown only when JavaScript is unavailable.
- `assets/method-overview.svg` and `.png` are converted from `figure/sacq_overview.pdf`, the manuscript's Figure 2 export supplied on 2026-10-27 (GPTQ-4b/VC-2.75b state labels, "Action MSE", four example layers).
- The Table 8 chart plots the per-suite and average columns of Table 8 against calibration observations per suite on a log scale, with the BF16 row as the reference line.

## Reporting constraints

- GR00T L/A bpw covers 338 language/action candidate linear layers and excludes quantization metadata; allocation itself accounts for metadata in calculated storage.
- Other fixed GR00T components use 4-bit weights. Activations remain BF16.
- Memory is full loaded-policy resident memory, not peak inference memory or a latency measure.
- OpenVLA-OFT V/L bpw covers 420 vision/language layers and excludes the action head; it is not the same scope as GR00T L/A bpw.
- Comparisons use the baseline variants evaluated in the SACQ manuscript; values are not imported from other papers.
- No runtime speedup or physical-robot validation is claimed.
- Refinement optimizes codebooks/scales on calibration data, so SACQ is not described as training-free.
- No accepted venue, arXiv identifier, or public code URL beyond the repository name has been invented.

## Design references

- https://langq1225.github.io/loopspec/ — academic typography, centered publication header, figure-led layout.
- https://actquant.github.io/ — narrative progression from teaser to abstract, method, and benchmark results.

HTML/CSS/JavaScript are authored for SACQ. Reference text, source code, and visual assets have not been copied.
