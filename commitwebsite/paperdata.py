#!/usr/bin/env python

import urllib
import simplejson as json
import re
from commitwebsite import caching
from commitwebsite import config

from functools import reduce
from functools import cmp_to_key


#convertUrl=config.BABELTRANSLATORTOOL
#print "DBDB"
#print convertUrl
#print "DBDB"

#def addBibtexSource(url):
#  global convertUrl
#  convertUrl += "&url="+url

#addBibtexSource(config.URL + "papers.bib")

def p(x):
  print (x)

def getJsonSrc():
  name="paperDataRaw%x" % abs(hash(convertUrl))
  # edwardw 2020-02-17 testing
  # print "DEBUGGING"
  # print repr(name)
  # print "convertUrl", repr(convertUrl)
  src=["papers.bib"]
  generator=lambda: p(urllib.urlopen(convertUrl).read())
  return caching.getCached(name, generator, src)

def getJsonSrc0():
  src=["papers.json"]
  print (src)
  return src

def simplifyPubType(types):
  ltypes=list(map(lambda x: x.lower(), types))
  soundsLike = lambda term: reduce(lambda a,b: a or b, list(map(lambda x: term.lower() in x, ltypes)), False)
  if soundsLike("techreport"):
    return "Technical Report"
  if soundsLike("proceedings"):
    return "Conference Publication"
  if soundsLike("article"):
    return "Journal Article"
  if soundsLike("phd"):
    return "PhD Thesis"
  if soundsLike("science"):
    return "SM Thesis"
  if soundsLike("masters"):
    return "MEng Thesis"
  if soundsLike("thesis"):
    return "Thesis"
  if soundsLike("talk"):
    return "Talk"
  return "Other"

authorRe = re.compile("^(.*), (.*)$")
getDirRe = re.compile('.*mit\\.edu(.*)', re.IGNORECASE)

def fixAuthorName(name):
  name = name.replace(r"{\'{e}}", u"&eacute;") # sub accent
  return authorRe.sub(lambda o: o.group(2)+' '+o.group(1), name)

def collapseAuthors(authors):
  if type(authors) is not type([]):
    return fixAuthorName(authors)
  authors = list(map(fixAuthorName, authors))
  if len(authors) == 1:
    return authors[0]
  return reduce(lambda a,b: a +", "+ b, authors)

def generatePubHtml(item):
  def field(k):
    try:
      return item[k]
    except:
      return ""
  type=field("publication-type")
  if len(field("url"))>0:
    m = getDirRe.match(field("url"))
    if m:
      str  = '<a href="%s" onClick="javascript: pageTracker._trackPageview(\'%s\');">%s</a>' % (field("url"), m.group(1), field("title"))
    else:
      str  = '<a href="%s" onClick="javascript: pageTracker._trackPageview(\'/external/%s\');">%s</a>' % (field("url"), field("url"), field("title"))
  else:
    str  = field("title")
  str += ".<br>"
  str += collapseAuthors(field("author")) + ".<br>"

  str += "<i>"
  if len(field("booktitle"))>0:
    str += field("booktitle")
  elif "Thesis" in type:
    str += type + ", " + field("school")
  elif "Technical Report" in type:
    str += field("number")
  elif len(field("journal"))>0:
    str += field("journal")
  else:
    str += type
  str += ".</i><br>"

  if len(field("address"))>0:
    str += field("address") + ". "
  if 'month' in item:
    str += field("month") + ", "
  if 'year' in item:
    str += field("year") + "."
  if len(field("slides"))>0:
    str += ' <a href="%s">Slides</a>.' % field("slides")
  if 'bibtexKey' in item:
    str += ' <a href="bibtex.cgi?key=%s">Bibtex</a>.' % field("bibtexKey")
  if 'video' in item:
    str += " <a target=\"_blank\" href=\"" + field("video") + "\">Video</a>."
  if len(field("price"))>0:
    str += "<br> <mark>" + field("price") + "</mark>. "
  str+= "<br>"

  return str

switch_month={"Jan":"01", "Feb":"02", "Mar":"03", "Apr":"04", "May":"05", "Jun":"06", "Jul":"07", "Aug":"08", "Sep":"09", "Oct":"10", "Nov":"11", "Dec":"12"}
  

def patchJsonItem(item):
  def field(k):
    try:
      return item[k]
    except:
      return ""

  item['author']=[]
#  item['author']=item['author0'].split('and')
  item['author0']=item['author0'].replace("  "," ")
  item['author0']=item['author0'].replace("  "," ")
