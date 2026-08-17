#!/usr/bin/env python3
"""Validate data/publications.json against the rules in docs/adding-a-paper.md.

Exit status is 1 if any ERROR is unbaselined, so CI blocks the push.
Legacy problems can be parked in utils/validation_baseline.json until fixed;
a baselined issue that no longer occurs is reported as stale.

Usage:
    python3 utils/validate_publications.py [--baseline FILE] [--write-baseline]
"""

import argparse
import collections
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBS = os.path.join(ROOT, "data", "publications.json")

TOPICS = {
    "Approximate Computing", "Autotuning", "Bioinformatics & Genomics",
    "Bitwidth Analysis / Quantization", "Compiler Optimization",
    "Compilers for Machine Learning", "Computer Architecture", "DSLs",
    "Data Analytics", "Deterministic Parallelism",
    "Dynamic Binary Instrumentation", "FPGA & Hardware Acceleration", "GPUs",
    "Graph Analytics", "HPC", "ICT4D", "Image & Video Processing",
    "Lattice QCD", "Machine Learning for Compilers",
    "Memory Optimization & Locality", "Microfluidics / Programmable Biology",
    "Multi-stage Programming", "Networking", "Parallelizing Compilers",
    "Physical Simulation", "Polyhedral Compilation", "Program Synthesis & LLMs",
    "Program Verification", "Security", "Sparse & Tensor Algebra",
    "Speculative Parallelism", "Stream Computing", "Vectorization / SIMD",
}

PROJECTS = {
    "Aikido/Kendo", "AskIt", "Bitwise", "BuildIt", "Cimple", "Codon", "DAWG",
    "DynamoRIO", "Finch", "GraphIt", "Halide", "Helium", "Insum", "Ithemal",
    "Maps", "OpenTuner", "Other", "PetaBricks", "Prism", "Program Shepherding",
    "Raw", "SLP", "SUDS", "SUIF", "Seq", "Simit", "Softspec", "StreamIt",
    "TACO", "TEK", "Tiramisu", "UniTe", "VeGen", "WACO", "Weld", "goSLP",
    "milk",
}

ITEM_TYPES = {
    "article", "inproceedings", "incollection", "book", "inbook",
    "phdthesis", "mastersthesis", "sciencethesis", "sbthesis", "techreport",
    "misc", "unpublished", "conference", "proceedings",
}

REQUIRED = ("title", "author0", "year", "bibtexKey", "itemType", "venue", "topics")

BANNED = (
    "flagship", "seminal", "landmark", "groundbreaking", "pioneering",
    "definitive", "celebrated", "famous", "founding paper", "inflection point",
    "state-of-the-art", "cutting-edge", "revolutionary", "cutting edge",
)

# Unambiguous present-anchoring — always an error.
TIME_ANCHORED = (
    "newest", "latest", "recently", "currently", "nowadays", "today",
    "to date", "as of",
)

# Context-dependent: "Pareto frontier" and "landmark configuration" are
# technical terms, so these are flagged for a human rather than blocking.
TIME_ANCHORED_SOFT = ("recent", "current", "modern", "frontier")

# Technical phrases exempt from the promotional-word check.
BANNED_EXEMPT = ("landmark configuration", "landmark configurations", "landmarks")

# Non-site hosts a summary link or url may legitimately point at.
EXTERNAL_OK = ("arxiv.org", "doi.org", "dx.doi.org", "dspace.mit.edu",
               "dl.acm.org", "ieeexplore.ieee.org", "nature.com")

# A summary must describe the paper, never the catalog it sits in.
SELF_REFERENTIAL = ("second listing", "this entry duplicates", "duplicate entry",
                    "the other 2023 record", "points to the same pdf")

MAX_WORDS = 150
FILENAME_RE = re.compile(r"^[a-z0-9]+-[a-z]+\d{2}-[a-z0-9-]+\.pdf$")
NEW_FILE_YEAR = 2026  # convention applies to papers added from this year on

Issue = collections.namedtuple("Issue", "level code where detail")


