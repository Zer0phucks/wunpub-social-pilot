# Testing Guide

## Overview

This project uses **Vitest** as the test runner with **React Testing Library** for component testing. Our testing strategy focuses on user behavior rather than implementation details.

## Quick Start

```bash
# Run all tests
npm test

# Run tests with coverage
npm run coverage

# Run tests in watch mode
npm run test:watch

# Run tests for CI/CD
npm run test:ci

# Open coverage report in browser
npm run coverage:html

# Run tests with UI
npm run test:ui
```

## Test Structure

### Test File Organization

```
src/
├── components/
│   ├── __tests__/
│   │   └── ComponentName.test.tsx
│   └── ComponentName.tsx
├── hooks/
│   ├── __tests__/
│   │   └── useHookName.test.tsx
│   └── useHookName.tsx
├── utils/
│   ├── __tests__/
│   │   └── utilityName.test.ts
│   └── utilityName.ts
└── test/
    └── setup.ts
```

### Naming Conventions

- Test files: `ComponentName.test.tsx` or `functionName.test.ts`
- Test descriptions: Use descriptive strings starting with "should"
- Test groups: Use `describe()` blocks for organizing related tests

## Testing Patterns

### Component Testing

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyComponent } from "../MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("should handle user interaction", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);

    expect(screen.getByText("Button clicked")).toBeInTheDocument();
  });
});
```

### Hook Testing

```tsx
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMyHook } from "../useMyHook";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe("useMyHook", () => {
  it("should return initial state", () => {
    const { result } = renderHook(() => useMyHook(), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
```

### Utility Function Testing

```typescript
import { describe, it, expect } from "vitest";
import { myUtilityFunction } from "../myUtilityFunction";

describe("myUtilityFunction", () => {
  it("should return expected result for valid input", () => {
    const result = myUtilityFunction("valid input");
    expect(result).toBe("expected output");
  });

  it("should handle edge cases", () => {
    expect(() => myUtilityFunction(null)).toThrow("Invalid input");
  });
});
```

## Mocking Strategies

### External Dependencies

```typescript
// Mock external libraries
vi.mock("@clerk/clerk-react", () => ({
  useUser: vi.fn(),
  useAuth: vi.fn(),
}));

// Mock custom hooks
vi.mock("../useCustomHook", () => ({
  useCustomHook: vi.fn(),
}));
```

### Supabase Provider

```typescript
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(),
      })),
    })),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
};

vi.mock("@/integrations/supabase/SupabaseProvider", () => ({
  useSupabase: vi.fn(() => mockSupabase),
}));
```

## Best Practices

### 1. Test User Behavior, Not Implementation

❌ **Bad:** Testing internal state or implementation details
```tsx
expect(component.state.isVisible).toBe(true);
```

✅ **Good:** Testing user-visible behavior
```tsx
expect(screen.getByText("Modal content")).toBeInTheDocument();
```

### 2. Use Accessible Queries

Priority order for queries:
1. `getByRole` - Most accessible
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - Form inputs
4. `getByText` - Text content
5. `getByTestId` - Last resort

```tsx
// Good
expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();

// Better than getByTestId
expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
```

### 3. Async Testing

```tsx
// For user events
const user = userEvent.setup();
await user.click(button);

// For async operations
await waitFor(() => {
  expect(screen.getByText("Loading complete")).toBeInTheDocument();
});

// For finding elements that will appear
const element = await screen.findByText("Async content");
```

### 4. Mock Data Consistency

```typescript
const mockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
} as const;

// Reuse consistent mock data across tests
```

## Coverage Guidelines

### Coverage Targets

- **Statements:** 80%
- **Branches:** 80%
- **Functions:** 80%
- **Lines:** 80%

### What to Test

✅ **Always Test:**
- Critical user journeys
- Error handling and edge cases
- Public API functions
- User interactions
- Data transformations

❌ **Don't Test:**
- Third-party libraries
- Trivial functions (getters/setters)
- Constants and type definitions
- Implementation details

## Common Testing Scenarios

### Forms

```tsx
it("should validate form input", async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  const emailInput = screen.getByLabelText(/email/i);
  const submitButton = screen.getByRole("button", { name: /submit/i });

  await user.type(emailInput, "invalid-email");
  await user.click(submitButton);

  expect(screen.getByText("Please enter a valid email")).toBeInTheDocument();
});
```

### Error Boundaries

```tsx
it("should catch and display errors", () => {
  const ThrowError = () => {
    throw new Error("Test error");
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText("Something went wrong")).toBeInTheDocument();
});
```

### Loading States

```tsx
it("should show loading state", () => {
  const { result } = renderHook(() => useQuery("test", () => fetch("/api/test")));

  expect(result.current.isLoading).toBe(true);
});
```

## Debugging Tests

### Common Issues

1. **Element not found**
   - Check if element exists with `screen.debug()`
   - Verify selectors are correct
   - Check if async operation is needed

2. **Test timeout**
   - Add proper `await` for async operations
   - Use `waitFor()` for delayed elements
   - Increase timeout if necessary

3. **Mock not working**
   - Ensure mock is called before import
   - Clear mocks in `beforeEach()`
   - Verify mock implementation matches usage

### Debug Commands

```tsx
// See what's rendered
screen.debug();

// Log specific elements
screen.debug(screen.getByRole("button"));

// Check all elements with text
screen.getAllByText(/partial text/i);
```

## CI/CD Integration

```yaml
# Example GitHub Actions
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:ci
      - run: npm run lint
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Guide](https://testing-library.com/docs/react-testing-library/intro/)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles/)