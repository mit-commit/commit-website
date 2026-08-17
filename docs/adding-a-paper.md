# Adding a new paper and writing its summary

This document records the procedure for adding a publication to the COMMIT
website and the method for writing its contextual summary. The summary
method was established in August 2026, when summaries were written for all
publications and every cross-paper connection was verified against the papers'
full texts. Follow it for each new paper so the corpus stays consistent.
It is written so that either a person or an AI assistant can execute it.

The site is served from GitHub Pages at `mit-commit.github.io/commit-website`.
`commit.csail.mit.edu` redirects there and still serves the older paper tree,
but nothing added after 2022 appears on it — which is why every link in this
repo is site-relative.

---

## Part 1 — Adding the paper to the site

1. **Check it is not already there.** Search `data/publications.json` for the
   title, the DOI, and the author. The publications page collapses entries that
   share a normalized title and `itemType`, keeping only one — so a duplicate
   does not produce an error, it produces a silently missing paper. If two
   genuinely distinct publications share a title (a journal reprint of a
   conference paper, say), disambiguate the later one in its `title` field, as
   `hall:dtj:1998` does with "(Digital Technical Journal reprint)".

2. **Place the PDF** at `papers/<year>/<filename>.pdf`, using the naming
   convention `<lastname>-<venue><yy>-<short>.pdf` — for example
   `won-asplos26-insum.pdf`. Older files keep their historical names; new ones
   follow the convention. Store the author's camera-ready version, not a
   publisher's PDF wrapped in landing-page apparatus.

3. **Add an entry to `data/publications.json`** with the existing fields:
   `title`, `author0` (all authors in paper order, in one field), `month`,
   `year`, `url`, `type` (for theses/TRs), `venue`, `bibtexKey`, `itemType`,
   `topics`, `project`, `summary`.
   - `url` is **site-relative**: `papers/<year>/<filename>.pdf`. Never absolute.
   - `bibtexKey` must be unique across the file.
   - Do not add an `oldbibtex` field to a new entry. Where it exists it
     overrides the BibTeX the site generates from the fields, which is how
     several entries came to hand out the wrong title.
   - Optional: `slides`, `video`, `code` (artifact or source repository, only
     when the paper itself points to one), `price` (award text), and
     `featured: true` to put the paper on the front page. Award papers are
     featured automatically.

4. **Tags — the vocabulary is FIXED.** Do not invent new topic or project
   names; if a genuinely new area appears, extending the vocabulary is a
   deliberate, separate decision, made in both this document and
   `utils/validate_publications.py`.
   - `topics`: one or MORE from:
     Approximate Computing; Autotuning; Bioinformatics & Genomics; Bitwidth
     Analysis / Quantization; Compiler Optimization; Compilers for Machine
     Learning; Computer Architecture; DSLs; Data Analytics; Deterministic
     Parallelism; Dynamic Binary Instrumentation; FPGA & Hardware Acceleration;
     GPUs; Graph Analytics; HPC; ICT4D; Image & Video Processing; Lattice QCD;
     Machine Learning for Compilers; Memory Optimization & Locality;
     Microfluidics / Programmable Biology; Multi-stage Programming; Networking;
     Parallelizing Compilers; Physical Simulation; Polyhedral Compilation;
     Program Synthesis & LLMs; Program Verification; Security; Sparse & Tensor
     Algebra; Speculative Parallelism; Stream Computing; Vectorization / SIMD.
   - `project`: at most ONE of:
     Aikido/Kendo; AskIt; Bitwise; BuildIt; Cimple; Codon; DAWG; DynamoRIO;
     Finch; GraphIt; Halide; Helium; Insum; Ithemal; Maps; OpenTuner; Other;
     PetaBricks; Prism; Program Shepherding; Raw; SLP; SUDS; SUIF; Seq; Simit;
     Softspec; StreamIt; TACO; TEK; Tiramisu; UniTe; VeGen; WACO; Weld; goSLP;
     milk.
   - Tagging pitfalls learned from the 2026 audit: "Machine Learning for
     Compilers" means ML applied to compiler decisions; a compiler *for* ML
     workloads is "Compilers for Machine Learning". Tag by what the paper centrally
     contributes, not by every technique it touches. Theses should match the
     tagging of their companion conference papers.

---

## Part 2 — Writing the summary

Each paper gets a summary of **at most 150 words** of visible text (no
minimum — do not pad), in **two paragraphs**.

### Paragraph 1 — the paper and its contributions

Describe what the paper/system is and what it specifically contributes. Read
the **abstract AND the introduction's contributions list** — the summary should
reflect the contributions, not just the abstract. Pattern: "*Name* is a
*what-it-is* for *domain*," then the key mechanism and the concrete
contributions, including the paper's own headline numbers ("up to 5× faster
than expert-tuned code"). Never invent numbers.

### Paragraph 2 — the connections (only solid ones)

A connection is claimed **only if the newer paper genuinely builds on the older
COMMIT paper**. The bar, verified against the newer paper's full text:

- **Solid (include):** the newer paper implements/extends the older system or
  artifact; uses its technique, IR, or abstraction as a working component; uses
  it as the primary motivation or the baseline it directly improves; or is a
  direct project-line successor reusing its machinery. Evidence must come from
  the intro, approach, implementation, or evaluation sections.
- **Same work (include, phrased as versions):** TR / conference / journal /
  thesis versions of the same result ("an earlier technical report of…",
  "X's PhD thesis gives the most complete treatment").
