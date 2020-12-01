#!/usr/bin/env python
print "Content-Type: text/html\n"

# enable debugging
import cgitb; cgitb.enable()

import cgi
import commitwebsite

form=cgi.FieldStorage()
page = "home"
if form.has_key('page'):
  page = form['page'].value

commitwebsite.generate(page, form)

