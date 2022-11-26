#!/bin/bash
emcc --bind -o src/glue.js \
src/libsamplerate-wrapper.cpp lib/libsamplerate.a \
-s MODULARIZE \
-s EXPORT_ES6=1 \
-s USE_ES6_IMPORT_META=0 \
-s SINGLE_FILE=1 \
-s ENVIRONMENT=web,worker,node \
-s WASM=1 \
-s ASSERTIONS=0 \
-s EXPORT_NAME='LoadSRC' \
-s ALLOW_MEMORY_GROWTH='1' -O3