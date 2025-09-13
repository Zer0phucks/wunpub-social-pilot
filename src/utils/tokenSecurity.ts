/**
 * Client-side token security utilities
 * Provides encryption/decryption for sensitive social media tokens
 * WARNING: This is client-side obfuscation only. Sensitive tokens should be stored server-side.
 */

// Enhanced XOR encryption with random salt for better security
// Note: This is client-side obfuscation. Real security requires server-side encryption.
const ENCRYPTION_KEY = 'wunpub_social_tokens_2025_secure';

/**
 * Encrypts a token using enhanced XOR encryption with salt
 */
export function encryptToken(token: string): string {
  if (!token || token.length === 0) return token;
  
  try {
    // Generate random salt for better security
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltString = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    
    let encrypted = '';
    for (let i = 0; i < token.length; i++) {
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      const saltChar = salt[i % salt.length];
      const tokenChar = token.charCodeAt(i);
      encrypted += String.fromCharCode(tokenChar ^ keyChar ^ saltChar);
    }
    
    // Prepend salt to encrypted data and encode as base64
    return btoa(saltString + encrypted);
  } catch (error) {
    // Fallback to simple encoding if crypto is not available
    return btoa(token);
  }
}

/**
 * Decrypts a token using enhanced XOR decryption with salt
 */
export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken || encryptedToken.length === 0) return encryptedToken;
  
  try {
    // Decode from base64
    const decoded = atob(encryptedToken);
    
    // Check if this looks like our enhanced format (has salt prefix)
    if (decoded.length >= 32) {
      // Extract salt from first 32 characters (16 bytes in hex)
      const saltString = decoded.substring(0, 32);
      const encrypted = decoded.substring(32);
      
      // Convert salt back to bytes
      const salt = new Uint8Array(16);
      for (let i = 0; i < 16; i++) {
        salt[i] = parseInt(saltString.substring(i * 2, i * 2 + 2), 16);
      }
      
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
        const saltChar = salt[i % salt.length];
        const encryptedChar = encrypted.charCodeAt(i);
        decrypted += String.fromCharCode(encryptedChar ^ keyChar ^ saltChar);
      }
      
      return decrypted;
    } else {
      // Fallback: treat as simple base64 encoded token
      return decoded;
    }
  } catch (error) {
    // Silent fallback - don't log sensitive data
    return ''; // Return empty string for invalid tokens
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
 * Securely clears a token from memory (enhanced)
 */
export function clearToken(tokenRef: { value: string }): void {
  if (tokenRef.value) {
    const length = tokenRef.value.length;
    // Overwrite with random data multiple times
    for (let i = 0; i < 5; i++) {
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const randomBytes = crypto.getRandomValues(new Uint8Array(length));
        tokenRef.value = Array.from(randomBytes).map(b => String.fromCharCode(b)).join('');
      } else {
        tokenRef.value = Math.random().toString(36).repeat(Math.ceil(length / 11));
      }
    }
    tokenRef.value = '';
  }
}

/**
 * Validates token format and basic security checks
 */
export function validateTokenSecurity(token: string): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  if (!token) {
    return { isValid: false, warnings: ['Token is empty'] };
  }
  
  if (token.length < 10) {
    warnings.push('Token appears too short for a secure token');
  }
  
  if (!/[A-Za-z0-9+/=]/.test(token)) {
    warnings.push('Token contains unexpected characters');
  }
  
  // Check if token looks like it's properly encrypted
  if (!isTokenEncrypted(token) && token.length > 20) {
    warnings.push('Token appears to be stored in plaintext');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}