# SACQ project page

Buildless, static academic project page for **SACQ: Structure-Aware Codebook Quantization for Ultra-Low-Bit Vision-Language-Action Models**.

The page uses local assets, system fonts, plain HTML/CSS, and a small JavaScript file. There are no runtime dependencies or external services. All quantitative claims come from the supplied manuscript.

## Local preview

In PowerShell:

```powershell
cd C:\Users\Leeha\Desktop\research\sacq-project-page
python -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000/>. Stop the server with `Ctrl+C`.

You can also open `index.html` directly. Clipboard access may be unavailable on a `file:` URL; the Copy button then selects the citation for manual copying.

## Files

```text
index.html
assets/
  favicon.svg
  libero-main.svg
  libero-success.svg
  method-overview.png
css/style.css
js/main.js
SOURCE_NOTES.md
```

Desktop shows the combined success/memory teaser and full method overview. Mobile separates the teaser plots and uses SVG viewports into the original assets to display each method panel at a readable size. Tables scroll horizontally within their own regions.

## GitHub repository

Keep the repository **private** during preparation. GitHub Pages has not been configured, and no deployment workflow is included. Store only this directory as the site repository; the parent research directory is not part of the project.

After creating an empty private repository, add its remote and push:

```powershell
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

If a remote repository already contains files, inspect and integrate its history before pushing. Do not force-push existing work.

## Editing

- Page content, authors, affiliations, resource links, and tables: `index.html`
- Typography, spacing, responsive layout, and colors: `css/style.css`
- Citation copying and navigation highlighting: `js/main.js`
- Original figures are preserved as local assets.

## Before public release

1. Verify the author list, KAIST affiliation, and corresponding-author marker against the released paper.
2. Replace disabled Paper/Code buttons with the actual public links.
3. Replace the placeholder BibTeX with the final citation.
4. Remove `<meta name="robots" content="noindex, nofollow">` when indexing is wanted. This metadata is not access control; repository/site privacy is a separate setting.
5. Review manuscript values and figure captions against the released paper.
6. Configure GitHub Pages only when public release is intended.

The unreleased manuscript PDF, historical drafts, PowerPoint sources, and research videos are not included in this repository.
