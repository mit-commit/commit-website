#!/usr/bin/env python
import layout

title="About Us"

text='''
Commit (<b>Com</b>pilers at <b>MIT</b>) is a research group led by 
Professor Saman Amarasinghe in the CSAIL research lab at MIT.
The primary motivation of the Commit group is to discover novel
approaches to improve the performance of modern computer systems without
unduly increasing the complexity faced by application developers, compiler
writers, or computer architects.'''

generateFull = generateBrief = lambda: layout.section(title, text)

#<p />
