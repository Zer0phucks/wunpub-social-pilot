# Repository Guidelines

## Project Structure & Module Organization
The app is a Vite + React + TypeScript workspace. Core UI lives in `src/components` and page-level routing in `src/pages`. Domain hooks reside in `src/hooks`, while Supabase wiring is grouped under `src/integrations/supabase`. Shared utilities and types sit in `src/lib` and `src/utils`. Public assets ship from `public/`, and project-wide docs live in `docs/`. Supabase SQL, policies, and seeds are tracked in `supabase/`.

## Build, Test, and Development Commands
Run `npm install` once to sync dependencies. Use `npm run dev` for the Vite dev server and hot reloading. `npm run build` (or `npm run build:dev` for development mode bundles) produces the optimized `dist/` output, while `npm run preview` serves that build locally. Quality gates are handled with `npm run lint`, `npm run test` for interactive Vitest, and `npm run test:ci` for coverage-enabled CI runs. The helper script `./scripts/test.sh full` chains linting, type-checking, and tests for pre-PR validation.

## Coding Style & Naming Conventions
TypeScript is mandatory, with React function components organized using PascalCase filenames. Match the existing two-space indentation, prefer named exports in shared modules, and collapse imports with the `@/` path alias configured in `tsconfig.json`. Tailwind CSS drives styling; keep utility classes sorted logically and co-locate component-specific styles beside their TSX files. ESLint (`eslint.config.js`) enforces the rule set, so resolve warnings before pushing.

## Testing Guidelines
Vitest and Testing Library provide the primary harness, with environment mocks configured in `src/test/setup.ts`. Name specs `*.test.ts` or `*.test.tsx` near the code under test, and cover user-visible behaviours rather than implementation details. Run `npm run coverage` to check statement coverage before major merges and attach HTML reports when debugging regressions.

## Commit & Pull Request Guidelines
Write imperative, descriptive commit subjects (e.g., `Add onboarding hero layout`) and keep bodies focused on rationale or follow-up tasks. Group unrelated changes into separate commits. Pull requests should summarize intent, link relevant issues or roadmap items, and include screenshots or terminal output when UI or CLI flows change. Always confirm lint, type-check, and full test script results in the PR description.

## Environment & Configuration Tips
Local `.env.local` files should define `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; avoid committing secrets. When updating Supabase settings, mirror changes inside `src/integrations/supabase` and the `supabase/` directory so migrations stay reproducible.
