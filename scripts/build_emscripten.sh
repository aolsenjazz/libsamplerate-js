#!/bin/bash
# build the glue.js file for non-worklet contexts. for whatever reason, it seems that
# ENVIRONMENT=node is mutually exclusive with ENVIRONMENT=shell; the generated glue code
# is unable to correctly detect the node environment when build with both environment targets.
# Note that 
emcc --bind -o src/glue.js \
src/libsamplerate-wrapper.cpp lib/libsamplerate.a \
-g0 \
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

# looking up these compilation flags is  pain.
# -g0: remove all DWARF support. reduces file size, at expense of debugging info
# -s ENVIRONMENT=web,worker,shell: For whatever reason, adding node to this export list isn't necessary
# -s WASM=0: don't generate a separate .wasm file
# -s SINGLE_FILE=1: inline the generated wasm so that we don't need to load external wasm
# -s DYNAMIC_EXECUTION=0: Removes `new Function()` and `eval()` calls. Enables tighter CSP
# -s BINARYEN_ASYNC_COMPILATION=0: from the docs: "This is currently required for all but the smallest modules to run in chrome."
# -O3: max optimize