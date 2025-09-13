# WunPub MVP Launch Roadmap

## 1. Project Overview

WunPub is a social media management and publishing tool designed to help users streamline their content workflow, from creation and scheduling to analytics and engagement. This document outlines the roadmap to an MVP (Minimum Viable Product) launch.

## 2. Core MVP Features

The following features are essential for the MVP launch:

*   **User Authentication:** Secure user sign-up, login, and profile management.
*   **Project Management:** Users can create and manage projects, with each project containing its own set of social media accounts and content.
*   **Social Account Integration:** Connect at least two social media platforms (e.g., Twitter, LinkedIn).
*   **Post Creation & Scheduling:** A robust post creator with text, image, and scheduling capabilities.
*   **Content Calendar:** A visual calendar to view and manage scheduled and published posts.
*   **Basic Analytics:** Display key metrics like engagement rate and follower growth.

## 3. Development Roadmap

### Phase 1: Backend & Authentication (1-2 Weeks)

This phase focuses on solidifying the backend, authentication, and data models.

*   **[ ] Finalize User Authentication:**
    *   [ ] Complete the integration of Clerk for user authentication.
    *   [ ] Implement robust Supabase Row Level Security (RLS) policies for all tables to ensure users can only access their own data.
    *   [ ] Create a `profiles` table to store user-specific information not handled by Clerk.

*   **[ ] Define Database Schema:**
    *   [ ] **`projects` table:** Finalize the schema for managing user projects.
    *   [ ] **`social_accounts` table:** Store connected social media accounts, including access tokens and refresh tokens, securely.
    *   [ ] **`posts` table:** Store post content, status (draft, scheduled, published), scheduled time, and associated social account.
    *   [ ] **`post_analytics` table:** Store basic analytics data for each post (likes, comments, shares).

*   **[ ] API & Server Logic:**
    *   [ ] Create Supabase database functions (or serverless functions) for handling social media API interactions (e.g., posting, refreshing tokens).
    *   [ ] Implement a secure method for storing and accessing API keys and secrets for social media platforms.

### Phase 2: Core Feature Implementation (2-3 Weeks)

This phase involves connecting the frontend UI components to the backend and implementing the core application logic.

*   **[ ] Project & Social Account Management:**
    *   [ ] Build the UI for creating, editing, and deleting projects.
    *   [ ] Implement the OAuth flow for connecting social media accounts (start with Twitter/X and LinkedIn).
    *   [ ] Create a settings page for managing connected accounts.

*   **[ ] Post Creator & Scheduling:**
    *   [ ] Connect the `PostCreator` component to the backend to save drafts and schedule posts.
    *   [ ] Implement the scheduling logic using a cron job or a service like Supabase's `pg_cron`.
    *   [ ] Handle image uploads to Supabase Storage.

*   **[ ] Content Calendar:**
    *   [ ] Fetch and display scheduled and published posts on the `ContentCalendar` component.
    *   [ ] Allow users to drag and drop posts to reschedule them.
    *   [ ] Implement a way to view and edit posts from the calendar.

*   **[ ] Analytics:**
    *   [ ] Create a background job to periodically fetch basic analytics for published posts.
    *   [ ] Connect the `HomePage` dashboard components to display real data from the `post_analytics` table.

### Phase 3: Polish & Pre-launch (1 Week)

This phase is for bug fixing, improving the user experience, and preparing for deployment.

*   **[ ] UX/UI Refinement:**
    *   [ ] Ensure a consistent and intuitive user experience across the application.
    *   [ ] Add loading states and error handling to all data-fetching components.
    *   [ ] Test the application on different screen sizes and ensure it is responsive.

*   **[ ] Testing:**
    *   [ ] Write unit and integration tests for critical components and functions.
    *   [ ] Conduct end-to-end testing of the core user flows.

*   **[ ] Deployment:**
    *   [ ] Set up a production environment on a platform like Vercel or Netlify.
    *   [ ] Configure CI/CD to automate deployments.
    *   [ ] Perform final security checks and code reviews.

## 4. Post-MVP

*   **More Social Integrations:** Add support for platforms like Facebook, Instagram, and Reddit.
*   **Advanced Analytics:** Provide more in-depth analytics and reporting.
*   **Team Collaboration:** Allow multiple users to collaborate on projects.
*   **Content Templates:** Enhance the template library with more features.
*   **AI Content Generation:** Integrate a large language model to assist with content creation.
*   **Inbox/Engagement:** Build out the `Inbox` feature to allow users to reply to comments and messages directly from WunPub.
