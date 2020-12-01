#!/usr/bin/env python

import os
cwd = os.getcwd()

# edwardw: we might be able to just get away with cwd here?
#DIR="/afs/csail.mit.edu/group/commit/www/data"
DIR=cwd
# Use the real Host header if possible
HTTP_HOST=os.environ.get("HTTP_HOST", "groups.csail.mit.edu")
URL="http://" + HTTP_HOST + "/commit/"

#BABELTRANSLATORTOOL="http://simile.mit.edu/babel/translator?reader=bibtex&writer=exhibit-json"
##BABELTRANSLATORTOOL="http://service.simile-widgets.org/babel/translator?reader=bibtex&writer=exhibit-json"

if cwd.endswith("/dev"):
  DIR+="/dev"
  URL+="dev/"

CACHEDIR=DIR+"/cache"
MODULEDIR=DIR+"/commitwebsite"
DATADIR=DIR
WEBDIR=DIR

SOURCEFILES=map(lambda x: MODULEDIR+"/"+x, [
       "aboutsection.py",
       "caching.py",
       "config.py",
       "__init__.py",
       "layout.py",
       "paperdata.py",
       "papersection.py",
       "peoplesection.py",
       "projectsection.py"
    ])+map(lambda x: WEBDIR+"/"+x, [
        "bibtex.cgi",
        "index.cgi",
        "paperdata.cgi",
    ])

DATAFILES=map(lambda x: DATADIR+"/"+x, [
   "papers.bib",
   "people.xml",
   "projects.xml",
   "featuredpapers.txt"
  ])

ALLFILES=SOURCEFILES+DATAFILES

