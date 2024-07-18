#!/usr/bin/env python3
print ("Content-Type: text/html\n")

#enable debugging
import cgitb; cgitb.enable()

import cgi

#print ("Welcome to commit")

import commitwebsite

form=cgi.FieldStorage()
page = "home"
if 'page' in form:
  page = form['page'].value

commitwebsite.generate(page, form)



