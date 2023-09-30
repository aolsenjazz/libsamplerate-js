#!/bin/bash
# build the glue.js file for non-worklet contexts. for whatever reason, it seems that
# ENVIRONMENT=node is mutually exclusive with ENVIRONMENT=shell; the generated glue code
# is unable to correctly detect the node environment when build with both environment targets.
# Note that 
emcc --bind -o src/glue.js \
src/libsamplerate-wrapper.cpp lib/libsamplerate.a \
-g \
--extern-post-js src/post.js \
-s MODULARIZE \
-s EXPORT_ES6=1 \
-s USE_ES6_IMPORT_META=0 \
-s ENVIRONMENT=web,worker,shell \
-s SINGLE_FILE=1 \
-s WASM=0 \
-s DYNAMIC_EXECUTION=0 \
-s ASSERTIONS=0 \
-s BINARYEN_ASYNC_COMPILATION=0 \
-s EXPORT_NAME='LoadSRC' \
-s ALLOW_MEMORY_GROWTH='1' -O3