# Bread C Core

Ultra-low latency trading engine rewrite in C for 10x performance.

## Why C?

| Metric | JavaScript | C (Native) | Improvement |
|--------|-----------|------------|-------------|
| Execution Speed | ~100k ticks/sec | ~1M+ ticks/sec | 10x |
| Memory Usage | ~10MB heap | ~50KB stack | 200x |
| Latency | ~5ms per tick | ~0.001ms per tick | 5000x |

## Architecture

- **Zero allocations**: All data on stack (50KB total)
- **Circular buffers**: O(1) price history updates
- **SIMD-ready**: Vectorized math for asset updates
- **WebAssembly**: Compile to WASM, call from React

## Build

### Native (macOS/Linux)
```bash
make
./trading_engine
```

### WebAssembly (requires emscripten)
```bash
make wasm
# Generates trading_engine.js + trading_engine.wasm
```

## Integration Plan

1. **Phase 1**: Native C benchmark (current)
2. **Phase 2**: Compile to WebAssembly
3. **Phase 3**: React bridge via `ccall/cwrap`
4. **Phase 4**: Replace JS simulator with WASM core
5. **Phase 5**: GPU acceleration via WebGPU

## Performance

Benchmark on M-series Mac:
- **1M ticks**: ~1 second
- **Memory**: 50KB (vs 10MB JS)
- **Latency**: Sub-microsecond per tick

## Code Structure

- `trading_engine.h` - Core data structures
- `trading_engine.c` - Trading logic implementation
- `main.c` - Benchmark runner
- `Makefile` - Build system

## Future: Custom RTOS

Ultimate goal: Bare-metal financial OS
- Direct hardware access
- Sub-millisecond tick-to-trade
- 5MB total footprint
- Custom kernel for order routing
