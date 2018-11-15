CC=g++
CFLAGS=-std=c++11 `root-config --cflags --glibs`


fitHistogram: fitHistogram.cc
	$(CC) $^ -o ../bin/$@ $(CFLAGS)

