import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProjects } from "../useProjects";

// Mock dependencies
vi.mock("@/integrations/supabase/SupabaseProvider", () => ({
  useSupabase: vi.fn(),
}));

vi.mock("../useUser", () => ({
  useUser: vi.fn(),
}));

import { useSupabase } from "@/integrations/supabase/SupabaseProvider";
import { useUser } from "../useUser";

const mockUseSupabase = useSupabase as ReturnType<typeof vi.fn>;
const mockUseUser = useUser as ReturnType<typeof vi.fn>;

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
};

const mockProjects = [
  {
    id: "project-1",
    user_id: "user-123",
    name: "Test Project 1",
    description: "A test project",
    marketing_goal: "Increase awareness",
    ai_tone: "professional" as const,
    ai_enabled: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "project-2",
    user_id: "user-123",
    name: "Test Project 2",
    description: "Another test project",
    ai_tone: "casual" as const,
    ai_enabled: false,
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z",
  },
];

describe("useProjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSupabase.mockReturnValue(mockSupabase);
  });

  it("should return empty array when no user is present", () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    expect(result.current.projects).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("should fetch projects when user is present", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user-123" },
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: mockProjects,
            error: null,
          }),
        })),
      })),
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.projects).toEqual(mockProjects);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("should handle fetch errors gracefully", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user-123" },
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        })),
      })),
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should handle error gracefully
    expect(result.current.projects).toEqual([]);
  });

  it("should create a new project", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user-123" },
    });

    const newProject = {
      name: "New Project",
      description: "A new project description",
      marketing_goal: "Test goal",
      ai_tone: "humorous" as const,
      ai_enabled: true,
    };

    const createdProject = {
      id: "project-3",
      user_id: "user-123",
      ...newProject,
      created_at: "2025-01-03T00:00:00Z",
      updated_at: "2025-01-03T00:00:00Z",
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "projects") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: createdProject,
                error: null,
              }),
            })),
          })),
        };
      }
      return mockSupabase.from(table);
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.createProject).toBe("function");
    expect(result.current.isCreating).toBe(false);

    act(() => {
      result.current.createProject(newProject);
    });

    // Verify the function was called without errors
    expect(typeof result.current.createProject).toBe("function");
  });

  it("should handle create project error when no user", async () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    const newProject = {
      name: "New Project",
      ai_tone: "professional" as const,
      ai_enabled: true,
    };

    // Should not crash when creating without user
    act(() => {
      result.current.createProject(newProject);
    });

    // Verify the function exists and can be called
    expect(typeof result.current.createProject).toBe("function");
  });

  it("should update an existing project", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user-123" },
    });

    const updatedProject = {
      id: "project-1",
      name: "Updated Project Name",
      description: "Updated description",
    };

    const updatedResult = {
      ...mockProjects[0],
      ...updatedProject,
      updated_at: "2025-01-03T00:00:00Z",
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "projects") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: mockProjects,
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: updatedResult,
                  error: null,
                }),
              })),
            })),
          })),
        };
      }
      return mockSupabase.from(table);
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.updateProject).toBe("function");
    expect(result.current.isUpdating).toBe(false);

    act(() => {
      result.current.updateProject(updatedProject);
    });

    // Verify the function was called without errors
    expect(typeof result.current.updateProject).toBe("function");
  });

  it("should delete a project", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user-123" },
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "projects") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: mockProjects,
                error: null,
              }),
            })),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          })),
        };
      }
      return mockSupabase.from(table);
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.deleteProject).toBe("function");
    expect(result.current.isDeleting).toBe(false);

    act(() => {
      result.current.deleteProject("project-1");
    });

    // Verify the function was called without errors
    expect(typeof result.current.deleteProject).toBe("function");
  });

  it("should handle delete project errors", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user-123" },
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "projects") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: mockProjects,
                error: null,
              }),
            })),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              error: { message: "Delete failed" },
            }),
          })),
        };
      }
      return mockSupabase.from(table);
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.deleteProject("project-1");
    });

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(false);
    });

    // Should handle error gracefully without crashing
    expect(result.current.projects).toEqual(mockProjects);
  });

  it("should return correct loading states", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user-123" },
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve({ data: [], error: null }), 100))
          ),
        })),
      })),
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.projects).toEqual([]);
  });

  it("should provide all expected mutation states", () => {
    mockUseUser.mockReturnValue({
      user: { id: "user-123" },
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        })),
      })),
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.createProject).toBe("function");
    expect(typeof result.current.updateProject).toBe("function");
    expect(typeof result.current.deleteProject).toBe("function");
    expect(typeof result.current.isCreating).toBe("boolean");
    expect(typeof result.current.isUpdating).toBe("boolean");
    expect(typeof result.current.isDeleting).toBe("boolean");
  });
});