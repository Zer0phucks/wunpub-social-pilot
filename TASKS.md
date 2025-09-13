# WunPub MVP Task List

This document tracks the completed and pending tasks for the WunPub MVP launch.

## Completed Tasks ✅

### UI & Frontend Foundation

*   **Component Library:** A comprehensive set of UI components has been built using `shadcn/ui`, including buttons, forms, dialogs, and more.
*   **Application Shell:** The main application layout (`WunPubLayout`) with side and top navigation is in place.
*   **Routing:** Client-side routing is set up with `react-router-dom`, including routes for authentication and the main application.
*   **Authentication UI:** The UI for user sign-in and sign-up (`Auth.tsx`) is complete.
*   **Core Pages UI:** The UI for the main pages is well-developed, though not yet connected to backend data:
    *   **Dashboard (`HomePage.tsx`):** A rich dashboard with metrics, charts, and content suggestions.
    *   **Post Creator (`PostCreator.tsx`):** A detailed UI for composing posts with platform-specific previews.
    *   **Content Calendar (`ContentCalendar.tsx`):** A functional calendar view for displaying content.
    *   **Inbox (`Inbox.tsx`):** A UI for managing social media messages.
    *   **Template Library (`TemplateLibrary.tsx`):** A UI for managing content templates.

### Backend & Authentication Foundation

*   **User Authentication Integration:** Clerk is integrated for user authentication, with `<SignedIn>` and `<SignedOut>` components controlling access.
*   **Supabase Client:** The Supabase client is set up and available for use.
*   **Database Migrations:** Initial database migrations have been created, defining tables for `projects` and `profiles`.

## To-Do Tasks ⬜

### Phase 1: Backend & Authentication

*   **[ ] Finalize User Authentication:**
    *   [ ] Implement robust Supabase Row Level Security (RLS) policies for all tables.
    *   [ ] Ensure Clerk user IDs are correctly propagated to Supabase for data association.

*   **[ ] Define Database Schema:**
    *   [ ] **`social_accounts` table:** Create a table to store connected social media accounts with encrypted access tokens.
    *   [ ] **`posts` table:** Create a table to store post content, status, and scheduling information.
    *   [ ] **`post_analytics` table:** Create a table to store basic analytics for posts.

*   **[ ] API & Server Logic:**
    *   [ ] Create Supabase database functions for handling social media API interactions (e.g., posting content).
    *   [ ] Implement a secure method for storing and accessing social media API keys (e.g., using Supabase secrets).

### Phase 2: Core Feature Implementation

*   **[ ] Project & Social Account Management:**
    *   [ ] Connect the `ProjectSelector` component to the backend to list and select projects.
    *   [ ] Build the UI and logic for creating new projects.
    *   [ ] Implement the OAuth flow for connecting Twitter/X and LinkedIn accounts.

*   **[ ] Post Creator & Scheduling:**
    *   [ ] Connect the `PostCreator` component to the backend to save posts as drafts or schedule them.
    *   [ ] Implement a scheduling mechanism (e.g., using `pg_cron` in Supabase).
    *   [ ] Handle image uploads to Supabase Storage.

*   **[ ] Content Calendar:**
    *   [ ] Fetch and display posts from the backend on the `ContentCalendar`.
    *   [ ] Implement functionality to update post schedules via drag-and-drop.

*   **[ ] Analytics:**
    *   [ ] Create a background job to fetch analytics data for published posts.
    *   [ ] Connect the `HomePage` dashboard to display real data from the backend.

### Phase 3: Polish & Pre-launch

*   **[ ] UX/UI Refinement:**
    *   [ ] Add loading states and error handling to all data-fetching components.
    *   [ ] Ensure the application is fully responsive and works well on mobile devices.

*   **[ ] Testing:**
    *   [ ] Write unit and integration tests for key components and hooks.
    *   [ ] Conduct end-to-end testing of the core user flows.

*   **[ ] Deployment:**
    *   [ ] Set up a production environment and CI/CD pipeline.
