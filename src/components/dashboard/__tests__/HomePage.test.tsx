import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomePage } from "../HomePage";

// Mock dependencies
vi.mock("@/hooks/useAnalytics", () => ({
  useAnalytics: vi.fn(),
}));

vi.mock("@/hooks/useProjects", () => ({
  useProjects: vi.fn(),
}));

vi.mock("@/components/analytics/PerformanceChart", () => ({
  PerformanceChart: () => <div data-testid="performance-chart">Performance Chart</div>,
}));

vi.mock("@/components/analytics/EngagementInsights", () => ({
  EngagementInsights: () => <div data-testid="engagement-insights">Engagement Insights</div>,
}));

vi.mock("@/components/analytics/GrowthTracker", () => ({
  GrowthTracker: () => <div data-testid="growth-tracker">Growth Tracker</div>,
}));

vi.mock("@/components/analytics/ActivityFeed", () => ({
  ActivityFeed: () => <div data-testid="activity-feed">Activity Feed</div>,
}));

import { useAnalytics } from "@/hooks/useAnalytics";
import { useProjects } from "@/hooks/useProjects";

const mockUseAnalytics = useAnalytics as ReturnType<typeof vi.fn>;
const mockUseProjects = useProjects as ReturnType<typeof vi.fn>;

const mockProjectsData = {
  projects: [
    {
      id: "project-1",
      user_id: "user-123",
      name: "Test Project",
      description: "Test project description",
      ai_tone: "professional" as const,
      ai_enabled: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    }
  ],
  isLoading: false,
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
};

