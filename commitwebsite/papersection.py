#!/usr/bin/env python
import os
import layout
import paperdata
import config
from pprint import pprint

def isGoogleBot():
  a=os.environ.get("HTTP_USER_AGENT", "N/A")
  return "Googlebot"    in a \
      or "Yahoo! Slurp" in a \
      or "Teoma"        in a \
      or "MSNBOT"       in a \
      or "livebot"      in a \
      or "msnbot"       in a



def facetHtml(keyword=None):
  if keyword:
    selection='ex:selection="%s"'%keyword
    staticUrl='?page=publications-static&keyword='+keyword
  else:
    selection=''
    staticUrl='?page=publications-static'
  return '''
<table class="facetbox">
<tr>
<td class="facetbox">
<div ex:role="facet" 
     class="facet"
     ex:facetLabel="Text Search"
     ex:facetClass="TextSearch"></div>
<div ex:role="facet" 
     class="facet"
     ex:facetLabel="Year"
     ex:facetClass="Cloud"
     ex:sortDirection="reverse"
     ex:height="160px"
     ex:expression=".year"></div>
<div class="switchversion">
  <a href="'''+staticUrl+'''">Switch to non-interactive version</a></div>
</td><td class="facetbox">
<div ex:role="facet"
     class="facet"
     ex:facetLabel="Publication Type"
     ex:height="75px"
     ex:expression=".publication-type"></div>
<div ex:role="facet"
     class="facet"
     ex:facetLabel="Keywords"
     ex:height="112px"
     '''+selection+'''
     ex:expression=".keywords"></div>
</td><td class="facetbox">
<div ex:role="facet" 
     class="facet"
     ex:facetLabel="Author"
     ex:height="224px"
     ex:expression=".author"></div>
</td></tr></table>
'''



def facetHtml_mod(keyword=None):
  if keyword:
    selection='ex:selection="%s"'%keyword
    staticUrl='?page=publications-static&keyword='+keyword
  else:
    selection=''
    staticUrl='?page=publications-static'
  return '''
<table class="facetbox">
<tr>
<td class="facetbox">
<div ex:role="facet" 
     class="facet"
     ex:facetLabel="Text Search"
     ex:facetClass="TextSearch"></div>
<div ex:role="facet" 
     class="facet"
     ex:facetLabel="Year"
     ex:facetClass="Cloud"
     ex:sortDirection="reverse"
     ex:height="160px"
     ex:expression=".year"></div>
<div class="switchversion">
  <a href="'''+staticUrl+'''">Switch to non-interactive version</a></div>
</td><td class="facetbox">
<div ex:role="facet"
     class="facet"
     ex:facetLabel="Publication Type"
     ex:height="75px"
     ex:expression=".publication-type"></div>
<div ex:role="facet"
     class="facet"
     ex:facetLabel="Keywords"
     ex:height="112px"
     '''+selection+'''
     ex:expression=".keywords"></div>
</td><td class="facetbox">
<div ex:role="facet" 
     class="facet"
     ex:facetLabel="Author"
     ex:height="224px"
     ex:expression=".author"></div>
</td></tr></table>
'''

viewerHtml='''
<div ex:role="collection" ex:itemTypes="Publication"></div>
<div ex:role="exhibit-lens" ex:itemTypes="Publication" class="publication" style="display: none">
   <span ex:content=".html"></span>
</div>
<div ex:role="exhibit-lens" ex:itemTypes="Author" class="author" style="display: none">
   <span ex:control="copy-button" style="float: right"></span>
   <div class="title"><span ex:content=".original-name"></span></div>
   <ol class="publications" ex:content="!author">
       <li ex:content="value"></li>
   </ol>
</div>
<span ex:control="copy-button" style="float: right"></span>
<div ex:role="exhibit-view"
   ex:viewClass="Exhibit.TileView"
   ex:orders=".year"
   ex:directions="descending"
   ex:possibleOrders=".publication-type, .author, .year, .title, .keywords"></div>
'''

viewerHtml0='''
AA
BB
CC
DD
EE
'''




def switchBackText(args):
  if args.has_key('keyword'):
    return '''
    <div class="switchversion">
    <a href="?page=publications&keyword='''+args['keyword'].value+'''">Switch to interactive version</a></div>
    '''
  else:
    return '''
    <div class="switchversion">
    <a href="?page=publications">Switch to interactive version</a></div>
    '''

