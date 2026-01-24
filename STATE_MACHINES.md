# Bread State Machine Diagrams

This document maps out all component state transitions to verify correctness at a systems level.

## 1. Trading Simulator State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: Initial State (balance=$1)

    Idle --> Scanning: User clicks START
    Scanning --> PositionOpen: Found momentum signal
    Scanning --> Scanning: No signal / wait for tick

    PositionOpen --> CheckPnL: Each tick update
    CheckPnL --> StopLoss: Price <= stop
    CheckPnL --> TakeProfit: Price >= target
    CheckPnL --> TrailingStop: Update stop if +2% unrealized

    StopLoss --> Scanning: Close position, update balance
    TakeProfit --> Scanning: Close position, update balance
    TrailingStop --> CheckPnL: Continue monitoring

    Scanning --> Success: Balance >= $1B
    Scanning --> Failure: Balance <= $0.50

    Success --> [*]
    Failure --> [*]

    note right of Scanning
        Filters:
        - Skip lastTraded symbol (if balance > $5)
        - Min 10 price points
        - Momentum >= threshold
        - Affordable (price/positionSize check)
    end note

    note right of PositionOpen
        Position sizing:
        - <$2: 70% of balance
        - <$10: 30%
        - <$100: 15%
        - >=: 8%
    end note
```

## 2. Live Price Update State Machine

```mermaid
stateDiagram-v2
    [*] --> Init: Load default assets

    Init --> Fetching: Trigger API call
    Fetching --> Success: Data received
    Fetching --> Retry: Error (429, timeout, etc)

    Retry --> Fetching: Backoff timer expires
    Retry --> Failed: Max retries exceeded

    Success --> DeltaCheck: Compare with previous
    DeltaCheck --> Update: |ΔP| > threshold (0.5%)
    DeltaCheck --> Skip: |ΔP| <= threshold

    Update --> Cache: Store new price + timestamp
    Skip --> Cache: Keep previous price

    Cache --> Waiting: Start interval timer
    Waiting --> Fetching: Timer triggers (60s)

    Failed --> [*]: Display error to user

    note right of DeltaCheck
        Delta-Threshold Algorithm:
        Only update UI if price
        change > 0.5% to save
        bandwidth (70% reduction)
    end note
```

## 3. Polymarket Integration State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: Component mount

    Idle --> Fetching: usePolymarket hook triggers
    Fetching --> Parsing: Raw API response
    Parsing --> Filtering: Apply category filters

    Filtering --> HighProb: showHighProb=true
    Filtering --> AllMarkets: showHighProb=false

    HighProb --> Display: P >= 0.90 or P <= 0.10
    AllMarkets --> Display: All matching category

    Display --> Hover: Mouse enter market card
    Hover --> Tooltip: Show details overlay
    Tooltip --> Display: Mouse leave

    Display --> Refresh: User clicks refresh
    Refresh --> Fetching

    Display --> CategorySwitch: User changes filter
    CategorySwitch --> Filtering

    note right of Filtering
        Categories:
        - Politics
        - Sports
        - Crypto
        - Pop Culture
        - Science
        - Business
    end note
```

## 4. Monte Carlo Simulation State Machine

```mermaid
stateDiagram-v2
    [*] --> Input: User selects symbol

    Input --> FetchParams: Get price, history
    FetchParams --> CalcDrift: μ = auto-parameterized
    FetchParams --> CalcVol: σ = historical variance

    CalcDrift --> Simulate: Both ready
    CalcVol --> Simulate: Both ready

    Simulate --> Path1: GBM iteration (path 1/5000)
    Simulate --> Path2: GBM iteration (path 2/5000)
    Simulate --> PathN: GBM iteration (path N/5000)

    Path1 --> Aggregate
    Path2 --> Aggregate
    PathN --> Aggregate

    Aggregate --> Percentiles: Calculate P5, P50, P95
    Percentiles --> Display: Show bull/base/bear scenarios

    Display --> [*]: User sees results

    note right of Simulate
        GBM Formula:
        S_t = S_{t-1} × exp(
            (μ - σ²/2)Δt + σ√Δt × Z
        )
        Where Z ~ N(0,1)
    end note
```

