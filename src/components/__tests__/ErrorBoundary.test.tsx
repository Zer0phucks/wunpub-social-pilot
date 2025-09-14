import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "../ErrorBoundary";

// Mock console.error to avoid cluttering test output
const originalError = console.error;

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

// Component with complex error for testing
const ComplexErrorComponent = () => {
  const error = new Error("Complex test error");
  error.stack = "Error: Complex test error\n    at ComplexErrorComponent (test.tsx:1:1)";
  throw error;
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // Mock console.error to avoid test output pollution
    console.error = vi.fn();

    // Mock location.reload
    Object.defineProperty(window, "location", {
      value: {
        reload: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    console.error = originalError;
    vi.clearAllMocks();
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Test child component</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Test child component")).toBeInTheDocument();
  });

  it("should catch and display error when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
  });

  it("should display error message from thrown error in development", () => {
    // Set development mode
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error details should be in a details element in development
    expect(screen.getByText("Error Details")).toBeInTheDocument();
    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();

    // Restore environment
    process.env.NODE_ENV = originalEnv;
  });

  it("should display generic message for production environment", () => {
    // Mock production environment
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    render(
      <ErrorBoundary>
        <ComplexErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
    // Error Details should not be shown in production
    expect(screen.queryByText("Error Details")).not.toBeInTheDocument();

    // Restore environment
    process.env.NODE_ENV = originalEnv;
  });

  it("should display detailed error information in development", () => {
    // Mock development environment
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    render(
      <ErrorBoundary>
        <ComplexErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Error Details")).toBeInTheDocument();
    expect(screen.getByText(/Error: Complex test error/)).toBeInTheDocument();

    // Restore environment
    process.env.NODE_ENV = originalEnv;
  });

  it("should provide reload functionality", async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText("Reload Page");
    expect(reloadButton).toBeInTheDocument();

    await user.click(reloadButton);

    expect(window.location.reload).toHaveBeenCalledOnce();
  });

  it("should provide try again functionality", async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    const tryAgainButton = screen.getByText("Try Again");
    expect(tryAgainButton).toBeInTheDocument();

    // Just verify button can be clicked without throwing
    await user.click(tryAgainButton);

    // After clicking, we should still see the error UI since the component re-throws
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should handle errors without error message", () => {
    const ComponentWithEmptyError = () => {
      const error = new Error("");
      throw error;
    };

    render(
      <ErrorBoundary>
        <ComponentWithEmptyError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
  });

  it("should handle null error objects", () => {
    const ComponentWithNullError = () => {
      throw null;
    };

    render(
      <ErrorBoundary>
        <ComponentWithNullError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should handle string errors", () => {
    const ComponentWithStringError = () => {
      throw "String error message";
    };

    render(
      <ErrorBoundary>
        <ComponentWithStringError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should log errors to console", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });

  it("should have functional try again button", async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify error is shown
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    const tryAgainButton = screen.getByText("Try Again");
    expect(tryAgainButton).toBeInTheDocument();

    // Verify button is clickable
    await user.click(tryAgainButton);

    // Error should still be shown since component re-throws
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should maintain accessibility with proper headings", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should have proper heading structure
    const heading = screen.getByRole("heading", { name: /Something went wrong/i });
    expect(heading).toBeInTheDocument();
  });

  it("should display custom fallback message", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error message</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("should render multiple children correctly", () => {
    render(
      <ErrorBoundary>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
    expect(screen.getByText("Child 3")).toBeInTheDocument();
  });

  it("should handle nested error boundaries", () => {
    render(
      <ErrorBoundary>
        <div>Outer boundary</div>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ErrorBoundary>
    );

    // Inner boundary should catch the error
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    // Outer boundary content should still be visible
    expect(screen.getByText("Outer boundary")).toBeInTheDocument();
  });
});