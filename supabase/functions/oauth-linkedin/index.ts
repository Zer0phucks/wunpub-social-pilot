import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Enhanced encryption utilities for token security
async function encryptToken(token: string): Promise<string> {
  if (!token || token.length === 0) return token;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(Deno.env.get('ENCRYPTION_KEY') || 'wunpub_social_tokens_2025_secure'),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(token)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Token encryption failed:', error);
    throw new Error('Failed to encrypt token');
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      // Step 1: Get authorization URL
      const { project_id, user_id } = await req.json()
      
      if (!project_id || !user_id) {
        return new Response(
          JSON.stringify({ error: 'project_id and user_id are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate state token for security
      const state = crypto.randomUUID()
      
      // Store OAuth state
      await supabase
        .from('oauth_states')
        .insert({
          state_token: state,
          user_id,
          project_id,
          platform: 'linkedin',
          redirect_url: `${req.headers.get('origin')}/oauth/callback`
        })

      const client_id = Deno.env.get('LINKEDIN_CLIENT_ID')
      if (!client_id) {
        return new Response(
          JSON.stringify({ error: 'LinkedIn client ID not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('client_id', client_id)
      authUrl.searchParams.set('redirect_uri', `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-linkedin/callback`)
      authUrl.searchParams.set('scope', 'w_member_social profile openid email')
      authUrl.searchParams.set('state', state)

      return new Response(
        JSON.stringify({ authorization_url: authUrl.toString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Step 2: Handle callback from LinkedIn
      const url = new URL(req.url)
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
      const error = url.searchParams.get('error')

      if (error) {
        return new Response(
          `<html><body><script>window.close()</script><p>Error: ${error}</p></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        )
      }

      if (!code || !state) {
        return new Response(
          '<html><body><script>window.close()</script><p>Missing authorization code or state</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        )
      }

      // Verify state and get OAuth details
      const { data: oauthState } = await supabase
        .from('oauth_states')
        .select('*')
        .eq('state_token', state)
        .single()

      if (!oauthState) {
        return new Response(
          '<html><body><script>window.close()</script><p>Invalid state token</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        )
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: Deno.env.get('LINKEDIN_CLIENT_ID')!,
          client_secret: Deno.env.get('LINKEDIN_CLIENT_SECRET')!,
          redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-linkedin/callback`,
        }),
      })

      const tokens = await tokenResponse.json()

      if (!tokenResponse.ok) {
        console.error('LinkedIn token exchange failed:', tokens)
        return new Response(
          '<html><body><script>window.close()</script><p>Failed to exchange code for tokens</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        )
      }

      // Get user info from LinkedIn
      const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      })

      const userData = await userResponse.json()

      if (!userResponse.ok) {
        console.error('Failed to get LinkedIn user data:', userData)
        return new Response(
          '<html><body><script>window.close()</script><p>Failed to get user information</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        )
      }

      // Encrypt tokens before storage for security
      const encryptedAccessToken = await encryptToken(tokens.access_token);
      const encryptedRefreshToken = tokens.refresh_token ? await encryptToken(tokens.refresh_token) : null;

      console.log('LinkedIn OAuth successful - storing encrypted tokens for user:', userData.sub);

      // Store social account with encrypted tokens
      await supabase
        .from('social_accounts')
        .insert({
          project_id: oauthState.project_id,
          platform: 'linkedin',
          account_id: userData.sub,
          account_username: userData.name || userData.email,
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
        })

      // Clean up OAuth state
      await supabase
        .from('oauth_states')
        .delete()
        .eq('state_token', state)

      return new Response(
        '<html><body><script>window.opener?.postMessage({type:"oauth_success",platform:"linkedin"}, "*"); window.close()</script><p>LinkedIn account connected successfully! You can close this window.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('OAuth error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})