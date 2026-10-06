# Content provenance

Source of truth: `SACQ__Structure_Aware_Codebook_Quantization_for_Ultra_Low_Bit_Vision_Language_Action_Models.pdf`, 18 pages, supplied in the parent research directory. This is an anonymous ICLR 2027 review manuscript. The source PDF is not copied into this site.

Author metadata comes from the updated manuscript screenshot supplied by the user on 2026-10-07: Haesung Lee and Insu Han, both affiliated with KAIST; Insu Han is the corresponding author. This metadata is also used in the placeholder BibTeX.

## Manuscript mapping

| Page content | Source |
| --- | --- |
| Title and abstract | p. 1 |
| Motivation and contributions | pp. 1–2 |
| Vector-codebook representation | pp. 2–3 |
| Role-specific metric construction | pp. 4–6, Appendix A |
| Mixed-bit allocation | p. 6, Appendix B |
| Two-stage refinement | pp. 6–7, Appendix C |
| LIBERO results and memory | Table 1, p. 8 |
| SimplER results | Table 2, p. 8 |
| Component and structure-aware ablations | Table 3, p. 9 |
| Quantization scope and baseline implementation caveats | Appendices D.2 and E, p. 16 |
| OpenVLA-OFT and LIBERO-Pro | Tables 6 and 7, p. 17 |
| Limited refinement findings | Table 8, p. 18 |
| Limitations | p. 9 |

## Figure mapping

- `assets/libero-main.svg` copies `figure/libero_main.svg` without changes. It is generated from manuscript Table 1, showing success versus nominal L/A bpw and whole-policy resident memory. The GPTQ legend groups standard GPTQ and the custom ternary extension; the caption explains this. The plotted TWLA point is the TWLA-compatible port.
- `assets/libero-success.svg` copies `figure/libero_success.svg` without changes; retained for alternate layouts.
- `assets/method-overview.png` copies `SACQ_overview_compact_v3.png` without changes. Mobile SVG viewports show individual panels of this same bitmap, without redrawing the method.

The CSV success values (15 entries) and memory values (6 entries) were checked against Table 1 before implementation.

## Reporting constraints

- GR00T L/A bpw covers 338 language/action candidate linear layers and excludes quantization metadata. Allocation itself accounts for metadata in calculated storage.
- Other fixed GR00T components use 4-bit weights. Activations remain BF16.
- Memory is full loaded-policy resident memory, not peak inference memory or a latency measure.
- OpenVLA-OFT V/L bpw covers 420 vision/language layers and excludes the action head; it cannot be treated as the same scope as GR00T L/A bpw.
- Comparisons use the variants evaluated in the SACQ manuscript. Values are not imported from other papers’ project pages.
- No runtime speedup or physical-robot validation is claimed.
- Refinement optimizes codebooks/scales on calibration data, so SACQ is not described as training-free.
- No accepted venue, publication year, arXiv identifier, or public code URL has been invented.

## Design references

- https://langq1225.github.io/loopspec/ — academic typography, centered publication header, figure-led layout.
- https://actquant.github.io/ — narrative progression from teaser to abstract, method, and benchmark results.

HTML/CSS/JavaScript are authored for SACQ. Reference text, source code, and visual assets have not been copied.
