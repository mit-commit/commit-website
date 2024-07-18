#!/usr/bin/env python3
print ("Content-Type: text/plain\n")

# enable debugging
import cgitb; cgitb.enable()

import commitwebsite

print (commitwebsite.getPaperJsonText())
#print commitwebsite.getPaperJsonText


