// Autopilot C Core - Benchmark
#include <stdio.h>
#include <time.h>
#include "trading_engine.h"

int main() {
    printf("Autopilot Trading Engine - C Core Benchmark\n");
    printf("============================================\n\n");

    // Initialize engine
    TradingEngine engine;
    engine_init(&engine, 1.0f);

    // Add assets (subset for testing)
    engine_add_asset(&engine, "AAPL", 243.0f);
    engine_add_asset(&engine, "MSFT", 418.0f);
    engine_add_asset(&engine, "GOOGL", 192.0f);
    engine_add_asset(&engine, "NVDA", 140.0f);
    engine_add_asset(&engine, "BONK", 0.00002f);
    engine_add_asset(&engine, "PEPE", 0.000012f);
    engine_add_asset(&engine, "DOGE", 0.31f);

    printf("Assets loaded: %d\n", engine.asset_count);
    printf("Starting balance: $%.2f\n", engine.balance);
    printf("Target: $1,000.00\n\n");

    // Benchmark
    clock_t start = clock();

    // Run simulation
    while (engine.balance > 0.5f && engine.balance < 1000.0f && engine.tick < 100000) {
        engine_tick(&engine);

        // Progress update every 10k ticks
        if (engine.tick % 10000 == 0) {
            printf("Tick %u: Balance $%.2f, Trades: %u\n",
                   engine.tick, engine.balance, engine.trade_count);
        }
    }

    clock_t end = clock();
    double elapsed = (double)(end - start) / CLOCKS_PER_SEC;

    // Results
    printf("\n============================================\n");
    printf("Simulation Complete\n");
    printf("============================================\n");
    printf("Final balance: $%.2f\n", engine.balance);
    printf("Total ticks: %u\n", engine.tick);
    printf("Total trades: %u\n", engine.trade_count);
    printf("Execution time: %.3f seconds\n", elapsed);
    printf("Ticks per second: %.0f\n", engine.tick / elapsed);
    printf("Memory usage: %zu bytes\n", sizeof(TradingEngine));

    // Calculate win rate
    uint32_t wins = 0, losses = 0;
    for (uint8_t i = 0; i < engine.trade_count; i++) {
        if (engine.trades[i].type == 1) wins++;
        if (engine.trades[i].type == 2) losses++;
    }

    if (wins + losses > 0) {
        printf("Win rate: %.1f%% (%u wins, %u losses)\n",
               (float)wins / (wins + losses) * 100.0f, wins, losses);
    }

    printf("\nLast 10 trades:\n");
    uint8_t start_idx = engine.trade_count > 10 ? engine.trade_count - 10 : 0;
    for (uint8_t i = start_idx; i < engine.trade_count; i++) {
        const char* type_str = engine.trades[i].type == 0 ? "BUY" :
                              (engine.trades[i].type == 1 ? "WIN" : "STOP");
        printf("  %s %s", type_str, engine.trades[i].symbol);
        if (engine.trades[i].type != 0) {
            printf(" P&L: $%.2f", engine.trades[i].pnl);
        }
        printf("\n");
    }

    return 0;
}
