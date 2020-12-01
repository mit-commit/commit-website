#!/usr/bin/env python
print "Content-Type: text/plain\n"

# enable debugging
import cgitb; cgitb.enable()

import commitwebsite

print commitwebsite.getPaperJsonText()
#print commitwebsite.getPaperJsonText


