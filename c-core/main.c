// Bread C Core - Benchmark
#include <stdio.h>
#include <string.h>
#include <time.h>
#include "trading_engine.h"

int main() {
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

    // Benchmark
    clock_t start = clock();

    // Run simulation (target $1B)
    while (engine.balance > 0.5f && engine.balance < 1000000000.0f && engine.tick < 10000000) {
        engine_tick(&engine);
    }

    clock_t end = clock();
    double elapsed = (double)(end - start) / CLOCKS_PER_SEC;

    // Find biggest winner/loser
    float best_pnl = 0.0f, worst_pnl = 0.0f;
    char best_sym[8] = "", worst_sym[8] = "";

    for (uint8_t i = 0; i < engine.trade_count; i++) {
        if (engine.trades[i].type != 0) { // Skip BUY records
            if (engine.trades[i].pnl > best_pnl) {
                best_pnl = engine.trades[i].pnl;
                strncpy(best_sym, engine.trades[i].symbol, 7);
            }
            if (engine.trades[i].pnl < worst_pnl) {
                worst_pnl = engine.trades[i].pnl;
                strncpy(worst_sym, engine.trades[i].symbol, 7);
            }
        }
    }

    // Calculate win rate
    uint32_t wins = 0, losses = 0;
    for (uint8_t i = 0; i < engine.trade_count; i++) {
        if (engine.trades[i].type == 1) wins++;
        if (engine.trades[i].type == 2) losses++;
    }

    // Format balance
    const char* balance_str;
    char balance_buf[32];
    if (engine.balance >= 1e9f) {
        snprintf(balance_buf, sizeof(balance_buf), "$%.2fB", engine.balance / 1e9f);
        balance_str = balance_buf;
    } else if (engine.balance >= 1e6f) {
        snprintf(balance_buf, sizeof(balance_buf), "$%.2fM", engine.balance / 1e6f);
        balance_str = balance_buf;
    } else if (engine.balance >= 1e3f) {
        snprintf(balance_buf, sizeof(balance_buf), "$%.2fK", engine.balance / 1e3f);
        balance_str = balance_buf;
    } else {
        snprintf(balance_buf, sizeof(balance_buf), "$%.2f", engine.balance);
        balance_str = balance_buf;
    }

    // Results
    printf("\n");
    printf("═══════════════════════════════════════════\n");
    printf("  BREAD C-CORE BENCHMARK\n");
    printf("═══════════════════════════════════════════\n");
    printf("  Runtime:        %.3f seconds\n", elapsed);
    printf("  Final Balance:  %s (%.0f%% gain)\n", balance_str, (engine.balance - 1.0f) / 1.0f * 100.0f);
    printf("  Trades:         %u (%u wins, %u losses)\n", wins + losses, wins, losses);
    if (wins + losses > 0) {
        printf("  Win Rate:       %.1f%%\n", (float)wins / (wins + losses) * 100.0f);
    }
    if (best_pnl > 0.0f) {
        printf("  Best Trade:     %s (+$%.2f)\n", best_sym, best_pnl);
    }
    if (worst_pnl < 0.0f) {
        printf("  Worst Trade:    %s ($%.2f)\n", worst_sym, worst_pnl);
    }
    printf("  Speed:          %.0f ticks/sec\n", engine.tick / elapsed);
    printf("  Memory:         %zu bytes\n", sizeof(TradingEngine));
    printf("═══════════════════════════════════════════\n");

    return 0;
}