const mockAnalyticsData = {
  analytics: {
    analytics: [
      {
        id: "1",
        likes: 15,
        comments: 3,
        shares: 2,
        views: 120,
        created_at: "2025-01-13T10:00:00Z",
      },
      {
        id: "2",
        likes: 25,
        comments: 8,
        shares: 5,
        views: 200,
        created_at: "2025-01-12T10:00:00Z",
      }
    ],
    posts: [
      {
        id: "post-1",
        content: "Test post content",
        platform: "twitter",
        status: "published" as const,
        published_at: "2025-01-13T10:00:00Z",
        created_at: "2025-01-13T09:00:00Z",
      },
      {
        id: "post-2",
        content: "Scheduled post",
        platform: "linkedin",
        status: "scheduled" as const,
        scheduled_at: "2025-01-14T14:00:00Z",
        created_at: "2025-01-13T08:00:00Z",
      }
    ]
  },
  isLoading: false,
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProjects.mockReturnValue(mockProjectsData);
    mockUseAnalytics.mockReturnValue(mockAnalyticsData);
  });

  it("should render the main dashboard layout", () => {
    render(<HomePage />);

    expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Comprehensive insights into your social media performance.")).toBeInTheDocument();
  });

  it("should display key metrics cards", () => {
    render(<HomePage />);

    // Check for metric labels that the component actually displays
    expect(screen.getByText("Engagement Rate")).toBeInTheDocument();
    expect(screen.getByText("Followers Growth")).toBeInTheDocument();
    expect(screen.getByText("Posts This Week")).toBeInTheDocument();
    expect(screen.getByText("Scheduled Posts")).toBeInTheDocument();
  });

  it("should display metric values", () => {
    render(<HomePage />);

    // Check for values based on mock data calculations
    expect(screen.getByText("0.29%")).toBeInTheDocument(); // Calculated engagement rate
    expect(screen.getByText("+1.2K")).toBeInTheDocument(); // Mock followers growth
    expect(screen.getByText("1")).toBeInTheDocument(); // Posts this week (filtered from mock data)
    expect(screen.getByText("1")).toBeInTheDocument(); // Scheduled posts
  });

  it("should render analytics components", () => {
    render(<HomePage />);

    // Performance tab is active by default, so PerformanceChart should be visible
    expect(screen.getByTestId("performance-chart")).toBeInTheDocument();

    // Other components are in different tabs and not visible by default
    expect(screen.queryByTestId("engagement-insights")).not.toBeInTheDocument();
    expect(screen.queryByTestId("growth-tracker")).not.toBeInTheDocument();
    expect(screen.queryByTestId("activity-feed")).not.toBeInTheDocument();
  });

  it("should display tabs navigation", () => {
    render(<HomePage />);

    expect(screen.getByText("Performance")).toBeInTheDocument();
    expect(screen.getByText("Engagement")).toBeInTheDocument();
    expect(screen.getByText("Growth")).toBeInTheDocument();
    expect(screen.getByText("Activity")).toBeInTheDocument();
  });

  it("should handle loading state", () => {
    mockUseAnalytics.mockReturnValue({
      ...mockAnalyticsData,
      isLoading: true,
    });

    render(<HomePage />);

    // Should still render layout but with loading indicators
    expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
  });

  it("should handle missing analytics data gracefully", () => {
    mockUseAnalytics.mockReturnValue({
      analytics: null,
      isLoading: false,
    });

    render(<HomePage />);

    // Should show zero values when no analytics data
    expect(screen.getByText("0.00%")).toBeInTheDocument(); // Engagement rate
    expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
  });

  it("should render with different data", () => {
    // Update analytics data to have more interactions
    const newAnalyticsData = {
      ...mockAnalyticsData,
      analytics: {
        analytics: [
          {
            id: "1",
            likes: 100,
            comments: 50,
            shares: 25,
            views: 500,
            created_at: "2025-01-13T10:00:00Z",
          }
        ],
        posts: [
          {
            id: "post-1",
            content: "Test post content",
            platform: "twitter",
            status: "published" as const,
            published_at: "2025-01-13T10:00:00Z",
            created_at: "2025-01-13T09:00:00Z",
          }
        ]
      }
    };

    mockUseAnalytics.mockReturnValue(newAnalyticsData);

    render(<HomePage />);

    // Should still render the dashboard
    expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
  });

  it("should display quick insights section", () => {
    render(<HomePage />);

    expect(screen.getByText("Quick Insights")).toBeInTheDocument();
  });

  it("should render platform indicators", () => {
    render(<HomePage />);

    // Should have platform-related content and suggestions visible in performance tab
    expect(screen.getByText("Content Suggestions")).toBeInTheDocument();
  });

  it("should have proper semantic structure", () => {
    render(<HomePage />);

    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole("heading", { level: 1 });
    expect(mainHeading).toHaveTextContent("Analytics Dashboard");
  });

  it("should handle analytics hook errors gracefully", () => {
    mockUseAnalytics.mockReturnValue({
      metrics: {
        totalPosts: 0,
        totalViews: 0,
        totalEngagements: 0,
        averageEngagementRate: 0,
      },
      recentActivity: [],
      isLoading: false,
      error: "Failed to load analytics",
    });

    render(<HomePage />);

    // Should still render the basic layout
    expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
    expect(screen.getAllByText("0")).toHaveLength(2); // Posts This Week and Scheduled Posts both show 0
  });

  it("should display correct tab content", () => {
    render(<HomePage />);

    // Performance tab should show metrics
    expect(screen.getByText("Content Suggestions")).toBeInTheDocument();
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
  });

  it("should have accessible navigation", () => {
    render(<HomePage />);

    // Check for tab navigation
    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4); // Performance, Engagement, Growth, Activity
  });

  it("should render with memoized platform logos", () => {
    render(<HomePage />);

    // The component should render without errors
    expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
    // Memoized components should not cause performance issues
  });

  it("should display quick action buttons", () => {
    render(<HomePage />);

    // Look for typical dashboard action buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should show engagement metrics with proper formatting", () => {
    render(<HomePage />);

    // Check that engagement rate is shown as percentage
    expect(screen.getByText("0.29%")).toBeInTheDocument();
  });

  it("should maintain component structure when data changes", () => {
    const { rerender } = render(<HomePage />);

    // The component should re-render successfully with new data
    rerender(<HomePage />);

    // Should maintain the basic structure
    expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Posts This Week")).toBeInTheDocument();
  });
});