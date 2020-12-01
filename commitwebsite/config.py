#!/usr/bin/env python

import os
cwd = os.getcwd()

DIR="/afs/csail.mit.edu/group/commit/www/data"
URL="http://groups.csail.mit.edu/commit/"

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

