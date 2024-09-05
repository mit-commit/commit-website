#!/usr/bin/env python3
print("Content-Type: text/plain\n")

# enable debugging
# import cgitb; cgitb.enable()

import cgi
import re

try:
    form = cgi.FieldStorage()
    key = form['key'].value

    # Use a regular expression to find the bibtex entry
    entryre = re.compile(r'@[a-z ]+[{(] *' + re.escape(key) + r'[ \n]*,([^"})]|["]([^"]|[\\]["])*["])*[})]', re.IGNORECASE | re.DOTALL)

    with open("papers.bib") as file:
        m = entryre.search(file.read())

    if m:
        print(m.group(0))
    else:
        print("ERROR: bibtex entry not found")

except KeyError as e:
    print("ERROR: missing ?key=")
    print()
    print("If you're looking for a list of ALL bibtex entries, that file is called 'papers.bib'.")
except Exception as e:
    print("ERROR: bibtex entry not found")

