#Dockerfile for building libsamplerate
# Run the command to build the docker image before building the library:
# docker build -t gcc-emscripten .
FROM emscripten/emsdk
RUN apt-get update
RUN apt-get install -y build-essential libtool autoconf pkg-config m4