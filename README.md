# WunPub - Social Media Management Platform

A comprehensive social media management platform built with React, TypeScript, and Supabase.

## Features

- **Multi-platform Support**: Twitter/X and LinkedIn integration
- **Secure Token Management**: Encrypted token storage with audit logging
- **Content Scheduling**: Create and schedule posts across platforms
- **Analytics Dashboard**: Track performance and engagement metrics
- **Template System**: Reusable content templates
- **Community Monitoring**: Track relevant discussions and engagement opportunities

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Edge Functions, Authentication)
- **State Management**: TanStack Query
- **Routing**: React Router
- **Testing**: Vitest, Testing Library

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

Set these in your deployment environment (Vercel):

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Edge Function Secrets

Configure these in your Supabase project settings:

- `TWITTER_CLIENT_ID`: Twitter OAuth client ID
- `TWITTER_CLIENT_SECRET`: Twitter OAuth client secret  
- `LINKEDIN_CLIENT_ID`: LinkedIn OAuth client ID
- `LINKEDIN_CLIENT_SECRET`: LinkedIn OAuth client secret
- `ENCRYPTION_KEY`: 32-character key for token encryption

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Supabase Edge Functions

Edge functions are deployed automatically with Supabase CLI:

```bash
supabase functions deploy oauth-twitter
supabase functions deploy oauth-linkedin  
supabase functions deploy social-media-proxy
```

## Database Schema

The application uses the following main tables:

- `profiles`: User profile information
- `projects`: User projects/workspaces
- `social_accounts`: Connected social media accounts (encrypted tokens)
- `posts`: Content posts and scheduling
- `templates`: Reusable content templates
- `communities`: Monitored communities for engagement
- `messages`: Inbox for social media interactions

## Security Features

- **Row Level Security (RLS)**: All tables protected with user-specific policies
- **Token Encryption**: Social media tokens encrypted at rest
- **Audit Logging**: All token access logged for security monitoring
- **Secure Views**: Safe data access without exposing sensitive information

## Testing

Run the test suite:

```bash
npm run test          # Run tests
npm run test:ui       # Run with UI
npm run coverage      # Generate coverage report
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is proprietary and confidential.