def generateInteractive(args=dict()):
  if args.has_key("keyword"):
    keyword=args['keyword'].value
  else:
    keyword=None
  '''The interactive version is all done in AJAX'''
  return layout.cat(
    layout.section("Filters",      facetHtml(keyword)),
    layout.section("Publications", viewerHtml))
 

def generateInteractive_mod(args=dict()):
  keyword=None
  '''The interactive version is all done in AJAX'''
  return layout.cat(
    layout.section("Publications", viewerHtml))
 
def generateInteractive_bak(args=dict()):
  return layout.cat(
    layout.section("Publications", viewerHtml))
 

def sortByPaperDate(a,b):
  y1=0
  y2=0
  if a.has_key('date'):
    y1=a['date']
  if b.has_key('date'):
    y2=b['date']
  return cmp(y2, y1)

#CW: original commented
#getPaperItems=lambda: filter(lambda x: x['type']=="Publication", 
#                             paperdata.getJsonObject['items'])
getPaperItems=lambda: filter(lambda x: x['type']=="Publication", 
                             paperdata.getJsonObject['items'])



##getPaperItems=lambda: filter(lambda x: x['type']=="Publication", 
##                             paperdata.getJsonObject())
#getPaperItems=lambda: filter(lambda x: x['itemType']=="inproceedings" or x['itemType']=="article", 

#mod
####getPaperItems=lambda: filter(lambda x: x['type']=="inproceedings" or x['type']=="article" or x['type']=="incollection", 
####                             paperdata.getJsonObject())

#getPaperItems=lambda: [{"type":"Publication","booktitle":"bbb","address":"ccc","html":"HHH","title":"aa","url":"bb","author":"cc","school":"ee","number":"ff","journal":"gg","month": 1,"year": 2020,"slides":"pp","pub-type":"ppp","publication-type":"bbb"},
#                     {"type":"Publication","booktitle":"bbbB","address":"cccC","html":"HHHH","title":"aa","url":"bb3","author":"cc3","school":"ee3","number":"ff3","journal":"g3g","month": 2,"year": 2019,"slides":"pp2","pub-type":"ppp","publication-type":"bbb"}
#                        ]
    
paperListToSection=lambda papers: layout.minipublist(*map(lambda x: layout.minipub(x['html']), papers))

def generateNonInteractive(title, count, args=dict()):
#  print "args: "
#  print args
  papers=getPaperItems()
  n = len(papers)
  papers.sort(sortByPaperDate)
  showall=""
  if args.has_key("keyword"):
    keyword=args['keyword'].value
    def f(x):
      try:
        return keyword in x['keywords']
      except:
        return False
    papers=filter(f, papers)
    title+=" with Keyword "+keyword
  if count>0 and n>count:
    papers=papers[0:count]
    showall=layout.morelink('Show all %d publications' % n, "?page=publications")
  return layout.section(title,
                        paperListToSection(papers),
                        showall)

    

def generateFeatured(keys):
  try:
    papers=getPaperItems()
    n = len(papers)
#    papers.sort(sortByPaperDate)
    keys=filter(lambda x: len(x)>0 and x[0]!="#", map(lambda x: x.strip(), keys))
    keymap = dict()
    for i in xrange(len(keys)):
      keymap[keys[i]]=i
    papers=filter(lambda x: keymap.has_key(x['key']), papers)
    papers.sort(lambda x,y: cmp(keymap[x['key']], keymap[y['key']]))
    return layout.section("Featured Publications",
                          paperListToSection(papers),
                          layout.morelink('Show all %d publications' % n, "?page=publications"))
  except:
    return layout.section("Featured Publications",
                          'internal-error')

    
def generateFeatured_no(keys):
  papers=getPaperItems()
  n = len(papers)
  papers.sort(sortByPaperDate)
  showall=""
  return layout.section("Featured Publications",
                        paperListToSection(papers),
                        showall)



#################

generateBrief=lambda: generateFeatured(open(config.DATADIR+"/featuredpapers.txt"))

def generateStatic(args=dict()):
  return layout.cat(layout.section("Filters", switchBackText(args)),
                    generateNonInteractive("Publications", -1, args))

def generateStatic_bak(args=dict()):
  return layout.cat(generateNonInteractive("Publications", -1, args))


def generateFull(args=dict()):
#  print args
  if isGoogleBot():
    return generateNonInteractive("Publications", -1, args)
  else:
    return generateInteractive(args)



def generateFull_bak(args=dict()):
  #if isGoogleBot():
  #  return generateNonInteractive("Publications", -1, args)
  #else:
  #  return generateNonInteractive("Publications", -1, args)
  return generateNonInteractive("Publications", -1, args)

#
