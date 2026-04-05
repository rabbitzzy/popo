# Berry's Evolution

A web-based collectible evolution game built with React, TypeScript, and Vite.

## Getting Started

### Development

```bash
npm install
npm run dev
```

The dev server will start at `http://localhost:5174/` (or the next available port).

### Build

```bash
npm run build
npm run preview
```

### Testing

```bash
npm run test
```

## Project Structure

See `TECH_SPEC.md` §4 for the full directory layout.

```
src/
├── data/        # Static game data and type definitions
├── engine/      # Core game logic (battle, AI, progression, etc.)
├── store/       # Zustand global state store
├── screens/     # Top-level screen components
├── components/  # Reusable UI components
└── assets/      # Game sprites and resources
```

## Tech Stack

- **React 18** – UI framework
- **TypeScript 5** – Type safety
- **Vite 5** – Build tool
- **Zustand** – State management
- **Vitest** – Unit testing
- **CSS Modules** – Scoped styling

## Documentation

- `DESIGN.md` – Game design specification
- `USER_STORIES.md` – Player-focused requirements
- `PRD.md` – Product requirements
- `TECH_SPEC.md` – Technical specification
- `IMPL_PLAN.md` – Implementation task breakdown
- `WORKFLOW.md` – Document collaboration pipeline