def norm(s):
    return re.sub(r"\s+", " ", str(s or "")).strip().lower()


def visible_words(summary):
    text = re.sub(r"<[^>]+>", "", summary or "")
    return len(html.unescape(text).split())


def rel_target(url):
    """Repo-relative path a url points at, or None if it is not a site asset."""
    if not url:
        return None
    m = re.match(r"^https?://[^/]+/(?:commit/)?(papers|presentations)/(.+)$", url, re.I)
    if m:
        return "%s/%s" % (m.group(1).lower(), m.group(2))
    if re.match(r"^(papers|presentations)/", url):
        return url
    return None


def check(entries):
    issues = []
    seen_key = {}
    seen_title = {}

    def add(level, code, where, detail):
        issues.append(Issue(level, code, where, detail))

    for i, e in enumerate(entries):
        who = e.get("bibtexKey") or e.get("title") or "entry #%d" % i

        for f in REQUIRED:
            if not e.get(f):
                add("ERROR", "missing-field", who, "missing %s" % f)

        key = e.get("bibtexKey")
        if key:
            if key in seen_key:
                add("ERROR", "duplicate-key", who, "bibtexKey also used by %s" % seen_key[key])
            seen_key[key] = who

        # The site collapses entries sharing normalized title + itemType, so a
        # collision silently removes a paper from the page.
        tkey = (norm(e.get("title")), norm(e.get("itemType")))
        if tkey[0]:
            if tkey in seen_title:
                add("ERROR", "duplicate-entry", who,
                    "same title and itemType as %s — needs explicit approval" % seen_title[tkey])
            elif tkey[0] in {t for t, _ in seen_title}:
                add("WARN", "possible-duplicate", who,
                    "same title as an existing entry with a different itemType")
            seen_title[tkey] = who

        if e.get("itemType") and e["itemType"] not in ITEM_TYPES:
            add("ERROR", "bad-itemtype", who, "unknown itemType %r" % e["itemType"])

        topics = e.get("topics") or []
        if isinstance(topics, str):
            topics = [t.strip() for t in topics.split(",") if t.strip()]
        for t in topics:
            if t not in TOPICS:
                add("ERROR", "bad-topic", who, "topic %r not in vocabulary" % t)

        proj = e.get("project")
        if isinstance(proj, list):
            add("ERROR", "multi-project", who, "project must be a single value")
        elif proj and proj not in PROJECTS:
            add("ERROR", "bad-project", who, "project %r not in vocabulary" % proj)

        url = e.get("url", "")
        target = rel_target(url)
        if not url:
            add("WARN", "no-url", who, "entry has no url")
        elif target:
            if url.startswith("http"):
                add("ERROR", "absolute-url", who, "url must be relative: %s" % url)
            if not os.path.exists(os.path.join(ROOT, target)):
                add("ERROR", "missing-file", who, "url points at missing file %s" % target)
            elif target.startswith("papers/"):
                year = target.split("/")[1]
                if e.get("year") and year != str(e["year"]):
                    add("WARN", "year-mismatch", who, "file in papers/%s but year is %s" % (year, e["year"]))
                name = os.path.basename(target)
                if year.isdigit() and int(year) >= NEW_FILE_YEAR and not FILENAME_RE.match(name):
                    add("WARN", "filename-convention", who,
                        "%s does not match <lastname>-<venue><yy>-<short>.pdf" % name)
        elif not any(h in url for h in EXTERNAL_OK):
            add("WARN", "offsite-url", who, "url is off-site: %s" % url)

        for f in ("slides", "video", "code"):
            v = e.get(f)
            if v and not (rel_target(v) or v.startswith("http")):
                add("ERROR", "bad-link", who, "%s is not a usable link: %s" % (f, v))
            t = rel_target(v) if v else None
            if t and not os.path.exists(os.path.join(ROOT, t)):
                add("ERROR", "missing-file", who, "%s points at missing file %s" % (f, t))

        old = e.get("oldbibtex")
        if old:
            m = re.search(r"(?m)^\s*title\s*=\s*\{(.+?)\}\s*,?\s*$", old, re.S)
            if m and norm(m.group(1)) != norm(e.get("title")):
                add("ERROR", "bibtex-title-mismatch", who,
                    "oldbibtex title differs from entry title")

        s = e.get("summary")
        if not s:
            add("WARN", "no-summary", who, "entry has no summary")
            continue

        wc = visible_words(s)
        if wc > MAX_WORDS:
            add("ERROR", "summary-too-long", who, "%d visible words" % wc)
        paras = [p for p in re.split(r"\n\n+", s) if p.strip()]
        if len(paras) > 2:
            add("ERROR", "summary-paragraphs", who, "%d paragraphs, max 2" % len(paras))

        low = " " + norm(s) + " "
        for phrase in SELF_REFERENTIAL:
            if phrase in low:
                add("ERROR", "self-referential", who, "summary refers to the catalog: %r" % phrase)

        clean = low
        for phrase in BANNED_EXEMPT:
            clean = clean.replace(phrase, " ")
        for w in BANNED:
            if re.search(r"\b%s\b" % re.escape(w), clean):
                add("ERROR", "banned-word", who, "banned word %r" % w)
        for w in TIME_ANCHORED:
            if re.search(r"\b%s\b" % re.escape(w), low):
                add("ERROR", "time-anchored", who, "time-anchored word %r" % w)
        for w in TIME_ANCHORED_SOFT:
            if re.search(r"\b%s\b" % re.escape(w), low):
                add("WARN", "time-anchored-soft", who, "check context for %r" % w)

        for href in re.findall(r'href="([^"]+)"', s):
            t = rel_target(href)
            if t:
                if href.startswith("http"):
                    add("ERROR", "absolute-link", who, "summary link must be relative: %s" % href)
                if not os.path.exists(os.path.join(ROOT, t)):
                    add("ERROR", "dead-link", who, "summary link to missing file %s" % t)
            elif not any(h in href for h in EXTERNAL_OK):
                add("WARN", "offsite-link", who, "summary links off-site: %s" % href)

    return issues


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--baseline", default=os.path.join(ROOT, "utils", "validation_baseline.json"))
    ap.add_argument("--write-baseline", action="store_true",
                    help="record current errors as accepted legacy issues")
    args = ap.parse_args()

    try:
        with open(PUBS, encoding="utf-8") as fh:
            entries = json.load(fh)
    except Exception as exc:
        print("ERROR parse: data/publications.json does not parse: %s" % exc)
        return 1
    if not isinstance(entries, list):
        print("ERROR parse: publications.json must be a list")
        return 1

    issues = check(entries)
    errors = [i for i in issues if i.level == "ERROR"]
    warns = [i for i in issues if i.level == "WARN"]

    if args.write_baseline:
        with open(args.baseline, "w", encoding="utf-8") as fh:
            json.dump(sorted("%s|%s|%s" % (i.code, i.where, i.detail) for i in errors), fh, indent=1)
        print("baseline written: %d errors accepted" % len(errors))
        return 0

    baseline = set()
    if os.path.exists(args.baseline):
        with open(args.baseline, encoding="utf-8") as fh:
            baseline = set(json.load(fh))

    live = [i for i in errors if "%s|%s|%s" % (i.code, i.where, i.detail) not in baseline]
    stale = baseline - {"%s|%s|%s" % (i.code, i.where, i.detail) for i in errors}

    by_code = collections.Counter(i.code for i in issues)
    print("%d entries checked — %d errors (%d new), %d warnings" %
          (len(entries), len(errors), len(live), len(warns)))
    for code, n in by_code.most_common():
        lvl = "ERROR" if any(i.code == code and i.level == "ERROR" for i in issues) else "WARN"
        print("  %-5s %-24s %d" % (lvl, code, n))
    for i in live:
        print("ERROR %s: %s — %s" % (i.code, i.where, i.detail))
    if stale:
        print("%d baselined issues no longer occur; rerun --write-baseline" % len(stale))
    return 1 if live else 0


if __name__ == "__main__":
    sys.exit(main())
