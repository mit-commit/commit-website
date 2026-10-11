# Commit Group Website

This repository contains the static site files for the COMMIT @ CSAIL website.

## Updating Content

### Add or change a person
- Edit `data/people.xml`.
- Each `<person>` element lists a member with `name`, `title`, and optional `url`.
- Current members live under the `<current>` section.
- Alumni live under `<alumni>` and include a `year` attribute.
- When someone graduates, move their entry to `<alumni>` and set the graduation year.

### Add a publication
The full procedure — file naming, required fields, the fixed topic/project
vocabularies, and how to write the summary — is in
[`docs/adding-a-paper.md`](docs/adding-a-paper.md). In short:
- Put the PDF in `papers/<year>/`, where `<year>` is the year that version was
  published, named `<lastname>-<venue><yy>-<short>.pdf`. Slides go beside it.
- Append an entry to `data/publications.json`.
- Every link field (`url`, `slides`, `video`, `code`) and every summary `href`
  is a site-relative path to a file in this repo (`papers/...` or
  `presentations/...`). Do not link to `commit.csail.mit.edu`: it still serves
  the old paper tree, but nothing after 2022 is on it.
- Run `python3 utils/validate_publications.py` and fix any errors before pushing.

### Feature a paper
- Add `"featured" : true` to the json for a publication
- OR add a `"price" : "Award"` to the json for a publication.
- Featured publications are ordered by date.

### Record a test-of-time award
- On the paper's original entry, add
  `"awards": [{"name": "Most Influential PLDI Paper Award", "year": 2023, "kind": "test-of-time"}]`
  (and update `price` for the badge text). Never duplicate the entry.
- When the publications page is grouped by year, the award year then shows a
  one-line pointer to the paper. See `docs/adding-a-paper.md`.

## How the site is put together

There is no build step. The four pages are static HTML; each loads its data
in the browser at runtime, so a change to a data file is live as soon as it is
pushed to `main` and GitHub Pages redeploys.

| Page | Scripts | Data loaded at page load | Loaded on demand |
|---|---|---|---|
| `index.html` | `pubs.js`, `pubs_index.js`, `citations.js`, `scoring.js`, `projects_featured.js`, `people_current.js` | `publications.json`, `people.xml`, `projects.xml`, `citations/index.json`, `repos/index.json` | — |
| `publications.html` | `pubs.js`, `citations.js`, `scoring.js`, `publications.js` | `publications.json`, `citations/index.json`, `citations/reception.json`, `citations/citers.json`, `repos/index.json`, `impact-authors.json`, `author-links.json` | `citations/<key>.json`, `repos/papers/<key>.json` when a panel is opened |
| `people.html` | `people.js`, `rotator.js` | `people.xml` | — |
| `projects.html` | `projects.js` | `projects.xml` | — |

All paths are under `data/`. Per-paper files are named by `bibtexKey` with
`:` replaced by `_`, so **a `bibtexKey` must never change once citation data
exists for it** — the citation and repository panels would silently stop
appearing. The layout of `data/citations/` is documented in
`data/citations/SCHEMA.md`.

The publications page collapses entries that share a normalized title and
`itemType`, keeping one. A technical report and the conference paper of the
same title are different `itemType`s and both appear; two conference entries
with the same title do not.

## Checking changes

- `python3 utils/validate_publications.py` — runs in CI on every push or pull
  request that touches `data/publications.json`, `papers/`, or the validator.
  Errors block. Warnings do not; the known ones are listed in
  `docs/adding-a-paper.md` so a new one stands out.
- The validator checks that every link *resolves*. It cannot tell whether a
  link resolves to the *right* file. After moving or renaming a PDF, or
  pointing an entry at a different one, open the entry on the page and check
  that the file is the paper the entry describes.
- When renaming or moving a PDF, use `git mv` and rewrite every reference to
  the old path in `data/publications.json` — including `href`s inside other
  entries' summaries — then grep `data/` and the HTML pages for the old name.
  The old URL stops working, so avoid renaming anything that has been linked
  from outside the site for long.

## Analytics

- Usage is tracked with [Umami](https://umami.is) (privacy-friendly, cookieless — no consent banner needed).
- The tracking snippet (with the `data-website-id`) lives in the `<head>` of each HTML page; the shared `track()` helper is in `assets/js/common.js`.
- Custom events on the Publications page (`search`, `filter`, `paper-view`, `bib-download`, `slides-view`, `export-bib`) are emitted from `assets/js/publications.js`.
- View the dashboard at cloud.umami.is (website: "COMMIT @ CSAIL").
