# WunPub MVP Roadmap & Task Status

## 1. Project Overview

WunPub is a social media management and publishing tool designed to help users streamline their content workflow, from creation and scheduling to analytics and engagement. This document combines the roadmap and task tracker for the MVP (Minimum Viable Product) launch.

## 2. Core MVP Feature Readiness

- [x] **User Authentication** — Supabase email/password auth with profile provisioning and RLS-backed access control is in place (`src/pages/Auth.tsx`, `supabase/migrations/20250912224450_update_rls_policies.sql`).
- [x] **Project Management** — Users can create and manage projects that scope connected accounts and content (`src/hooks/useProjects.tsx`).
- [x] **Social Account Integration** — Twitter and LinkedIn OAuth flows store encrypted tokens through Supabase Edge Functions (`supabase/functions/oauth-twitter`, `supabase/functions/oauth-linkedin`).
- [x] **Post Creation & Scheduling** — The post composer persists drafts/scheduled posts and triggers cron-based publishing (`src/components/posts/PostCreator.tsx`, `supabase/migrations/20250912224800_setup_cron_job.sql`).
- [x] **Content Calendar** — Calendar views and drag-and-drop rescheduling operate on live Supabase data (`src/components/calendar/ContentCalendar.tsx`).
- [ ] **Basic Analytics** — Dashboard reads from `post_analytics`, but no job currently backfills metrics; pipeline work remains.

## 3. Development Roadmap & Tracker

### Phase 1: Backend & Authentication (1-2 Weeks)

- **Finalize User Authentication**
  - [ ] Complete the integration of Clerk for user authentication _(current build uses Supabase auth instead; Clerk components are not wired in)._ 
  - [x] Implement robust Supabase Row Level Security (RLS) policies for all tables (`supabase/migrations/20250912224506_create_core_tables.sql`).
  - [x] Create a `profiles` table for user metadata not handled by the auth provider (`supabase/migrations/20250912131814_aceea76b-427d-474f-b9bf-df797e0ab483.sql`).

- **Define Database Schema**
  - [x] `projects` table finalized with user ownership and metadata (`supabase/migrations/20250912131814_aceea76b-427d-474f-b9bf-df797e0ab483.sql`).
  - [x] `social_accounts` table created with secure token storage (`supabase/migrations/20250912224506_create_core_tables.sql`).
  - [x] `posts` table added with scheduling metadata and platform linkage (`supabase/migrations/20250912224506_create_core_tables.sql`).
  - [x] `post_analytics` table created for engagement data (`supabase/migrations/20250912224506_create_core_tables.sql`).

- **API & Server Logic**
  - [x] Supabase Edge Functions/back-end routines handle posting, OAuth, and token refresh scenarios (`supabase/functions/social-media-proxy`, `supabase/functions/oauth-*`).
  - [x] Secrets are encrypted at rest with pgcrypto helpers and service-role protected views (`supabase/migrations/20250912204717_947749cb-554a-4397-be66-cccfe6bbe31d.sql`).

### Phase 2: Core Feature Implementation (2-3 Weeks)

- **Project & Social Account Management**
  - [x] `ProjectSelector` populates from Supabase with loading states and mutations (`src/components/projects/ProjectSelector.tsx`).
  - [x] Users can create new projects through the onboarding flow (`src/components/onboarding/ProjectSetup.tsx`).
  - [x] Twitter/X and LinkedIn OAuth flows persist encrypted credentials (`supabase/functions/oauth-twitter`, `supabase/functions/oauth-linkedin`).

- **Post Creator & Scheduling**
  - [x] Post composer saves drafts/scheduled posts via Supabase mutations (`src/components/posts/PostCreator.tsx`).
  - [x] Cron-driven publishing is configured with `run_scheduled_posts` (`supabase/migrations/20250912224800_setup_cron_job.sql`).
  - [x] Image uploads stream to the `post-media` storage bucket (`src/components/posts/PostCreator.tsx`, `supabase/migrations/20250912224811_create_storage_bucket.sql`).

- **Content Calendar**
  - [x] Scheduled/published posts hydrate the calendar view from Supabase (`src/components/calendar/ContentCalendar.tsx`).
  - [x] Drag-and-drop updates reschedule posts via `usePosts.updatePost` mutations (`src/components/calendar/ContentCalendar.tsx`).
  - [ ] View/edit actions from the calendar are placeholders; modal navigation still needs implementation (`src/components/calendar/ContentCalendar.tsx`).

- **Analytics**
  - [ ] Background job to fetch analytics data for published posts is not yet implemented (no cron/functions targeting `post_analytics`).
  - [x] `HomePage` dashboard components read Supabase data through `useAnalytics` (`src/components/dashboard/HomePage.tsx`).

### Phase 3: Polish & Pre-launch (1 Week)

- **UX/UI Refinement**
  - [ ] Loading/error states are present in many views but not audited across every data path; responsive QA still pending.
  - [ ] Responsive layout verification on smaller devices is outstanding.

- **Testing**
  - [x] Unit/integration coverage exists for key surfaces (e.g., `HomePage`, token security utilities, error boundaries under `src/components/.../__tests__`).
  - [ ] End-to-end testing of core user flows has not been scripted yet (no Playwright/Cypress suite).

- **Deployment**
  - [ ] Production hosting and CI/CD automation remain to be configured (no deployment scripts beyond local Vite/Vercel config).
  - [ ] Final security review and hardening pass still required.

## 4. Post-MVP Enhancements

*   **More Social Integrations:** Add support for platforms like Facebook, Instagram, and Reddit.
*   **Advanced Analytics:** Provide more in-depth analytics and reporting.
*   **Team Collaboration:** Allow multiple users to collaborate on projects.
*   **Content Templates:** Enhance the template library with more features.
*   **AI Content Generation:** Integrate a large language model to assist with content creation.
*   **Inbox/Engagement:** Build out the `Inbox` feature to allow users to reply to comments and messages directly from WunPub.

## 5. Outstanding Risks & Follow-ups

- Analytics metrics require a data ingestion job before launch-ready insights are available.
- Calendar view/edit actions and responsive QA need implementation to avoid UX blockers.
- Deployment, end-to-end tests, and final security tasks are still open before release.
