# FinnaFlow Technical Handover (v2.2.0-Alpha)

This document serves as a transition guide for developers maintaining or extending the FinnaFlow codebase following the **Modularization & Documentation Sprint**.

## 🏗️ Architecture Overview

The project has been refactored from a flat structure into a domain-driven modular system.

### Directory Structure
- `src/components/finance/`: Core financial logic and domain components.
  - `inputs/`: Atomic input fields for Income, Expense, Assets, and Liabilities.
  - `modals/`: Feature-heavy overlays (Batch Paste, FIRE Tracker).
  - `net-worth/`: Wealth distribution and insurance audit views.
- `src/components/layout/`: Global UI shell and navigation.
  - `navigation/`: Header, Footer, and Page Switchers.
  - `modals/`: App Guides, Wiki, and the new **Native User Guide**.
- `src/store/`: Centralized state using Zustand with persistence middleware.
- `src/utils/`: Pure utility functions for CSV processing and currency scaling.

## 🧠 Intelligent Ingestion (Heuristic Engine)

The "Batch Paste" feature uses a local regex-based heuristic engine to parse unstructured text. 

- **Logic Location**: `src/components/finance/modals/BatchPasteModal.tsx`
- **Detection Capabilities**: Matches patterns for K PLUS, SCB, and GrabPay.
- **Redaction**: Automatically strips sensitive reference codes and IDs before data reaches the store.

## 🚀 Deployment & CI/CD

The project now uses a **Native GitHub Actions** deployment pipeline. This is more reliable than branch-based methods.

- **Workflow**: `.github/workflows/deploy.yml`
- **Requirement**: GitHub Repository Settings > Pages > Source must be set to **"GitHub Actions"**.
- **Base URL**: The `vite.config.ts` handles the subdirectory hosting (`/finnaflow/`) for GitHub Pages using `import.meta.env.BASE_URL`.

## 🛠️ Maintenance & Technical Debt

1. **CSS Cleaning**: Some legacy CSS in `index.css` could be refactored into Tailwind utility classes.
2. **Standardized Modals**: The project uses a mix of state-driven view switches (App.tsx) and absolute-positioned modals. Future refactoring could unify these into a single Modal Provider.
3. **PWA Assets**: The `public/` directory contains icons generated for the PWA manifest. Ensure these are updated if the brand logo changes.

## 📝 Knowledge Items (KIs)
Refer to the `knowledge/` directory in the application data for distilled summaries of specific complex logic (e.g., Sankey normalization).