#  item['author0']=item['author0'].replace(" and","and")
#  item['author0']=item['author0'].replace("and ","and")
  item['author']=item['author0'].split(' and ')
  item['author']=list(map(fixAuthorName, item['author']))

#  item['type']=["tmp1","tmp2","tmp3"]
  item['type']=["tmp1","tmp2","tmp3"]
  item['type'][0]="Publication"
  item['type'][1]=item['itemType']

  item['label']=item['title']

#  item['date']=" "
  if len(field("year"))>0:
    if len(field("month"))>0:
      item['date']=item['year']+"-"+switch_month[item['month']]
    else:
      item['date']=item['year']

  #split out .type and .pub-type
  if type(item['type']) is type([]) and item['type'][0] == "Publication":
    item['type-original']=item['type']
    item['pub-type']=item['type'][1]
    item['publication-type']=simplifyPubType(item['type'][1:])
    item['type']="Publication"
  if item['type'] == "Publication":
    item['html']=generatePubHtml(item)
  if 'keywords' in item and type(item['keywords']) is not type([]):
    item['keywords']=list(filter(lambda x: len(x)>0, 
                          map(lambda x: x.strip(),
                            item['keywords'].split(','))))
  return item

def patchJsonItem_mod(item):
  #split out .type and .pub-type
  if item['type'] == "inproceedings" or item['type'] == "article" or item['type'] == "incollection":
#  if type(item['itemtype']) is type([]) and item['type'][0] == "Publication":
#    item['type']="Publication"
#    item['type-original']=item['type']
#    item['pub-type']=item['type']
#    item['publication-type']=simplifyPubType(item['type'])
    item['publication-type']=simplifyPubType(item['type'][1:])
#    item['type']="Publication"
#  if item['type'] == "Publication":
#  if item['type'] == "inproceedings":
#  if item['type'] == "inproceedings" or item['type'] == "article":
  if item['type'] == "inproceedings" or item['type'] == "article" or item['type'] == "incollection":
    item['html']=generatePubHtml(item)
  if 'keywords' in item and type(item['keywords']) is not type([]):
    item['keywords']=list(filter(lambda x: len(x)>0, 
                          map(lambda x: x.strip(),
                            item['keywords'].split(','))))
  return item



def patchJsonItem0(item):
  #split out .type and .pub-type
  if type(item['type']) is type([]) and item['type'][0] == "Publication":
    item['type-original']=item['type']
    item['pub-type']=item['type'][1]
    item['publication-type']=simplifyPubType(item['type'][1:])
    item['type']="Publication"
  if item['type'] == "Publication":
    item['html']=generatePubHtml(item)
  if 'keywords' in item and type(item['keywords']) is not type([]):
    item['keywords']=list(filter(lambda x: len(x)>0, 
                          map(lambda x: x.strip(),
                            item['keywords'].split(','))))
  return item


def cmp(a, b):
    return (a > b) - (a < b) 

def itemSorter(a,b):
  aa=""
  bb=""
  if 'date' in a:
    aa=a['date']
  if 'date' in b:
    bb=b['date']
  return cmp(bb,aa)

def patchJsonFile_bak(src):
  #update json src so parser doesn't choke on bad escapes from babel
  src = src.replace("\\'", "'")\
           .replace("\\u00E2\\u0080\\u0093",":")\
           .replace("http://cag.lcs.mit.edu/commit/","http://groups.csail.mit.edu/commit/")

  #convert to python

  # edwardw 2020-02-19 testing
  if True:
    data=json.loads(src)
    #update the items
    data['items']=map(patchJsonItem, data['items'])
    data['items'].sort(itemSorter)
    return data
  else:
    # edwardw 2020-02-19 testing
    print ("TESTING")
    print (repr(src))
    return {}

def patchJsonFile(data):

  # edwardw 2020-02-19 testing
  if True:
    #update the items
    data['items']=list(map(patchJsonItem, list(data['items'])))
    data['items'].sort(key=cmp_to_key(itemSorter))
    return data
  else:
    # edwardw 2020-02-19 testing
    print ("TESTING")
    print (repr(src))
    return {}




