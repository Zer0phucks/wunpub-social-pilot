/**
 * Client-side token security utilities
 * Provides encryption/decryption for sensitive social media tokens
 */

// Simple XOR encryption for client-side token protection
// Note: This is NOT cryptographically secure but adds a layer of obfuscation
const ENCRYPTION_KEY = 'wunpub_social_tokens_2025';

/**
 * Encrypts a token using simple XOR encryption
 */
export function encryptToken(token: string): string {
  if (!token || token.length === 0) return token;
  
  let encrypted = '';
  for (let i = 0; i < token.length; i++) {
    const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    const tokenChar = token.charCodeAt(i);
    encrypted += String.fromCharCode(tokenChar ^ keyChar);
  }
  
  // Encode as base64 to make it safe for storage
  return btoa(encrypted);
}

/**
 * Decrypts a token using simple XOR decryption
 */
export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken || encryptedToken.length === 0) return encryptedToken;
  
  try {
    // Decode from base64
    const encrypted = atob(encryptedToken);
    
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      const encryptedChar = encrypted.charCodeAt(i);
      decrypted += String.fromCharCode(encryptedChar ^ keyChar);
    }
    
    return decrypted;
  } catch (error) {
    console.warn('Failed to decrypt token:', error);
    return encryptedToken; // Return as-is if decryption fails
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
 * Validates if a token appears to be encrypted
 */
export function isTokenEncrypted(token: string): boolean {
  if (!token) return false;
  
  // Check if it looks like base64 encoded data
  try {
    const decoded = atob(token);
    // If it decodes and contains non-printable characters, likely encrypted
    return /[\x00-\x1F\x7F-\xFF]/.test(decoded);
  } catch {
    return false;
  }
}

/**
 * Securely clears a token from memory (basic attempt)
 */
export function clearToken(tokenRef: { value: string }): void {
  if (tokenRef.value) {
    // Overwrite with random data multiple times
    for (let i = 0; i < 3; i++) {
      tokenRef.value = Math.random().toString(36).repeat(tokenRef.value.length);
    }
    tokenRef.value = '';
  }
}