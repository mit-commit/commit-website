# data/lineage/ — research-lineage maps for the Lineage page

Read by `lineage.html` (`assets/js/lineage.js`) and by the "Lineage" panel on
COMMIT papers (`assets/js/lineage_panel.js`, publications and home pages).
Generated offline; nothing on the site writes these files.

| file | contents |
|---|---|
| `index.json` | the lines (slug, title, paper counts) and the method note shown on the page |
| `<slug>.json` | one line: the pre-laid-out map (`svg`), every paper (`nodes`), and the links (`par`, `kid`) |
| `papers.json` | for each COMMIT root paper (`bibtexKey`): the papers that build on it directly and how many more build on those |

Node ids: `root:<bibtexKey>` for COMMIT papers, a Semantic Scholar paper id for
traced papers, `site:<hash>` for recorded citers Semantic Scholar could not identify.

**Consistency with data/citations/.** Generation 1 is exactly the site's
citation classification: a paper is linked to a COMMIT paper if and only if the
Citations panel records it as *extends*, *uses-tool* or *adopts-idea*
(primary or secondary label). Later generations were traced through Semantic
Scholar and admitted only with a quoted sentence showing the dependence and that
it carries the line's idea; where such a paper also cites a COMMIT paper
directly, the site's classification decides. After a citation refresh, re-run
the generator so the two stay in step — the generator checks this and reports
any mismatch.

Lines so far: StreamIt, TACO → Finch. Generated 2026-10-12.
