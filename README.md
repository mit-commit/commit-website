# Commit Group Website

This repository contains the static files for the COMMIT @ CSAIL website.

## Updating Content

### Add or change a person
- Edit `data/people.xml`.
- Each `<person>` element lists a member with `name`, `title`, and optional `url`.
- Current members live under the `<current>` section.
- Alumni live under `<alumni>` and include a `year` attribute.
- When someone graduates, move their entry to `<alumni>`, change the title to `PhD`, and set the graduation year.

### Add a publication
- Edit `data/publications.json` and append a new object to the list.
- Each publication object should include fields such as `title`, `author0`, `year`, and a unique `bibtexKey`.
- The site reads this JSON directly, so keep the file valid JSON.

### Feature a paper
- Edit `data/featuredpapers.txt`.
- Add the publication's `bibtexKey` (from `publications.json`) on a new line to feature it.
- Remove a key from this list to unfeature the paper.
