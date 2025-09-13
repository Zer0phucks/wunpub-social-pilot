import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUser } from "../useUser";

vi.mock("@/integrations/supabase/SupabaseProvider", () => ({
  useSupabase: vi.fn(),
}));

import { useSupabase } from "@/integrations/supabase/SupabaseProvider";
const mockUseSupabase = useSupabase as ReturnType<typeof vi.fn>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const makeAuth = (user: any) => ({
  getUser: vi.fn().mockResolvedValue({ data: { user } }),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  signOut: vi.fn(),
});

const makeFrom = () => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({ maybeSingle: vi.fn() })),
  })),
  upsert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn() })) })),
  update: vi.fn(() => ({ eq: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn() })) })) })),
});

describe("useUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns loading state initially", async () => {
    const auth = makeAuth(null);
    const from = makeFrom();
    (from.select().eq().maybeSingle as any).mockResolvedValue({ data: null, error: null });

    mockUseSupabase.mockReturnValue({ auth, from: vi.fn(() => from) });

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("exposes user and creates profile if missing", async () => {
    const user = { id: "user-123", email: "test@example.com", user_metadata: {} };
    const auth = makeAuth(user);
    const from = makeFrom();

    (from.select().eq().maybeSingle as any).mockResolvedValue({ data: null, error: null });
    (from.upsert({} as any).select().single as any).mockResolvedValue({
      data: { id: "user-123", email: "test@example.com", display_name: "" },
      error: null,
    });

    mockUseSupabase.mockReturnValue({ auth, from: vi.fn(() => from) });

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.user?.id).toBe("user-123");
    });
  });

  it("returns existing profile when found", async () => {
    const user = { id: "user-123", email: "test@example.com", user_metadata: {} };
    const auth = makeAuth(user);
    const from = makeFrom();

    const mockProfile = {
      id: "user-123",
      email: "test@example.com",
      display_name: "Test User",
      subscription_tier: "pro" as const,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    };

    (from.select().eq().maybeSingle as any).mockResolvedValue({ data: mockProfile, error: null });

    mockUseSupabase.mockReturnValue({ auth, from: vi.fn(() => from) });

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile);
    });
  });

  it("updates profile via mutation", async () => {
    const user = { id: "user-123", email: "test@example.com", user_metadata: {} };
    const auth = makeAuth(user);
    const from = makeFrom();

    (from.select().eq().maybeSingle as any).mockResolvedValue({ data: null, error: null });
    (from.update({} as any).eq().select().single as any).mockResolvedValue({
      data: { id: "user-123", display_name: "Updated Name" },
      error: null,
    });

    mockUseSupabase.mockReturnValue({ auth, from: vi.fn(() => from) });

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    act(() => {
      result.current.updateProfile({ display_name: "Updated Name" });
    });

    await waitFor(() => {
      expect(result.current.isUpdatingProfile).toBe(false);
    });
  });
});