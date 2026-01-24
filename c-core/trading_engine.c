// Bread Trading Engine - C Core Implementation
#include "trading_engine.h"
#include <string.h>
#include <math.h>
#include <stdlib.h>

// Initialize engine
void engine_init(TradingEngine* engine, float initial_balance) {
    memset(engine, 0, sizeof(TradingEngine));
    engine->balance = initial_balance;
    engine->position.asset_idx = -1;
    engine->last_traded_idx = -1;
}

// Add asset to engine
void engine_add_asset(TradingEngine* engine, const char* symbol, float base_price) {
    if (engine->asset_count >= MAX_ASSETS) return;

    Asset* asset = &engine->assets[engine->asset_count];
    strncpy(asset->symbol, symbol, 7);
    asset->symbol[7] = '\0';
    asset->base_price = base_price;
    asset->current_price = base_price;
    asset->trend = 0.0f;

    // Initialize price buffer
    asset->history.head = 0;
    asset->history.count = 0;
    price_buffer_push(&asset->history, base_price);

    engine->asset_count++;
}

// Circular buffer push
void price_buffer_push(PriceBuffer* buf, float price) {
    buf->prices[buf->head] = price;
    buf->head = (buf->head + 1) % PRICE_HISTORY_SIZE;
    if (buf->count < PRICE_HISTORY_SIZE) buf->count++;
}

// Calculate average of last N prices
float price_buffer_avg(const PriceBuffer* buf, uint8_t count) {
    if (buf->count == 0) return 0.0f;
    if (count > buf->count) count = buf->count;

    float sum = 0.0f;
    uint8_t idx = (buf->head - count + PRICE_HISTORY_SIZE) % PRICE_HISTORY_SIZE;

    for (uint8_t i = 0; i < count; i++) {
        sum += buf->prices[idx];
        idx = (idx + 1) % PRICE_HISTORY_SIZE;
    }

    return sum / count;
}

// Calculate momentum strength
float calculate_momentum(const Asset* asset) {
    if (asset->history.count < 10) return 0.0f;

    float avg = price_buffer_avg(&asset->history, 10);
    return (asset->current_price - avg) / avg;
}

// Find best asset to trade
int8_t find_best_trade(const TradingEngine* engine, float balance) {
    int8_t best_idx = -1;
    // ULTRA strict - only trade VERY strong momentum (60%+ win rate target)
    float best_strength = balance < 2.0f ? 0.015f : (balance < 10.0f ? 0.018f : 0.022f);

    for (uint8_t i = 0; i < engine->asset_count; i++) {
        // Skip last traded if balance > $5
        if (balance > 5.0f && i == engine->last_traded_idx) continue;

        const Asset* asset = &engine->assets[i];
        if (asset->history.count < 10) continue;

        // Check affordability - STRICT filtering
        float size_percent = balance < 2.0f ? 0.70f : (balance < 5.0f ? 0.50f : 0.30f);
        float position_size = balance * size_percent;

        // Skip if stock price > 50% of position size (prevents expensive stock disasters)
        if (asset->current_price > position_size * 0.5f) continue;

        // Skip if we can't afford meaningful position
        if (position_size / asset->current_price < 0.01f) continue;

        float strength = calculate_momentum(asset);

        // Only trade if momentum is STRONG (quality over quantity)
        if (strength > best_strength) {
            best_strength = strength;
            best_idx = i;
        }
    }

    return best_idx;
}

// Open new position
void open_position(TradingEngine* engine, int8_t asset_idx) {
    const Asset* asset = &engine->assets[asset_idx];

    float size_percent = engine->balance < 2.0f ? 0.70f :
                        (engine->balance < 5.0f ? 0.50f :
                        (engine->balance < 10.0f ? 0.30f : 0.15f));

    float size = engine->balance * size_percent;
    if (size < 0.001f) return;

    engine->position.asset_idx = asset_idx;
    engine->position.entry_price = asset->current_price;
    engine->position.size = size;
    engine->position.stop_loss = asset->current_price * 0.985f;  // 1.5% SL (very tight)
    engine->position.take_profit = asset->current_price * 1.045f; // 4.5% TP (3:1 R/R, very achievable)

    engine->last_traded_idx = asset_idx;

    // Record trade
    if (engine->trade_count < MAX_TRADES) {
        Trade* t = &engine->trades[engine->trade_count++];
        strncpy(t->symbol, asset->symbol, 7);
        t->type = 0; // BUY
        t->pnl = 0.0f;
    }
}

// Close position
void close_position(TradingEngine* engine, float exit_price, uint8_t type) {
    if (engine->position.asset_idx < 0) return;

    float pnl = (exit_price - engine->position.entry_price) * engine->position.size;
    engine->balance = fmaxf(0.5f, engine->balance + pnl);

    // Record exit
    if (engine->trade_count < MAX_TRADES) {
        Trade* t = &engine->trades[engine->trade_count++];
        const Asset* asset = &engine->assets[engine->position.asset_idx];
        strncpy(t->symbol, asset->symbol, 7);
        t->type = type; // WIN or STOP
        t->pnl = pnl;
    }

    engine->position.asset_idx = -1;
}

// Update position (check SL/TP)
void update_position(TradingEngine* engine) {
    if (engine->position.asset_idx < 0) return;

    const Asset* asset = &engine->assets[engine->position.asset_idx];
    float current = asset->current_price;

    // Check stop loss
    if (current <= engine->position.stop_loss) {
        close_position(engine, current, 2); // STOP
        return;
    }

    // Check take profit
    if (current >= engine->position.take_profit) {
        close_position(engine, current, 1); // WIN
        return;
    }

    // Trail stop loss
    float pnl_pct = (current - engine->position.entry_price) / engine->position.entry_price;
    if (pnl_pct > 0.02f) {
        float new_stop = current * 0.97f;
        if (new_stop > engine->position.stop_loss) {
            engine->position.stop_loss = new_stop;
        }
    }
}

// Main tick function
void engine_tick(TradingEngine* engine) {
    // Update prices
    for (uint8_t i = 0; i < engine->asset_count; i++) {
        Asset* asset = &engine->assets[i];

        // Update trend (5% chance)
        if ((rand() % 100) < 5) {
            asset->trend = ((float)rand() / RAND_MAX - 0.45f) * 0.008f;
        }

        // Price movement
        float drift = 0.0001f;
        float volatility = ((float)rand() / RAND_MAX - 0.5f) * 0.012f;
        float move = drift + asset->trend + volatility;

        float new_price = asset->current_price * (1.0f + move);

        // Bounds check
        float min_price = asset->base_price * 0.7f;
        float max_price = asset->base_price * 1.5f;
        new_price = fminf(fmaxf(new_price, min_price), max_price);

        asset->current_price = new_price;
        price_buffer_push(&asset->history, new_price);
    }

    // Update existing position
    if (engine->position.asset_idx >= 0) {
        update_position(engine);
    }

    // Find new trade if no position
    if (engine->position.asset_idx < 0 && engine->balance > 0.5f) {
        int8_t best = find_best_trade(engine, engine->balance);
        if (best >= 0) {
            open_position(engine, best);
        }
    }

    engine->tick++;
}
