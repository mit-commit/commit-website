#!/usr/bin/env python

import layout
import aboutsection
import peoplesection
import papersection
import projectsection
import paperdata
import caching

t="Commit: MIT's Compiler Group"


def generate(page, args=None):
  pages = {
          "home" : lambda: layout.page( t,
                                        aboutsection.generateBrief(),
                                        peoplesection.generateBrief(),
                                        projectsection.generateBrief(),
                                        papersection.generateBrief()),

          "projects" :            lambda: layout.page("Projects", projectsection.generateFull()),

          "people" :              lambda: layout.page("People", peoplesection.generateFull()),

          #"publications" :        lambda: layout.page("Publications", papersection.generateFull(args)),
          "publications" :        lambda: layout.exhibitpage("Publications", papersection.generateFull(args)),
          #"publications" : lambda: layout.page("Publications", papersection.generateStatic(args))

          "publications-static" : lambda: layout.page("Publications", papersection.generateStatic(args))
          }
  if pages.has_key(page):
    pages[page]()()
  else:
    print "ERROR: Unknown page"

getPaperJsonText = paperdata.getJsonText
#getPaperJsonText = "ABAB"
