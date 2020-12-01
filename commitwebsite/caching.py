#/usr/bin/env python
import sys
import os
import config
mtime=lambda f: os.path.getmtime(f)

SOURCES=config.SOURCEFILES
DATA=config.DATAFILES
ALL=config.ALLFILES

outputStack=[sys.__stdout__]

def pushOutput(o):
  outputStack.append(o)
  sys.stdout = outputStack[-1]

def popOutput():
  outputStack.pop().close()
  sys.stdout = outputStack[-1]

def isUpToDate(file, sources):
  try:
    t=mtime(file)
    return len(filter(lambda x: x>=t, map(mtime, sources))) == 0
  except OSError, e:
    return False

def openCached(name, generator, sources=ALL):
  cache="%s/%s.tmp" % (config.CACHEDIR, name)
  if not isUpToDate(cache, sources):
    try:
      pushOutput(open(cache, "w"))
    except e:
      print "ERROR: failed to write new cache file "+cache
      print e
      return
    generator()
    popOutput()
  return open(cache)

def getCached(name, generator, sources=ALL):
  return openCached(name,generator,sources).read()

def printCached(name, generator, sources=ALL):
  print openCached(name,generator,sources).read()

