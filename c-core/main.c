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

    // Add all assets from web app (61 total)
    // Indices
    engine_add_asset(&engine, "NAS100", 21500.0f);
    engine_add_asset(&engine, "SP500", 6000.0f);
    engine_add_asset(&engine, "US30", 43800.0f);
    engine_add_asset(&engine, "XAU", 2650.0f);
    engine_add_asset(&engine, "XAG", 31.0f);

    // US50 - Top stocks by market cap
    engine_add_asset(&engine, "AAPL", 243.0f);
    engine_add_asset(&engine, "MSFT", 418.0f);
    engine_add_asset(&engine, "GOOGL", 192.0f);
    engine_add_asset(&engine, "AMZN", 220.0f);
    engine_add_asset(&engine, "NVDA", 140.0f);
    engine_add_asset(&engine, "META", 595.0f);
    engine_add_asset(&engine, "TSLA", 380.0f);
    engine_add_asset(&engine, "BRK", 465.0f);
    engine_add_asset(&engine, "LLY", 785.0f);
    engine_add_asset(&engine, "V", 305.0f);
    engine_add_asset(&engine, "UNH", 520.0f);
    engine_add_asset(&engine, "XOM", 115.0f);
    engine_add_asset(&engine, "JPM", 245.0f);
    engine_add_asset(&engine, "WMT", 95.0f);
    engine_add_asset(&engine, "JNJ", 155.0f);
    engine_add_asset(&engine, "MA", 535.0f);
    engine_add_asset(&engine, "PG", 170.0f);
    engine_add_asset(&engine, "AVGO", 230.0f);
    engine_add_asset(&engine, "HD", 420.0f);
    engine_add_asset(&engine, "CVX", 165.0f);

    // Popular stocks
    engine_add_asset(&engine, "COIN", 265.0f);
    engine_add_asset(&engine, "PLTR", 71.0f);
    engine_add_asset(&engine, "HOOD", 38.0f);

    // Meme coins
    engine_add_asset(&engine, "FARTCOIN", 0.85f);
    engine_add_asset(&engine, "WIF", 1.92f);
    engine_add_asset(&engine, "BONK", 0.00002f);
    engine_add_asset(&engine, "PEPE", 0.000012f);
    engine_add_asset(&engine, "DOGE", 0.31f);
    engine_add_asset(&engine, "SHIB", 0.000021f);

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
