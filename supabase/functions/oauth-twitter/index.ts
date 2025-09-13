import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
          platform: 'twitter',
          redirect_url: `${req.headers.get('origin')}/oauth/callback`
        })

      // Twitter OAuth 2.0 PKCE flow
      const client_id = Deno.env.get('TWITTER_CLIENT_ID')
      if (!client_id) {
        return new Response(
          JSON.stringify({ error: 'Twitter client ID not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate code verifier and challenge for PKCE
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      
      // Store code verifier with state
      await supabase
        .from('oauth_states')
        .update({ redirect_url: codeVerifier }) // Store verifier in redirect_url temporarily
        .eq('state_token', state)

      const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('client_id', client_id)
      authUrl.searchParams.set('redirect_uri', `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-twitter/callback`)
      authUrl.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access')
      authUrl.searchParams.set('state', state)
      authUrl.searchParams.set('code_challenge', codeChallenge)
      authUrl.searchParams.set('code_challenge_method', 'S256')

      return new Response(
        JSON.stringify({ authorization_url: authUrl.toString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Step 2: Handle callback from Twitter
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
      const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${Deno.env.get('TWITTER_CLIENT_ID')}:${Deno.env.get('TWITTER_CLIENT_SECRET')}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-twitter/callback`,
          code_verifier: oauthState.redirect_url, // We stored the verifier here
        }),
      })

      const tokens = await tokenResponse.json()

      if (!tokenResponse.ok) {
        console.error('Twitter token exchange failed:', tokens)
        return new Response(
          '<html><body><script>window.close()</script><p>Failed to exchange code for tokens</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        )
      }

      // Get user info from Twitter
      const userResponse = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      })

      const userData = await userResponse.json()

      if (!userResponse.ok) {
        console.error('Failed to get Twitter user data:', userData)
        return new Response(
          '<html><body><script>window.close()</script><p>Failed to get user information</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        )
      }

      // Store social account
      await supabase
        .from('social_accounts')
        .insert({
          project_id: oauthState.project_id,
          platform: 'twitter',
          account_id: userData.data.id,
          account_username: userData.data.username,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
        })

      // Clean up OAuth state
      await supabase
        .from('oauth_states')
        .delete()
        .eq('state_token', state)

      return new Response(
        '<html><body><script>window.opener?.postMessage({type:"oauth_success",platform:"twitter"}, "*"); window.close()</script><p>Twitter account connected successfully! You can close this window.</p></body></html>',
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

// PKCE helper functions
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}