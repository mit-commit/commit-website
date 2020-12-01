#!/usr/bin/env python
import layout
from xml.dom.minidom import parse
import config

def groupBy(groupExtractor, list):
  groups=dict()
  for v in list:
    k = groupExtractor(v)
    if not groups.has_key(k):
      groups[k]=[v]
    else:
      groups[k].append(v)
  return [x for x in groups.iteritems()]

def generate(full):
  #person printers
  short=lambda p: layout.person(p.getAttribute("name"),
                                p.getAttribute("url"))
  long =lambda p: layout.person(p.getAttribute("name"),
                                p.getAttribute("url"),
                                p.getAttribute("title"))

  lastName=lambda name: name.getAttribute("name").split()[-1]
  lastNameCmp=lambda a,b: cmp(lastName(a), lastName(b))

  #format for groups is:
  #(sortRank, groupName, printerFunction)
    
  #format a group for printing
  def personGroupPrinter(groupAndMembers):
    ((sortRank, groupName, printer), people) = groupAndMembers
    people.sort(lastNameCmp)
    return layout.cat(
        layout.h3(groupName),
        layout.personlist(*map(printer, people)))
    
  # The types of people:
  faculty =(1, "Faculty",           short)
  other   =(2, "Researchers",       long)
  grads   =(3, "Graduate Students", short)
  urops   =(4, "UROP/MEng",         long)
  visiting =(5, "Visiting Students",         long)


  # map records to person types
  def groupByType(person):
    title = person.getAttribute("title").lower()
    if "prof" in title:
      return faculty
    if "urop" in title or "meng" in title:
      return urops
    if "grad" in title or "phd" in title or "sm" in title:
      return grads
    if "visiting" in title:
      return visiting
    return other
    
  # map records to person types
  def groupByYear(person):
      year = person.getAttribute("year")
      if len(year)==0:
        return (0, "Unknown", long)
      return (-int(year), year, long)

  def formatPeople(grouper, people):
    groups = groupBy(grouper, people)
    groups.sort()
    return layout.cat(*map(personGroupPrinter, groups))
  
  peoplexml = parse(config.DATADIR+'/people.xml') 
  currentPeople = peoplexml.getElementsByTagName("current")[0] \
                               .getElementsByTagName("person")

  if full:
    alumniPeople = peoplexml.getElementsByTagName("alumni")[0] \
                                 .getElementsByTagName("person")
    groupimg='<img src="images/commit_group-12-19.jpg" alt="The COMMIT Group Members" width=700>'
    commitgroup=layout.imgblock(groupimg)
    return layout.cat(
      layout.section("Current Members", formatPeople(groupByType, currentPeople)),
      commitgroup, 
      layout.section("Alumni", formatPeople(groupByYear, alumniPeople)))
  else:
    return layout.section("Current Members", 
                          formatPeople(groupByType, currentPeople),
                          layout.morelink("Show Alumni", "?page=people"))


generateFull=lambda: generate(True)
generateBrief=lambda: generate(False)



