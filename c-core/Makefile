CC = gcc
CFLAGS = -O3 -Wall -Wextra -std=c11 -march=native
LDFLAGS = -lm

TARGET = trading_engine
SOURCES = main.c trading_engine.c
OBJECTS = $(SOURCES:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(OBJECTS) -o $(TARGET) $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJECTS) $(TARGET)

run: $(TARGET)
	./$(TARGET)

# WebAssembly build (requires emscripten)
wasm:
	emcc -O3 main.c trading_engine.c -o trading_engine.js \
		-s WASM=1 \
		-s EXPORTED_FUNCTIONS='["_engine_init","_engine_tick"]' \
		-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]'

.PHONY: all clean run wasm
