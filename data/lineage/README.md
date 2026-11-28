# data/lineage/ — research-lineage maps

Read by the "Lineage" popup on COMMIT papers (`assets/js/lineage_panel.js`,
which draws the map with `assets/js/lineage_view.js`; publications and home pages).
Generated offline; nothing on the site writes these files.

| file | contents |
|---|---|
| `index.json` | the lines (slug, title, paper counts) and the method note |
| `<slug>.json` | one line: the pre-laid-out map (`svg`), every paper (`nodes`), and the links (`par`, `kid`) |
| `papers.json` | for each COMMIT root paper (`bibtexKey`): the papers that build on it directly and how many more build on those |

Node ids: `root:<bibtexKey>` for COMMIT papers, a Semantic Scholar paper id for
traced papers, `site:<hash>` for recorded citers Semantic Scholar could not identify
(the first 12 hex digits of the MD5 of the title reduced to lower-case letters and digits).

**Consistency with data/citations/.** Generation 1 is exactly the site's
citation classification: a paper is linked to a COMMIT paper if and only if the
Citations panel records it as *extends*, *uses-tool* or *adopts-idea*
(primary or secondary label). Later generations were traced through Semantic
Scholar and admitted only with a quoted sentence showing the dependence and that
it carries the line's idea; where such a paper also cites a COMMIT paper
directly, the site's classification decides. After a citation refresh, bring
generation 1 back in step with `curate/lineage/` in the pipeline repository
(mit-commit/nextgen): `step1_additions.py` lists the citing works newly labelled
as building on a line's COMMIT papers and `lineage_refresh.py` adds them to the
maps; papers already there keep their place within their lane, their link type
and their evidence. Run again afterwards, `step1_additions.py` is the check: it
must list nothing but the held-out records. `curate/lineage/run_update.sh` runs
the steps and the checks in order, among them `tests/lineage/lineage_test.py`,
which drives this popup in a browser and checks a hover and a click of every
paper of every map against these files and against the previous maps.
`index.json` records `citations_commit`, the site commit the maps are in step with.

Lines so far (17): Halide; PetaBricks and OpenTuner; superword-level parallelism (SLP); Raw; SUIF; DynamoRIO and Program Shepherding; Meta Optimization; StreamIt; TACO and Finch; DMTCP; bitwidth analysis; GraphIt; Kendo and Aikido; ClearView; Tiramisu; distributed-memory compilation; programmable microfluidics (kept separate from all other lines). COMMIT papers that appear inside a map are drawn in the COMMIT lane. Each COMMIT paper gets one Lineage link, to its home line. Generated 2026-10-12.

Generation 1 updated 2026-11-27 after the citation refresh (`generation1` in each
file): 242 papers added across 14 lines, 36 existing papers linked to a further
COMMIT paper, 16 links between COMMIT papers, and 4 papers of a later generation
moved to generation 1 because the site now labels them as building on a COMMIT
paper directly. The papers added then have not been traced, so nothing is
recorded as building on them yet; generations 2 and later are as traced on
2026-10-12. Four records labelled as building on Halide are held out of the map
because they are not papers (three proceedings volumes and a repository landing
page). The DMTCP map's time axis was extended to 2026.
