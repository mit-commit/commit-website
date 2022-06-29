#!/bin/sh
set -ex

export PATH="$PWD/obj/racket/bin:$PATH"

OBJ_DIR="$PWD/obj"
BUILD_DIR="$OBJ_DIR/bib2sx-build"

rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR
cd $BUILD_DIR
wget https://github.com/mattmight/bib2sx/archive/fa1de50096a13a48fbc0b3ffe0d91c27177303b7.zip

unzip *.zip
cd bib2sx-*
make
cp bib2sx $OBJ_DIR
