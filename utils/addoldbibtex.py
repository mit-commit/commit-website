#!/usr/bin/env python3
"""
Enrich a JSON list by adding 'oldbibtex' strings looked up from a .bib file.

Each JSON item must have a 'bibtexKey' field. If found in the .bib, the script
adds 'oldbibtex' as a raw BibTeX string for that entry.

Usage:
  python add_oldbibtex.py input.json library.bib output.json
"""

import json
import argparse
from copy import deepcopy

import bibtexparser
from bibtexparser.bwriter import BibTexWriter
from bibtexparser.bibdatabase import BibDatabase


def load_bib_by_key(bib_path: str) -> dict:
    """Load .bib file and return a dict: key -> entry dict."""
    with open(bib_path, "r", encoding="utf-8") as bf:
        db = bibtexparser.load(bf)
    # db.entries is a list of dicts with 'ID' and 'ENTRYTYPE' etc.
    return {entry.get("ID"): entry for entry in db.entries}


def entry_to_bibtex_text(entry: dict) -> str:
    """
    Serialize a single bib entry dict to a raw BibTeX string using bibtexparser.
    """
    db = BibDatabase()
    # Work on a copy to avoid mutating the original
    db.entries = [deepcopy(entry)]

    writer = BibTexWriter()
    # Reasonable writer settings; adjust if you want different formatting
    writer.indent = "  "                 # two-space indent
    writer.comma_first = False           # trailing commas at end of lines
    writer.order_entries_by = None       # keep input order (as much as possible)
    writer.align_values = False          # don't try to align equals signs

    return bibtexparser.dumps(db, writer=writer).strip() + "\n"


def main(json_in: str, bib_path: str, json_out: str):
    # Load JSON list
    with open(json_in, "r", encoding="utf-8") as jf:
        data = json.load(jf)
        if not isinstance(data, list):
            raise ValueError("Input JSON must be a list of objects.")

    # Load bib entries by key
    bib_by_key = load_bib_by_key(bib_path)

    # Enrich
    enriched = []
    missing = 0
    for obj in data:
        if not isinstance(obj, dict):
            enriched.append(obj)
            continue
        key = obj.get("bibtexKey")
        if key and key in bib_by_key:
            obj = dict(obj)  # shallow copy
            obj["oldbibtex"] = entry_to_bibtex_text(bib_by_key[key])
        else:
            missing += 1
        enriched.append(obj)

    # Save
    with open(json_out, "w", encoding="utf-8") as of:
        json.dump(enriched, of, indent=2, ensure_ascii=False)

    # Simple progress info
    total = len(data)
    matched = total - missing
    print(f"Processed {total} items: {matched} matched, {missing} missing.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Add 'oldbibtex' strings to JSON list by looking up keys in a .bib file.")
    ap.add_argument("json_in", help="Path to input JSON list")
    ap.add_argument("bib_file", help="Path to .bib file")
    ap.add_argument("json_out", help="Path to output JSON")
    args = ap.parse_args()
    main(args.json_in, args.bib_file, args.json_out)
