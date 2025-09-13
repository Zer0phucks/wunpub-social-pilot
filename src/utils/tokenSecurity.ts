/**
 * Enhanced client-side token security utilities
 * Provides improved encryption/decryption for sensitive social media tokens
 */

/**
 * Generates a cryptographically strong encryption key from a passphrase
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a token using AES-GCM encryption with PBKDF2 key derivation
 */
export async function encryptToken(token: string, passphrase?: string): Promise<string> {
  if (!token || token.length === 0) return token;

  try {
    // Use environment-specific passphrase or fallback
    const keyPassphrase = passphrase || import.meta.env.VITE_ENCRYPTION_KEY || 'wunpub_social_tokens_2025_secure';

    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive encryption key
    const key = await deriveKey(keyPassphrase, salt);

    // Encrypt the token
    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encoder.encode(token)
    );

    // Combine salt, iv, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Return base64 encoded result
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    // Fallback to XOR encryption if WebCrypto fails
    return fallbackEncryptToken(token);
  }
}

/**
 * Decrypts a token using AES-GCM decryption with PBKDF2 key derivation
 */
export async function decryptToken(encryptedToken: string, passphrase?: string): Promise<string> {
  if (!encryptedToken || encryptedToken.length === 0) return encryptedToken;

  try {
    // Use environment-specific passphrase or fallback
    const keyPassphrase = passphrase || import.meta.env.VITE_ENCRYPTION_KEY || 'wunpub_social_tokens_2025_secure';

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
    const key = await deriveKey(keyPassphrase, salt);

    // Decrypt the token
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    // Fallback to XOR decryption if WebCrypto fails or data is in old format
    return fallbackDecryptToken(encryptedToken);
  }
}

/**
 * Fallback XOR encryption for compatibility
 */
function fallbackEncryptToken(token: string): string {
  if (!token || token.length === 0) return token;

  const ENCRYPTION_KEY = 'wunpub_social_tokens_2025';
  let encrypted = '';

  for (let i = 0; i < token.length; i++) {
    const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    const tokenChar = token.charCodeAt(i);
    encrypted += String.fromCharCode(tokenChar ^ keyChar);
  }

  return btoa(encrypted);
}

/**
 * Fallback XOR decryption for compatibility
 */
function fallbackDecryptToken(encryptedToken: string): string {
  if (!encryptedToken || encryptedToken.length === 0) return encryptedToken;

  try {
    const ENCRYPTION_KEY = 'wunpub_social_tokens_2025';
    const encrypted = atob(encryptedToken);
    let decrypted = '';

    for (let i = 0; i < encrypted.length; i++) {
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      const encryptedChar = encrypted.charCodeAt(i);
      decrypted += String.fromCharCode(encryptedChar ^ keyChar);
    }

    return decrypted;
  } catch (error) {
    return encryptedToken;
  }
}

/**
 * Sanitizes tokens for logging (replaces with masked version)
 */
export function sanitizeTokenForLogging(token: string): string {
  if (!token || token.length === 0) return '';
  if (token.length <= 8) return '***';

  const start = token.substring(0, 4);
  const end = token.substring(token.length - 4);
  const middle = '*'.repeat(Math.min(token.length - 8, 20));

  return `${start}${middle}${end}`;
}

/**
 * Validates if a token appears to be encrypted with new format
 */
export function isTokenEncrypted(token: string): boolean {
  if (!token) return false;

  try {
    const decoded = atob(token);
    // New format: 16-byte salt + 12-byte IV + encrypted data
    // Minimum length should be 28 bytes + some encrypted content
    if (decoded.length < 32) return false;

    // Check if it has the expected structure for AES-GCM
    const combined = new Uint8Array(decoded.split('').map(char => char.charCodeAt(0)));
    return combined.length >= 28;
  } catch {
    return false;
  }
}

/**
 * Checks if WebCrypto API is available
 */
export function isWebCryptoSupported(): boolean {
  return typeof crypto !== 'undefined' &&
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.getRandomValues !== 'undefined';
}

/**
 * Token validation utility
 */
export function validateToken(token: string): { isValid: boolean; reason?: string } {
  if (!token || typeof token !== 'string') {
    return { isValid: false, reason: 'Token is empty or not a string' };
  }

  if (token.length < 10) {
    return { isValid: false, reason: 'Token is too short' };
  }

  // Check for common token patterns
  const tokenPatterns = [
    /^[A-Za-z0-9_-]+$/, // Base64-like tokens
    /^[A-Za-z0-9+/=]+$/, // Base64 tokens
    /^pk_[a-zA-Z0-9]+$/, // Clerk-style public keys
    /^sk_[a-zA-Z0-9]+$/, // Secret keys
  ];

  const matchesPattern = tokenPatterns.some(pattern => pattern.test(token));

  return {
    isValid: matchesPattern,
    reason: matchesPattern ? undefined : 'Token format not recognized'
  };
}
