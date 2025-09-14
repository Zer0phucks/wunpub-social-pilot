import "@testing-library/jest-dom";

// Mock environment variables
process.env.VITE_SUPABASE_URL = "https://test-supabase-url.supabase.co";
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "test-anon-key";

// Mock window.crypto for Node.js environment
import { webcrypto } from "crypto";

// Mock crypto properly for testing
Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
  writable: true,
  configurable: true,
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb: any) {
    // Mock implementation
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver  
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  
  constructor(cb: any) {
    // Mock implementation
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
} as any;

import { vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});