## 5. News Widget State Machine

```mermaid
stateDiagram-v2
    [*] --> Loading: Initial mount

    Loading --> FetchAPI: Call /api/news
    FetchAPI --> Success: 200 OK
    FetchAPI --> Error: 4xx/5xx

    Error --> Retry: Auto-retry after 5s
    Retry --> FetchAPI
    Error --> Display: Show error banner

    Success --> RenderGrid: Display article cards
    RenderGrid --> Idle: User scrolling

    Idle --> Hover: Mouse enters card
    Hover --> ImageExpand: Show thumbnail
    ImageExpand --> Idle: Mouse leaves

    Idle --> Search: User types query
    Search --> FetchAPI: New search params

    Idle --> LoadMore: Scroll reaches bottom
    LoadMore --> FetchAPI: page += 1, append=true

    Idle --> Refresh: 5min timer expires
    Refresh --> FetchAPI

    note right of FetchAPI
        Cache: 5min stale-while-revalidate
        Pagination: 6 articles per page
        Sources: NewsAPI.org
    end note
```

## 6. Weather Widget State Machine

```mermaid
stateDiagram-v2
    [*] --> GeoRequest: Component mount

    GeoRequest --> GetCoords: navigator.geolocation
    GetCoords --> FetchWeather: Coords received
    GetCoords --> Default: Denied/unavailable

    Default --> FetchWeather: Use default coords

    FetchWeather --> ParseData: API success
    FetchWeather --> Error: API failure

    ParseData --> Display: Show temp, condition
    Display --> [*]

    Error --> [*]: Show fallback UI
```

## 7. Global App State Flow

```mermaid
stateDiagram-v2
    [*] --> Mount: App loads

    Mount --> InitTheme: Check localStorage dark mode
    Mount --> InitData: Fetch live prices
    Mount --> InitPolymarket: Fetch markets

    InitTheme --> Ready
    InitData --> Ready
    InitPolymarket --> Ready

    Ready --> SimulatorTab: User clicks simulator
    Ready --> MarketsTab: User clicks markets
    Ready --> MonteCarloTab: User clicks analysis

    SimulatorTab --> Running: START pressed
    Running --> SimulatorTab: STOP/RESET pressed

    MarketsTab --> MarketDetail: User hovers market
    MarketDetail --> MarketsTab: Mouse leaves

    MonteCarloTab --> SimRunning: RUN pressed
    SimRunning --> MonteCarloTab: Complete

    note right of Ready
        Keyboard shortcuts:
        - S: Start/Stop simulator
        - R: Reset simulator
        - P: Toggle performance mode
        - T: Toggle $1T target
    end note
```

## Component Dependencies

```
App.jsx
├── useLivePrices()          → Delta-Threshold updates
├── usePolymarket()          → Market data
├── useStocks()              → Historical data
├── useStockHistory()        → Chart data
├── NewsWidget               → Real-time news
├── WeatherWidget            → Location-based weather
└── Trading Simulator        → Autonomous trading bot

Utils:
├── runMonteCarlo()          → Simulation engine
├── formatPrice()            → Display formatting
├── calcFibTargets()         → Position sizing
└── getTheme()               → Dark/light mode
```

---

## State Invariants

### Trading Simulator
- **Invariant 1**: `balance > 0.5 AND balance < target` while running
- **Invariant 2**: Only ONE position open at a time
- **Invariant 3**: `size <= balance × sizePercent`
- **Invariant 4**: `stop < entry < target`

### Live Prices
- **Invariant 1**: `lastUpdated <= now()`
- **Invariant 2**: `|ΔP| > 0.005 → UI update`
- **Invariant 3**: Max 1 API call per asset per 60s

### Polymarket
- **Invariant 1**: `0 <= probability <= 1`
- **Invariant 2**: Filtered markets ⊆ All markets
- **Invariant 3**: `highProb → (P >= 0.90 OR P <= 0.10)`

---

**Last Updated**: 2026-01-10