#rawPaperItems=lambda: [{"items",{"type":"Publication","booktitle":"bbb","address":"ccc","html":"HHH","title":"aa","url":"bb","author":"cc","school":"ee","number":"ff","journal":"gg","month": 1,"year": 2020,"slides":"pp","pub-type":"ppp","publication-type":"bbb"}},
#        {"items",{"type":"Publication","booktitle":"bbbB","address":"cccC","html":"HHHH","title":"aa","url":"bb3","author":"cc3","school":"ee3","number":"ff3","journal":"g3g","month": 2,"year": 2019,"slides":"pp2","pub-type":"ppp","publication-type":"bbb"}}
#                        ]
#rawPaperItems=[{"items",[{"type":"Publication","booktitle":"bbb","address":"ccc","html":"HHH","title":"aa","url":"bb","author":"cc","school":"ee","number":"ff","journal":"gg","month": 1,"year": 2020,"slides":"pp","pub-type":"ppp","publication-type":"bbb"},
#                      {"type":"Publication","booktitle":"bbbB","address":"cccC","html":"HHHH","title":"aa","url":"bb3","author":"cc3","school":"ee3","number":"ff3","journal":"g3g","month": 2,"year": 2019,"slides":"pp2","pub-type":"ppp","publication-type":"bbb"}
#                    ]}]
#rawPaperItems={"items",[{"type":"Publication","booktitle":"bbb","address":"ccc","html":"HHH","title":"aa","url":"bb","author":"cc","school":"ee","number":"ff","journal":"gg","month": 1,"year": 2020,"slides":"pp","pub-type":"ppp","publication-type":"bbb"},
#                      {"type":"Publication","booktitle":"bbbB","address":"cccC","html":"HHHH","title":"aa","url":"bb3","author":"cc3","school":"ee3","number":"ff3","journal":"g3g","month": 2,"year": 2019,"slides":"pp2","pub-type":"ppp","publication-type":"bbb"}
#                        ]}

#generateJsonText = lambda: p(json.dumps(patchJsonFile(getJsonSrc()), indent=2))
##generateJsonText = lambda: p(json.dumps(patchJsonFile(getJsonSrc()), indent=4))
#generateJsonText = lambda: p(json.dumps(rawPaperItems, indent=4))


#getJsonText = lambda: p(json.dumps(rawPaperItems, indent=4))
#print "getJsonText: "
#print generateJsonText

# edwardw 2020-02-19
####getJsonText = lambda: caching.getCached("paperData%x" % abs(hash(convertUrl)), generateJsonText)
#getJsonText = lambda: caching.getCached("paperData%x" % abs(hash(convertUrl)), rawPaperItems)
#getJsonText = generateJsonText() # lambda: caching.getCached("paperData%x" % abs(hash(convertUrl)), generateJsonText)
#print(generateJsonText)
#print(getJsonText)
##with open('papers.json') as ff:
#  getJsonText = json.load(ff)
##print(getJsonText)

#getJsonText = src=["papers.json"]
####getJsonObject = lambda: json.loads(getJsonText()) 
##print(getJsonObject)


##with open('papers.json') as ff:
##  getJsonObject = json.load(ff)
##print(getJsonObject)





with open('pp.json') as f:
    getJsonObject0x = json.load(f)
getJsonObject = eval(json.dumps(getJsonObject0x))
#getJsonObject0y = json.dumps(getJsonObject0x)
#getJsonObject0 = json.load(getJsonObject0y)

#0615
getJsonObject0b=[{"type":"inproceedings","booktitle":"bbb","address":"ccc","html":"HHH","title":"aa","url":"bb","author":"cc","school":"ee","number":"ff","journal":"gg","month":"1","year":"2020","slides":"pp","pub-type":"ppp","publication-type":"bbb","type-original":"TTT","keywords":"kkk","url":"UUU","key":"goslp"},
        {"type":"article","booktitle":"bbbB","address":"cccC","html":"HHHH","title":"aa","url":"bb3","author":"cc3","school":"ee3","number":"ff3","journal":"g3g","month":"2","year":"2019","slides":"pp2","pub-type":"ppp","publication-type":"bbb","type-original":"TTT","keywords":"kkk","url":"UUU2","key":"gogo"}
                        ]

#print(getJsonObject0)
#print(getJsonObject0['items'])
#print(getJsonObject0b)

#getJsonObject['items']=lambda: map(patchJsonItem, getJsonObject['items'])
patchJsonFile(getJsonObject)

#print(getJsonObject)


getJsonText= lambda: json.dumps(getJsonObject, indent=4)
#getJsonText = lambda: caching.getCached("paperData%x" % abs(hash(convertUrl)), json.dumps(getJsonObject, indent=4))