- **Not a connection (exclude):** a citation that appears only in Related Work;
  a passing mention or one of a list of contextual citations; thematic
  similarity with no dependence; same author or same project line alone. If in
  doubt, grep the paper for the older work's system name and author surnames
  and check where the citation actually sits.

**It is fine — and common — for a paper to have few or no connections.** With
zero, drop paragraph 2 entirely (no "this work stands alone" filler). With
exactly one, append a single sentence instead of a paragraph. Never manufacture
lineage.

A summary describes the paper, never the catalog. Do not write about the entry,
the PDF, or other records in the file.

When the new paper solidly builds on older papers, also consider adding a
one-clause forward mention ("later carried to GPUs by X") to those older
papers' summaries — forward links are justified only by the same verified
build-on evidence.

### Tone

Academic and a little understated; declarative, concrete sentences; precise
numbers over adjectives.

- **Banned:** flagship, seminal, landmark, groundbreaking, pioneering,
  definitive, celebrated, famous, revolutionary, "founding paper", "inflection
  point", state-of-the-art, cutting-edge, and hype adjectives generally.
- **Timeless — never anchor to the present:** no "newest", "latest",
  "recently", "currently", "nowadays", "today", "to date", "as of <year>". The
  text must still read correctly in ten years. Connect to predecessors and
  successors by name and year instead. ("Frontier", "current", "modern" and
  "recent" have legitimate technical uses — Pareto frontier, current execution —
  and are flagged for a human rather than blocked.)
- Allowed sober framings: "the main language paper of the X project", "the
  most complete treatment", "builds on", "grew out of", "widely used".

### Links

Embedded links use HTML `<a href="papers/<year>/<file>.pdf">natural anchor
text</a>` — site-relative, pointing only at papers present in
`data/publications.json`. Anchor text is a natural phrase ("Thies's PhD
thesis", "the ASPLOS 2002 paper"), not a bare title. Off-site links (arXiv,
DOI, DSpace) stay absolute.

### Two approved exemplars (match this register)

> StreamIt is a programming language for streaming applications that targets
> multicore architectures. It introduces structured stream graphs — filters
> composed into pipelines, split-joins, and feedback loops — plus control
> messaging and a natural syntax that make rates and topology visible to a
> compiler.
>
> This is the main language paper of the StreamIt project, which anchored a
> decade of streaming research at COMMIT. Growing out of the Raw project's
> search for programming models that expose communication, and first sketched
> in a 2001 technical report, it argues that streaming programs are a distinct
> and important domain. The companion ASPLOS 2002 paper supplies the compiler
> story for Raw. Later StreamIt work — phased scheduling, linear analysis,
> coarse-grained parallelization — builds on the abstractions defined here. A
> journal version appeared in IJPP 2005, and Thies's PhD thesis gives the most
> complete treatment.

> Halide is a programming language for high-performance image and signal
> processing. Its central idea is decoupling what a pipeline computes from how
> its computation is organized. This paper contributes a systematic model of
> the fundamental parallelism–locality–recomputation tradeoff, a schedule
> representation that describes points in that space, and a compiler that
> synthesizes implementations up to 5× faster than expert-tuned code on CPUs
> and GPUs.
>
> This is the main compiler paper of the Halide project. The SIGGRAPH 2012
> paper introduced the language and the algorithm/schedule separation; the
> stochastic schedule search here seeded the autoscheduling literature and
> connects to OpenTuner. Ragan-Kelley's PhD thesis is the most complete
> treatment, and the CACM article an accessible retrospective.

(In the stored summaries the referenced papers carry `<a href>` links to their
site paths.)

---

## Part 3 — Validate, then push

`utils/validate_publications.py` enforces most of this document. Run it before
committing:

    python3 utils/validate_publications.py

It reports errors, which block, and warnings, which do not. It checks required
fields, unique `bibtexKey`, the title+`itemType` collision described in step 1,
relative-URL form, that every `url`, `slides`, `video`, `code` and summary
`href` resolves to a file in the repo, the 150-word and two-paragraph limits,
banned and time-anchored words, catalog self-reference, the topic and project
vocabularies, and `oldbibtex` titles that disagree with their entry.

The same script runs in CI (`.github/workflows/validate-publications.yml`) on
every push and pull request that touches `data/publications.json`, the papers
tree, or the validator itself. A legacy problem that cannot be fixed
immediately can be parked in `utils/validation_baseline.json` with
`--write-baseline`; that file does not currently exist, because nothing is
parked.

Commit the PDF and the `data/publications.json` change together, and list any
older entries whose summaries gained a forward mention in the commit message.

### Checklist before committing

1. Not a duplicate; no title+`itemType` collision with an existing entry.
2. PDF in `papers/<year>/`, named per the convention.
3. `url` relative; `bibtexKey` unique; no `oldbibtex`.
4. ≤150 visible words; two paragraphs (or fewer per the zero/one-connection
   rules).
5. Paragraph 1 covers the contributions, with the paper's own numbers.
6. Every linked paper passes the build-on bar, with evidence found in the new
   paper's own text outside Related Work.
7. No banned or time-anchored words; no reference to the catalog itself.
8. Topics/project from the fixed vocabularies; at most one project.
9. Forward mentions added to the older papers this one builds on (optional but
   preferred).
10. `utils/validate_publications.py` reports no errors.
