#!/bin/bash
docker run --rm -u $(id -u):$(id -g) -v "$PWD":/src -w /src emscripten/emsdk scripts/build_emscripten.sh