#!/bin/bash
export PKG_CONFIG_PATH=/usr/lib/pkgconfig
cdw=`pwd`
cd libsamplerate
make clean
./autogen.sh 
emconfigure ./configure \
--enable-static \
--disable-shared
emmake make
cd $cdw
mv libsamplerate/src/.libs/libsamplerate.a lib/libsamplerate.a