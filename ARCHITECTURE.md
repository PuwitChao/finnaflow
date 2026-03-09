# System Architecture - FinnaFlow 🏗️

This document outlines the technical design, data flow, and architecture of the FinnaFlow application.

## 1. Overview

FinnaFlow is built as a single-page application (SPA) using a modern "Local-First" architecture. All processing and data storage occur on the client side, ensuring maximum privacy and performance.

## 2. Technical Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | [React](https://reactjs.org/) | Component-based UI with efficient rendering. |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Static typing for reliable financial calculations. |
| **State** | [Zustand](https://github.com/pmndrs/zustand) | Lightweight, hook-based state management with easy persistence. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Rapid, utility-first CSS for a **Premium Apple-inspired** design feel. |
| **Visualization** | [Plotly.js](https://plotly.com/javascript/) | Robust engine for complex Sankey diagram rendering. |
| **Build/Dev** | [Vite](https://vitejs.dev/) | Ultra-fast build tool and development server. |

## 3. Data Flow

### State Management
The application uses a centralized store (`useFinanceStore`) to manage:
- **Income Items**: Array of objects containing name, amount, and frequency.
- **Expense Items**: Array of objects containing name, amount, frequency, and **Category** (Extensible string-based tagging including Needs, Wants, Savings, Investments, Debt, or Custom titles).
- **Global Settings**: Dark mode toggle, internationalization preferences, and premium status.

### Persistence
The Zustand `persist` middleware automatically syncs the state to the browser's `localStorage` under the key `finnaflow-storage`.

### Financial Calculation Logic & Pipeline

FinnaFlow processes data through a multi-stage pipeline to transform user inputs into interactive visualizations:

1.  **Normalization Layer (`normalizeToMonthly`)**:
    *   Incoming data from the `useFinanceStore` is normalized to a common monthly denominator.
    *   *Weekly*: Amount × 4.33
    *   *Monthly*: Amount × 1.0
    *   *Yearly*: Amount ÷ 12

2.  **Projection Layer (Scenario Analysis)**:
    *   If `isProjectionMode` is active, the engine applies `categoryMultipliers` to each item.
    *   `ProjectedAmount = NormalizedBase * Multiplier`
    *   This allows real-time "What-If" simulations without mutating the underlying data (Calculated on-the-fly).

3.  **Aggregation & Hubbing**:
    *   Income items are totaled into the **Total Wallet** (Central Hub).
    *   Expenses are grouped by **Category** to create mid-level flow hubs (Needs, Wants, etc.).
    *   **Surplus/Deficit Logic**:
        *   `Income > Expenses`: Differential flows into the **Unallocated Surplus** node.
        *   `Expenses > Income`: Differential flows from **Debt Source** into the Wallet.

4.  **Graph Transformation (`SankeyData`)**:
    *   Nodes are dynamically generated based on active items and categories.
    *   Links are created with semantic transparency levels (higher transparency for individual item links, lower for hub links).
    *   **Insight Calculation**: Percentages are calculated relative to total monthly income for hover tooltips.

5.  **Visual Rendering (Plotly Engine)**:
    *   The `SankeyChart` component receives the structured data.
    *   Transitions (500ms easing) are applied between state changes for a fluid experience.

## 4. Component Structure

```text
src/
├── components/
│   ├── layout/         # Shell, Header, Footer (SEO optimized)
│   ├── monetization/   # Premium gate and pricing cards
│   └── viz/            # Sankey diagram and data input forms
├── store/
│   └── useFinanceStore.ts # Central logic and state
├── i18n/               # Translation files (EN/TH)
├── utils/              # Calculation helpers and export/import logic
└── types/              # Shared TypeScript interfaces
```

## 5. Security & Privacy

Since FinnaFlow is a privacy-first tool:
- **Zero Backend**: No financial data is ever sent to a server.
- **Local JSON**: Export/Import is handled via local file downloads, not cloud storage.
- **PWA Isolation**: The app runs in a sandboxed environment on the user's device.

## 6. Future Extensibility

The architecture is designed to support:
- Multiple currency support.
- Real-time exchange rate fetching.
- PDF Report generation.

## 7. Implementation: Scenario Projector
### Data Layer
- `useFinanceStore` will hold `categoryMultipliers: Record<string, number>`.
- `isProjectionMode: boolean` to toggle the view.

### UI Layer
- `ProjectorPanel`: Floating control hub with sliders for each unique category.
- `DeltaHUD`: Real-time display of "Projected Surplus" vs "Actual Surplus".

### Visualization
- `SankeyChart` will utilize Plotly's `animate` capabilities to transition between states.

## 8. Resilience Engine (Stress Testing)
### Macro Logic
- **Inflation Impact**: Global multiplier `(1 + inflation)` applied to all expense items.
- **Market Impact**: Global multiplier `(1 - marketShock)` applied to income items tagged as "Investments" or "Dividends".

### Verdict System
The engine evaluates the "Projected Surplus" to return a physical health score:
1. **Resilient (Green)**: Surplus > 10% of income. 🛡️
2. **Strained (Yellow)**: Surplus > 0% but < 10%. ⚠️
3. **Critical (Red)**: Surplus <= 0%. 🚨 (Triggers "Debt Financing" node)
