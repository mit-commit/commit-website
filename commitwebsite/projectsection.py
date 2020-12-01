#!/usr/bin/env python
import layout
from xml.dom.minidom import parse
import config

# def projectSorter(a,b):
#   aOrd=a.getAttribute("order")
#   bOrd=b.getAttribute("order")
#   if len(aOrd)==0 and len(bOrd)>0:
#     return 1
#   if len(bOrd)==0 and len(aOrd)>0:
#     return -1
#   if len(aOrd)>0 and len(bOrd)>0:
#     return cmp(int(bOrd), int(aOrd))
#   return 0

def generate(full):
  projxml = parse(config.DATADIR+'/projects.xml') 
  projects = projxml.getElementsByTagName("project")
  n = len(projects)
  title="Projects"
  more=lambda:None
 
  if not full:
    title="Featured Projects"
    projects=filter(lambda x: x.getAttribute("featured")=="1",projects)
    more=layout.morelink('Show all %d projects' % n, "?page=projects")

  #  projects.sort(projectSorter)

  def projectPrinter(proj):
    name  = proj.getAttribute("name")
    url   = proj.getAttribute("url")
    desc  = proj.getAttribute("desc")
    return layout.project(name,url,desc)

  return layout.section(title, 
                        layout.projectlist(*map(projectPrinter, projects)),
                        more)

generateFull=lambda: generate(True)
generateBrief=lambda: generate(False)

