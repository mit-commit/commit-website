#!/usr/bin/env python
print "Content-Type: text/plain\n"

# enable debugging
# import cgitb; cgitb.enable()

import cgi
import re

try:
  form=cgi.FieldStorage()
  key = form['key'].value

  #just use a fat old regular expression to find the bibtex entry
  entryre = re.compile('@[a-z ]+[{(] *' + re.escape(key) + r'[ \n]*,([^"})]|["]([^"]|[\\]["])*["])*[})]', re.IGNORECASE | re.DOTALL)

  m = entryre.search(open("papers.bib").read())
  print m.group(0)
except KeyError, e:
  print "ERROR: missing ?key="
  print
  print "If your looking for a list of ALL bibtex entries, that file is called 'papers.bib'."
except:
  print "ERROR: bibtex entry not found"


