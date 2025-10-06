import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuthSession } from "aws-amplify/auth";
import type { ResourcesConfig } from "aws-amplify";

// Mock environment variables before module import
vi.hoisted(() => {
  vi.stubEnv("VITE_COGNITO_USER_POOL_ID", "us-east-1_test");
  vi.stubEnv("VITE_COGNITO_CLIENT_ID", "test-client-id");
  vi.stubEnv("VITE_COGNITO_DOMAIN", "test-domain");
  vi.stubEnv("VITE_API_BASE_URL", "http://localhost:3000");
});

import { initAuth, getIdToken, authorizedFetch, API_BASE } from "./auth";

// Mock AWS Amplify
vi.mock("aws-amplify", () => ({
  Amplify: {
    configure: vi.fn(),
  },
}));

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
const mockLocation = {
  origin: "https://example.com",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

describe("auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initAuth", () => {
    it("configures Amplify with environment variables", async () => {
      const { Amplify } = await import("aws-amplify");

      initAuth();

      expect(Amplify.configure).toHaveBeenCalledTimes(1);

      const configArg = vi.mocked(Amplify.configure).mock
        .calls[0][0] as ResourcesConfig;
      expect(configArg).toHaveProperty("Auth");
      expect(configArg.Auth).toHaveProperty("Cognito");
      expect(configArg.Auth?.Cognito.userPoolId).toBe("us-east-1_test");
      expect(configArg.Auth?.Cognito.userPoolClientId).toBe("test-client-id");
    });

    it("uses current origin for redirect URLs", async () => {
      const { Amplify } = await import("aws-amplify");
      mockLocation.origin = "https://different-domain.com";

      initAuth();

      const configArg = vi.mocked(Amplify.configure).mock
        .calls[0][0] as ResourcesConfig;
      const oauth = configArg.Auth?.Cognito.loginWith?.oauth;
      expect(oauth?.redirectSignIn).toEqual(["https://different-domain.com/"]);
      expect(oauth?.redirectSignOut).toEqual(["https://different-domain.com/"]);
    });

    it("includes required oauth configuration", async () => {
      const { Amplify } = await import("aws-amplify");

      initAuth();

      const configArg = vi.mocked(Amplify.configure).mock
        .calls[0][0] as ResourcesConfig;
      const oauth = configArg.Auth?.Cognito.loginWith?.oauth;
      expect(oauth?.domain).toBe("test-domain");
      expect(oauth?.scopes).toEqual(["openid", "email"]);
      expect(oauth?.responseType).toBe("code");
    });
  });

  describe("getIdToken", () => {
    it("returns token when session is valid", async () => {
      const { fetchAuthSession } = await import("aws-amplify/auth");
      const mockToken = {
        toString: () => "mock-token",
      };

      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: {
          idToken: mockToken,
        },
      } as AuthSession);

      const result = await getIdToken();

      expect(result).toBe("mock-token");
    });

    it("returns null when no token available", async () => {
      const { fetchAuthSession } = await import("aws-amplify/auth");

      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: null,
      } as unknown as AuthSession);

      const result = await getIdToken();

      expect(result).toBeNull();
    });

    it("returns null when session fetch fails", async () => {
      const { fetchAuthSession } = await import("aws-amplify/auth");

      vi.mocked(fetchAuthSession).mockRejectedValue(new Error("Auth failed"));

      const result = await getIdToken();

      expect(result).toBeNull();
    });
  });

  describe("authorizedFetch", () => {
    it("makes authenticated request with token", async () => {
      const { fetchAuthSession } = await import("aws-amplify/auth");
      const mockToken = {
        toString: () => "test-token",
      };

      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: {
          idToken: mockToken,
        },
      } as AuthSession);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await authorizedFetch("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/test",
        expect.objectContaining({
          headers: expect.any(Headers),
        }),
      );

      const call = mockFetch.mock.calls[0];
      const headers = call[1].headers;
      expect(headers.get("Authorization")).toBe("Bearer test-token");
    });

    it("throws error when not authenticated", async () => {
      const { fetchAuthSession } = await import("aws-amplify/auth");

      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: null,
      } as unknown as AuthSession);

      await expect(authorizedFetch("/test")).rejects.toThrow(
        "Not authenticated",
      );
    });

    it("sets Content-Type for requests with body", async () => {
      const { fetchAuthSession } = await import("aws-amplify/auth");
      const mockToken = {
        toString: () => "test-token",
      };

      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: {
          idToken: mockToken,
        },
      } as AuthSession);

      mockFetch.mockResolvedValue({ ok: true });

      await authorizedFetch("/test", {
        method: "POST",
        body: JSON.stringify({ data: "test" }),
      });

      const call = mockFetch.mock.calls[0];
      const headers = call[1].headers;
      expect(headers.get("Content-Type")).toBe("application/json");
    });

    it("does not override existing Content-Type header", async () => {
      const { fetchAuthSession } = await import("aws-amplify/auth");
      const mockToken = {
        toString: () => "test-token",
      };

      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: {
          idToken: mockToken,
        },
      } as AuthSession);

      mockFetch.mockResolvedValue({ ok: true });

      await authorizedFetch("/test", {
        method: "POST",
        body: "form data",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const call = mockFetch.mock.calls[0];
      const headers = call[1].headers;
      expect(headers.get("Content-Type")).toBe(
        "application/x-www-form-urlencoded",
      );
    });
  });

  describe("API_BASE", () => {
    it("uses environment variable for API base URL", () => {
      expect(API_BASE).toBe("http://localhost:3000");
    });
  });
});
