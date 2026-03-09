# FinnaFlow

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/PuwitChao/finnaflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

FinnaFlow is a privacy-focused financial visualization tool that aggregates income and expense streams into an interactive Sankey diagram. By mapping cash flow through a centralized "Wallet Hub" into categorized pools, it provides a structural view of personal budgeting based on the 50/30/20 rule.

**Live Instance**: [https://puwitchao.github.io/finnaflow/](https://puwitchao.github.io/finnaflow/)

---

## Project Context

FinnaFlow was developed as a personal free-time project to solve a specific need: a financial tool that is both visually expressive and strictly private. Most existing solutions either require cloud syncing or lack the level of visual intuition provided by Sankey-style data visualization. This project serves as an exploration of Local-First architecture and premium web aesthetics.

## Key Features

- **Local-First Privacy Architecture**: FinnaFlow is a Zero-Server application. Financial data is processed and stored exclusively in the user's browser (Local Storage/IndexedDB). No data is ever transmitted to an external server.
- **Dynamic Cash Flow Visualization**: Real-time rendering of financial pipelines using `react-plotly.js`. The engine handles automatic re-averaging of Weekly, Monthly, and Yearly data into a unified monthly distribution.
- **Scenario Projection (Resilience Engine)**: A dedicated simulation sandbox to stress-test financial resilience against inflation (cost-of-living increases) and market shocks (dividend/investment volatility).
- **Comprehensive Device Support**: Fully responsive layout optimized for iPhone, iPad, and Desktop viewports, incorporating safe-area handling for mobile notched devices.
- **Built-in Documentation**: An integrated Wiki providing guidance on data structures, CSV bulk importing, and the underlying budgeting logic.
- **PWA Capabilities**: Service-worker integration allowing the tool to be installed as a standalone application on supported browsers.

## Technical Implementation

### Core Stack

- **React 18 & TypeScript**: Leveraged for type-safe component logic and efficient UI rendering.
- **Zustand**: Chosen for state management due to its lightweight footprint and native support for middleware (persistence to local storage).
- **Tailwind CSS**: Utilized for the design system, implementing a custom aesthetic inspired by Apple's Human Interface Guidelines (Glassmorphism, soft depth, and Inter typography).
- **Plotly.js**: Powering the Sankey visualization, modified to support dynamic node padding and responsive scaling.

### Architectural Decisions

- **Phantom State Logic**: The simulation mode (Scenario Projector) uses a decoupled state logic. Multipliers and stress-test factors are applied to a derived state, ensuring the user's core financial data remains untampered during "What-If" planning.
- **Normalization Engine**: Every input is normalized to a 4.33-week monthly average or a 12-month yearly average to maintain mathematical consistency across the diagram nodes.
- **i18n Implementation**: Natural language localization for English and Thai, avoiding machine translation in favor of native financial terminology.

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/PuwitChao/finnaflow.git
   cd finnaflow
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

### Production Build

```bash
npm run build
```

## License

Distributed under the MIT License.
