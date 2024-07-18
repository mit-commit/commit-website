#!/usr/bin/env python

import os
import re
from commitwebsite import config
from functools import reduce

def isCrappyBrowser():
  a=os.environ.get("HTTP_USER_AGENT", "N/A")
  if "Opera" in a:
    return False
  return "MSIE 5." in a or "MSIE 6." in a

defaultTitle="COMMIT - MIT's Compiler Group"


FUNCTIONTYPE = type(lambda:None)

# PageGenerator: None -> None
# prints a fragment of the output page

# execute a page generator
def gen(x):
  if type(x) is FUNCTIONTYPE:
    x()
  else:
    print (x) # fallback for other types

# *PageGenerator -> PageGenerator
cat=lambda *gens: reduce(lambda x,y: lambda: gen(x) is gen(y), gens, lambda: None)

# *(*PageGenerator->PageGenerator) -> (*PageGenerator->PageGenerator)
nest=lambda *gens: reduce(lambda x,y: lambda *z: x(y(*z)), gens)

# String, String -> (PageGenerator -> PageGenerator)
def tagGen(name, props=""):
  open="<%s %s>" % (name, props)
  close="</%s>" % name
  return lambda *content: cat(open, cat(*content), close)


div=lambda type: tagGen('div', 'class="%s"' % type)
span=lambda type: tagGen('span', 'class="%s"' % type)
ul=lambda type: tagGen('ul', 'class="%s"' % type)
ol=lambda type: tagGen('ol', 'class="%s"' % type)
li=lambda type: tagGen('li', 'class="%s"' % type)
divlist=lambda *types: nest(*map(div, types))
spanlist=lambda *types: nest(*map(span, types))
h1=tagGen("h1", 'class="sectiontitle"')
h2=tagGen("h2", '')
h3=tagGen("h3", '')

pagewidthbox = divlist("pagewidth", "main")
personlist   = ul("person")
minipublist  = ol("minipub")
minipub      = li("minipub")
sectiontitle = div("sectitle")
sectionbody  = div("secbody")
credits      = div("credits")
sectionend   = div("secend")
publicationbox = div("publication")
beforesec     = div("beforesec")
readmorebox   = div("readmore")
readmorebox  = div("readmore")
aftersec     = div("aftersec")
#block        = divlist("outer","bl","br","tl","tr","inner")
block        = divlist("outer","inner")
imgblock        = divlist("outer", "inner", "imagediv")
projectlist = ul("project")
menubox      = divlist("menu")
menuitemouter = div("menuitem")
menuiteminner = div("menuitemlink")

project = lambda name, url, desc: \
  li("project")(
      h3(external_link(name,url)),
      desc)

def person(name, url="", title=""):
  if len(title)==0:
    return li("person")(external_link(name,url))
  return li("person")( external_link(name,url),'('+title+')')

def link(text, url):
  if len(url)==0:
    return text
  return cat('<a href="%s">' % url, text, '</a>')

getDirRe = re.compile('.*mit\\.edu(.*)', re.IGNORECASE)
def external_link(text, url):
  if len(url)==0:
    return text

  m = getDirRe.match(url)
  if m:
    return cat('<a href="%s" onClick="javascript: pageTracker._trackPageview(\'%s\');">' % (url, m.group(1)), text, '</a>')
  else:
    return cat('<a href="%s" onClick="javascript: pageTracker._trackPageview(\'/external/%s\');">' % (url, url), text, '</a>')


menuitem = lambda name, url: menuitemouter(link(menuiteminner(name),url))

morelink = lambda t, u: readmorebox(link(t,u))

def header(title=defaultTitle, exhibit=False):
  def _headergen():
    print ('<?xml version="1.0"?>')
    print ('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"')
    print ('   "http://www.w3.org/TR/html4/strict.dtd">')
    print ('<html lang="en">')
    print ('<head>')
    print ('<title>'+title+'</title>')
    print ('<meta name="verify-v1" content="5yWrybXN9Cv43YSAgkUp85DcD+zwHvM5EKohkLwBxxg=" />')
    if exhibit:
      #print '<script src="https://api.simile-widgets.org/exhibit/2.2.0/exhibit-api.js" type="text/javascript"></script>'
      print ('<script src="common/exhibit-api.js" type="text/javascript"></script>')
 #     print '<script src="http://api.simile-widgets.org/exhibit/3.0.0/exhibit-api.js" type="text/javascript"></script>'
      print ('<link rel="exhibit/data" href="paperdata.cgi" type="application/json">')
      print ('<link rel="exhibit/data" href="paperdataschema.js" type="application/json">')
    print ('<link rel="stylesheet" type="text/css" href="commit.css?v=06-01-2021-18-51">')
    if isCrappyBrowser():
      print ('<link rel="stylesheet" type="text/css" href="commit-ie6-hacks.css">')
    print ('</head>')
    if exhibit:
      print ('''<body onload="Exhibit.create(null, 'Publication');" ex:exporters="Bibtex">''')
    else:
      print ('<body>')
  return _headergen

footer='''
<script type="text/javascript">
var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
try {
var pageTracker = _gat._getTracker("UA-7325135-1");
pageTracker._trackPageview();
} catch(err) {}</script>
<small style="font-size: 8px"><a href="http://accessibility.mit.edu/">Accessibility</a></small>
</body>
</html>
'''

exhibitCredits=credits("Interactive paper display powered by ",
                       link("Exhibit", "http://www.simile-widgets.org/exhibit/"))

logoimg='<img src="images/commitlogo.png" alt="The COMMIT Group">'
logo=imgblock(logoimg)
 
menu=menubox(
    menuitem("Home",         config.URL),
    menuitem("Projects",     config.URL+"?page=projects"),
    menuitem("People",       config.URL+"?page=people"),
    menuitem("Publications", config.URL+"?page=publications")
    )

section=lambda name, *content: cat(
    beforesec(""),
    block(sectiontitle(h1(name)),
          sectionbody(*content),
          sectionend("")),
    aftersec(""))


exhibitpage=lambda t,*x: \
    cat(header(t, exhibit=True),
        pagewidthbox(
           menu,
           logo,
           *x
        ),
        exhibitCredits,
        footer)

exhibitpage_false=lambda t, *x: \
    cat(header(t, exhibit=True),
        pagewidthbox(
           menu,
           logo,
           *x
        ),
        footer)



page=lambda t, *x: \
    cat(header(t),
        pagewidthbox(
           menu,
           logo,
           *x
        ),
        footer)

