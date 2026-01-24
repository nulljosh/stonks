// Bread Trading Engine - C Core
// Ultra-low latency implementation for WebAssembly compilation
#ifndef TRADING_ENGINE_H
#define TRADING_ENGINE_H

#include <stdint.h>
#include <stdbool.h>

#define MAX_ASSETS 64
#define PRICE_HISTORY_SIZE 30
#define MAX_TRADES 100

// Circular buffer for price history
typedef struct {
    float prices[PRICE_HISTORY_SIZE];
    uint8_t head;
    uint8_t count;
} PriceBuffer;

// Asset metadata
typedef struct {
    char symbol[8];
    float base_price;
    float current_price;
    PriceBuffer history;
    float trend;
} Asset;

// Position
typedef struct {
    int8_t asset_idx;  // -1 if no position
    float entry_price;
    float size;
    float stop_loss;
    float take_profit;
} Position;

// Trade record
typedef struct {
    char symbol[8];
    float pnl;
    uint8_t type;  // 0=BUY, 1=WIN, 2=STOP
} Trade;

// Engine state
typedef struct {
    Asset assets[MAX_ASSETS];
    uint8_t asset_count;

    Position position;
    Trade trades[MAX_TRADES];
    uint8_t trade_count;

    float balance;
    uint32_t tick;
    int8_t last_traded_idx;
} TradingEngine;

// Core functions
void engine_init(TradingEngine* engine, float initial_balance);
void engine_add_asset(TradingEngine* engine, const char* symbol, float base_price);
void engine_tick(TradingEngine* engine);
void price_buffer_push(PriceBuffer* buf, float price);
float price_buffer_avg(const PriceBuffer* buf, uint8_t count);
float calculate_momentum(const Asset* asset);
int8_t find_best_trade(const TradingEngine* engine, float balance);
void open_position(TradingEngine* engine, int8_t asset_idx);
void close_position(TradingEngine* engine, float exit_price, uint8_t type);
void update_position(TradingEngine* engine);

#endif
