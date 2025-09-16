# WunPub Social Pilot - AI Agent Guide

## Architecture Overview

WunPub is a social media management platform built with React, TypeScript, and Supabase that helps users schedule and manage content across platforms like Twitter/X and LinkedIn.

### Key Components & Data Flow

- **Frontend Stack**: React 18 + TypeScript + Vite + shadcn/ui (Tailwind CSS + Radix UI)
- **State Management**: TanStack Query (React Query) + React Router
- **Backend**: Supabase (PostgreSQL, Row Level Security, Edge Functions)

Core data flows through hooks (`src/hooks/`) that connect UI components to Supabase. Most state management happens through TanStack Query caching with invalidation on mutations.

```tsx
// Example data flow pattern:
// 1. Hook provides data access and mutations
const { posts, createPost } = usePosts(projectId);
// 2. Component uses the hook data and triggers mutations
<PostList posts={posts} onCreatePost={(data) => createPost(data)} />
```

## Project Structure

- **`src/components/`**: UI components organized by domain (posts, projects, templates)
- **`src/hooks/`**: Domain-specific React hooks for data fetching/mutations
- **`src/integrations/supabase/`**: Supabase client config and context provider
- **`src/pages/`**: Page-level components and routing
- **`src/utils/`**: Shared utilities, includes security-critical `tokenSecurity.ts`
- **`supabase/`**: Database migrations, edge functions, and security policies

## Essential Development Workflows

1. **Development Server**: `npm run dev` (Vite dev server with hot reloading)
2. **Testing**: `npm run test` (interactive Vitest) or `./scripts/test.sh full` (linting, type-check, tests)
3. **Production Build**: `npm run build` (optimized) or `npm run build:dev` (development mode)

## Project Conventions

- **TypeScript**: Mandatory for all code, with imports using `@/` path alias
- **Component Organization**: PascalCase filenames with function components
- **Styling**: Tailwind CSS with utility classes in JSX, component styles co-located
- **State Management**: TanStack Query for server state + local React state
- **Security**: Tokens encrypted with AES-GCM in `tokenSecurity.ts` with fallback XOR
- **Supabase Pattern**: Always use Row Level Security with user_id filtering:
```sql
create policy "Users can only view their own data"
  on posts for select
  using (auth.uid() = user_id);
```

## Security Considerations

1. **Token Handling**: Always use `encryptToken`/`decryptToken` from `tokenSecurity.ts` for social API tokens
2. **Environment Variables**: 
   - Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_ENCRYPTION_KEY`
3. **Edge Functions**: Access external APIs only through Supabase edge functions in `supabase/functions/`

## Testing Guidelines

- Write tests near implementation with `*.test.ts` or `*.test.tsx` naming
- Focus on user behavior, not implementation details
- Use mocks configured in `src/test/setup.ts` 
- Example component test pattern:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YourComponent } from "./YourComponent";

test("component performs expected action", async () => {
  render(<YourComponent />);
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```