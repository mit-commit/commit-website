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
- Edit `data/publications.json` and append a new object to the list. See existing JSON to further configure the entry.
- Add a new paper/presentation to the files in the correct year
- In the JSON entry, add a link to pdf/presentation. Note that existing links to the old site are converted to links to the new site, but links to the new site are preferable. 

### Feature a paper
- Add `"featured" : true` to the json for a publication
- OR add a `"price" : "Award"` to the json for a publication.
- Featured publications are ordered by date.
