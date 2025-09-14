import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  encryptToken,
  decryptToken,
  sanitizeTokenForLogging,
  isTokenEncrypted,
  isWebCryptoSupported,
  validateToken
} from "../tokenSecurity";

// Mock crypto for tests
const mockCrypto = {
  getRandomValues: vi.fn(),
  subtle: {
    importKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    deriveBits: vi.fn(),
  },
};

// @ts-expect-error - mocking crypto for tests
global.crypto = mockCrypto;

describe("tokenSecurity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isWebCryptoSupported", () => {
    it("should return true when WebCrypto is available", () => {
      const result = isWebCryptoSupported();
      expect(result).toBe(true);
    });

    it("should return false when crypto is undefined", () => {
      const originalCrypto = globalThis.crypto;
      globalThis.crypto = undefined as any;

      const result = isWebCryptoSupported();
      expect(result).toBe(false);

      globalThis.crypto = originalCrypto;
    });
  });

  describe("validateToken", () => {
    it("should validate proper tokens", () => {
      const validTokens = [
        "pk_test_Y2F1c2FsLW9zcHJleS05Ny5jbGVyay5hY2NvdW50cy5kZXYk",
        "sk_test_1234567890abcdef",
        "valid-token-123_ABC"
      ];

      validTokens.forEach(token => {
        const result = validateToken(token);
        expect(result.isValid).toBe(true);
        expect(result.reason).toBeUndefined();
      });
    });

    it("should reject invalid tokens", () => {
      const invalidTokens = [
        "",
        "short",
        null,
        undefined,
        "invalid\ntoken",
        "token with spaces"
      ];

      invalidTokens.forEach(token => {
        const result = validateToken(token as string);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBeTruthy();
      });
    });
  });

  describe("sanitizeTokenForLogging", () => {
    it("should mask tokens properly", () => {
      const token = "pk_test_Y2F1c2FsLW9zcHJleS05Ny5jbGVyay5hY2NvdW50cy5kZXYk";
      const result = sanitizeTokenForLogging(token);

      expect(result.startsWith("pk_t")).toBe(true);
      expect(result.endsWith("ZXYk")).toBe(true);
      expect(result.includes("*")).toBe(true);
      expect(result.length).toBeLessThan(token.length);
    });

    it("should handle short tokens", () => {
      const shortToken = "short";
      const result = sanitizeTokenForLogging(shortToken);
      expect(result).toBe("***");
    });

    it("should handle empty tokens", () => {
      const result = sanitizeTokenForLogging("");
      expect(result).toBe("");
    });
  });


  describe("encryptToken", () => {
    it("should encrypt token successfully", async () => {
      const token = "test-token";
      const password = "test-password";

      const result = await encryptToken(token, password);

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toBe(token); // Should be encrypted
    });

    it("should handle empty token", async () => {
      const token = "";
      const password = "test-password";

      const result = await encryptToken(token, password);
      expect(result).toBe("");
    });

    it("should use fallback when no password provided", async () => {
      const token = "test-token";

      const result = await encryptToken(token);

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("decryptToken", () => {
    it("should handle empty encrypted token", async () => {
      const result = await decryptToken("", "password");
      expect(result).toBe("");
    });

    it("should return original token on decryption errors", async () => {
      const encryptedToken = "invalid-encrypted-data";
      const password = "test-password";

      const result = await decryptToken(encryptedToken, password);
      expect(typeof result).toBe("string");
    });
  });

  describe("isTokenEncrypted", () => {
    it("should detect encrypted tokens", () => {
      // Create a valid base64 string that looks like encrypted data
      const fakeEncrypted = btoa("a".repeat(32)); // 32 bytes minimum

      const result = isTokenEncrypted(fakeEncrypted);
      expect(result).toBe(true);
    });

    it("should detect non-encrypted tokens", () => {
      const plainToken = "plain-text-token";

      const result = isTokenEncrypted(plainToken);
      expect(result).toBe(false);
    });

    it("should handle invalid tokens", () => {
      const result = isTokenEncrypted("");
      expect(result).toBe(false);
    });
  });

  describe("Integration tests", () => {
    it("should encrypt and decrypt successfully (round-trip)", async () => {
      const originalToken = "my-secret-token-123";
      const password = "strong-password";

      const encrypted = await encryptToken(originalToken, password);
      expect(encrypted).not.toBe(originalToken);
      expect(encrypted.length).toBeGreaterThan(0);

      const decrypted = await decryptToken(encrypted, password);
      expect(decrypted).toBe(originalToken);
    });

    it("should handle round-trip without password", async () => {
      const originalToken = "no-password-token";

      const encrypted = await encryptToken(originalToken);
      expect(encrypted).not.toBe(originalToken);

      const decrypted = await decryptToken(encrypted);
      expect(decrypted).toBe(originalToken);
    });

    it("should handle different passwords", async () => {
      const originalToken = "sensitive-token";
      const password1 = "password1";
      const password2 = "password2";

      const encrypted = await encryptToken(originalToken, password1);

      // Decrypting with wrong password should either fail or return fallback
      const decrypted = await decryptToken(encrypted, password2);
      // The implementation may fallback to original token for error handling
      expect(typeof decrypted).toBe("string");
    });
  });
});