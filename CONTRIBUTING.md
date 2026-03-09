# Contributing to FinnaFlow

## Versioning Rules
- This project follows [Semantic Versioning (SemVer)](https://semver.org/).
- Update the `VERSION` file and `CHANGELOG.md` with every release.
- **Major**: Breaking changes.
- **Minor**: New features (backwards compatible).
- **Patch**: Bug fixes and documentation (backwards compatible).

## Documentation Guidelines
- Use **TSDoc** (JSDoc for TypeScript) for all exported functions, interfaces, and hooks.
- Components should have a brief description of their purpose and props.
- Complex logic in `src/utils` MUST be commented with edge-case explanations.

## Development Workflow
1. Use `npm run dev` for local development.
2. Ensure all data handling happens in `src/store` or `src/utils` to maintain a clean separation of concerns.
3. All UI styles should use Tailwind CSS classes defined in `tailwind.config.js`.

## Privacy Notice
FinnaFlow is **Offline-First**. DO NOT add dependencies that track user data or send data to external APIs without explicit user consent and an update to the Privacy section in `App.tsx`.
