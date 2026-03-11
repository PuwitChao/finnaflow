# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2026-03-12

### Added

- **🧠 Interactive Intelligence**:
  - **Node Drill-Down**: Interactive Sankey nodes that reveal an itemized breakdown of financial data when clicked.
  - **Smart Budget Nudging**: Logic-based pro-tips implementing the 50/30/20 rule to flag deviations in real-time.
- **🌍 Enhanced Localization**: Detailed Thai and English support for interactive insights and drill-down metadata.

### Fixed

- **Type Safety**: Hardened the `react-plotly.js` type definitions and resolved linting errors in event handling.
- **Interactive UI**: Fixed cursor behaviors and hover states for the visualization layer.

## [1.4.0] - 2026-03-10

### Added

- **📅 Item Expiry (End Date)**: Support for income and expense expiration dates.
  - Automatic marking of expired items in the dashboard list.
  - The projection engine now automatically excludes expired items.
- **💰 Net Worth Tracking**: Comprehensive support for tracking Assets and Liabilities.
  - New **Net Worth Explorer** summary dashboard.
  - Dynamic **Equity Ratio** calculations for wealth health.
  - Side-by-side asset and debt management panels.
- **👯 Quality of Life (QoL)**:
  - Added one-click **Item Duplication** for all financial categories (Flow & Wealth).
  - Integrated **Last Updated Status** in the footer for better session awareness.
- **🏠 Smarter Onboarding**: Updated the initial selection flow for language and currency.

### Changed

- **Roadmap Reconfiguration**: Restructured the roadmap based on current UX research.

## [1.3.0] - 2026-03-09

### Added

- **Apple HI Redesign**: Complete UI overhaul inspired by Apple's Human Interface Guidelines.
  - Glassmorphism effects (`.apple-card`).
  - Standardized `Inter` typography and natural weights.
  - Premium high-contrast color palette using Apple HIG System Colors.
- **📱 Full Responsive Overhaul**: Optimized layout system for Mobile (iPhone) and Tablet (iPad).
  - Bottom-sheet style Projector Panel for mobile screens.
  - Safe-area inset handling for notched devices.
  - Responsive grid systems for inputs and analytics.
- **🌍 Advanced Localization**: Professional English and Thai supporting native terminology.
- **📚 Built-in Wiki**: Integrated documentation hub for CSV bulk imports and resilience logic.
- **Detailed Input Guidance**: Added hint text below labels and tooltips on all header buttons.
- **Enhanced Example Templates**: Expanded datasets to showcase all 5 major financial categories.

### Changed

- **Full Numeric Formatting**: Eliminated all "k" shorthand (e.g., 15k -> 15,000) for better clarity.
- **Localization Audit**: Refined Thai translations for natural flow (e.g., "ต่อเดือน" instead of "รายเดือน").
- **Sankey Layout**: Shortened Thai labels and adjusted padding to prevent text overlap on small screens.
- **Intuitive Terminology**: Switched technical "Pipeline" terms to "Cash Flow" for better user accessibility.
- **Punctuation Standard**: Removed all em dashes (`—`) throughout the application copy.

### Fixed

- **PostCSS Build Error**: Resolved issue with Tailwind arbitrary values in `@apply` shadow declarations.
- **Thai Diagram Overlap**: Fixed Sankey visualization overlap issues on mobile viewports.
- **Linting Compliance**: Fixed 100% of ESLint errors related to unused imports and variables.
- **Deployment logic**: Configured `base: './'` in Vite for seamless GitHub Pages hosting.
- **Security Audit**: Removed internal `.bat` and utility files from public repository.

## [1.2.0] - 2026-01-25

### Added

- **Scenario Projector**: Interactive "What-If" planning hub to simulate financial changes with real-time Sankey animations.
- **Agent Orchestration**: Integrated high-speed workflows for Automated Feature Implementation, Review/Debug, and System Integration.
- **Phantom State Logic**: Decoupled projection state from core financial data for safe simulation.

## [1.1.0] - 2026-01-18

## [1.0.0] - 2026-01-16

### Added

- Initial release of FinnaFlow.
- Privacy-first financial visualizer with local storage persistence.
- Sankey diagram visualization using `react-plotly.js`.
- "Needs", "Wants", and "Savings" categorization.
- Automated Surplus (Savings -> Unallocated) and Deficit (Debt -> Wallet) logic.
- PWA support.
- Simulated premium unlock gate.
- Content-rich SEO footer.
