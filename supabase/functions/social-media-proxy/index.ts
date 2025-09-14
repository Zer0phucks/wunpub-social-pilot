import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Token decryption utility (server-side only)
async function decryptToken(encryptedToken: string): Promise<string> {
  if (!encryptedToken || encryptedToken.length === 0) return encryptedToken;

  try {
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Import the key for decryption
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(encryptionKey),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Decode from base64
    const combined = new Uint8Array(
      atob(encryptedToken)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    // Derive decryption key
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // Decrypt the token
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encrypted
    );

    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Failed to decrypt token:', error);
    throw new Error('Token decryption failed');
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, accountId, platform, ...params } = await req.json();

    if (!action || !accountId) {
      throw new Error('Missing required parameters: action, accountId');
    }

    // Get the social account with encrypted tokens
    const { data: account, error: accountError } = await supabaseClient
      .from('social_accounts')
      .select('access_token, refresh_token, platform, account_id')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      throw new Error('Social account not found or unauthorized');
    }

    // Decrypt tokens server-side
    const accessToken = await decryptToken(account.access_token);
    
    let result;
    
    switch (action) {
      case 'post_content':
        if (platform === 'twitter') {
          result = await postToTwitter(accessToken, params.content);
        } else if (platform === 'linkedin') {
          result = await postToLinkedIn(accessToken, params.content);
        } else {
          throw new Error(`Unsupported platform: ${platform}`);
        }
        break;
        
      case 'get_profile':
        if (platform === 'twitter') {
          result = await getTwitterProfile(accessToken);
        } else if (platform === 'linkedin') {
          result = await getLinkedInProfile(accessToken);
        } else {
          throw new Error(`Unsupported platform: ${platform}`);
        }
        break;
        
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    // Log the API usage for security audit
    await supabaseClient
      .from('social_api_usage_log')
      .insert({
        user_id: user.id,
        social_account_id: accountId,
        action,
        platform,
        success: true,
        timestamp: new Date().toISOString()
      });

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Social media proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Twitter API functions
async function postToTwitter(accessToken: string, content: string) {
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Twitter API error: ${error.detail || 'Unknown error'}`);
  }

  return await response.json();
}

async function getTwitterProfile(accessToken: string) {
  const response = await fetch('https://api.twitter.com/2/users/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Twitter profile');
  }

  return await response.json();
}

// LinkedIn API functions
async function postToLinkedIn(accessToken: string, content: string) {
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      author: 'urn:li:person:CURRENT_USER',
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`LinkedIn API error: ${error.message || 'Unknown error'}`);
  }

  return await response.json();
}

async function getLinkedInProfile(accessToken: string) {
  const response = await fetch('https://api.linkedin.com/v2/people/~', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch LinkedIn profile');
  }

  return await response.json();
}