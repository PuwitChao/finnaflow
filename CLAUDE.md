# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at http://localhost:5173
npm run build     # TypeScript check + Vite production build → dist/
npm run lint      # ESLint strict (--max-warnings 0, must pass clean)
npm run preview   # Preview production build locally
```

There is no test framework. The lint command must pass with zero warnings before committing.

## Architecture

**FinnaFlow** is a privacy-first financial visualization SPA. It is entirely client-side — no backend, no external API calls, all data persisted to `localStorage` under the key `finnaflow-storage` via Zustand's persist middleware.

### Data Flow Pipeline

```
User Input → useFinanceStore (Zustand) → financeEngine.ts (normalize) → Plotly Sankey config → SankeyChart.tsx
```

1. **Input layer**: `src/components/finance/inputs/` — atomic form components for income, expenses, net worth
2. **Store layer**: `src/store/useFinanceStore.ts` — single Zustand store, source of truth for all state
3. **Calculation layer**: `src/utils/financeEngine.ts` — normalizes all frequencies to monthly (Weekly × 4.33, Yearly ÷ 12), builds the Sankey node/link graph, applies projection multipliers
4. **Visualization layer**: `src/components/viz/` — Plotly Sankey chart plus analytics panels (projector, drill-down, insurance audit)

### Projection / Scenario Mode

When `isProjectionMode` is true, the engine applies `categoryMultipliers`, `macroConfig.inflation`, and `macroConfig.marketShock` to produce phantom state for visualization without mutating stored data.

### Key Modules

| Path | Responsibility |
|---|---|
| `src/store/useFinanceStore.ts` | All app state — income, expenses, assets, liabilities, insurance, UI flags |
| `src/utils/financeEngine.ts` | Sankey config generation, normalization, resilience scoring |
| `src/utils/financeMath.ts` | Pure math helpers: `getMonthlyAmount`, `getMonthlySurplus`, `solveForFireDuration` |
| `src/utils/statementParser.ts` | Regex heuristics to extract transactions from K-Bank/SCB/GrabPay pasted text |
| `src/utils/csvProcessor.ts` | CSV import/export |
| `src/i18n/` | English + Thai translation store (`finnaflow-i18n` localStorage key) |
| `src/App.tsx` | Top-level orchestration; currently ~2700 lines — view switching, modal state |

### Resilience Score Tiers

- **Resilient** (green): surplus > 10% of income
- **Strained** (yellow): 0% < surplus ≤ 10%
- **Critical** (red): surplus ≤ 0% (debt financing path)

## Conventions

### State

Use `useFinanceStore` (Zustand) for all global state. Do not introduce React Context or additional stores. State mutations go through store actions, never directly.

### Styling

Tailwind CSS with a custom Apple-inspired design system. Use existing utility classes (`.apple-card`, `.apple-button-secondary`, `.apple-icon-btn`) from `src/index.css`. Dark mode via `dark:` prefix. Do not use arbitrary Tailwind values inside `@apply` rules — PostCSS does not support them.

### i18n

All user-visible strings must use `const { t } = useI18n()` with keys from `src/i18n/en.json` and `src/i18n/th.json`. Both files must stay in sync (315 lines each). Parameter substitution: `t('key', { count: 5 })`.

### TypeScript

Strict mode is enabled. Every exported function and interface requires TSDoc. Prefer explicit prop interfaces above each component over inline types.

### Privacy-First Mandate

No external API calls, no analytics, no tracking — not even with user consent. `statementParser.ts` strips sensitive reference codes from bank statements before any processing.

### Component Pattern

```typescript
import { useFinanceStore } from '../store/useFinanceStore';
import { useI18n } from '../i18n';

interface MyComponentProps {
  type: 'income' | 'expense';
}

export const MyComponent: React.FC<MyComponentProps> = ({ type }) => {
  const store = useFinanceStore();
  const { t } = useI18n();
  return <div className="apple-card">{t('key.path')}</div>;
};
```

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys to GitHub Pages on push to `main`. The Vite base path is `/finnaflow/`. GitHub Pages source must be set to "GitHub Actions" in repo settings. Versioning follows SemVer — bump `VERSION` file and `CHANGELOG.md` with each release.
