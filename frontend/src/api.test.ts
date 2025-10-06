import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "./api";

// Mock the auth module
vi.mock("./auth", () => ({
  getIdToken: vi.fn(),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock location
Object.defineProperty(window, "location", {
  value: { href: "" },
  writable: true,
});

describe("api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:3000");
    mockFetch.mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("makes request with correct URL and headers", async () => {
    const { getIdToken } = await import("./auth");
    vi.mocked(getIdToken).mockResolvedValue("test-token");

    await api("/test");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/test",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );

    const call = mockFetch.mock.calls[0];
    const headers = call[1].headers;
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("handles request without auth token", async () => {
    const { getIdToken } = await import("./auth");
    vi.mocked(getIdToken).mockResolvedValue(null);

    await api("/test");

    const call = mockFetch.mock.calls[0];
    const headers = call[1].headers;
    expect(headers.get("Authorization")).toBeNull();
  });

  it("redirects on 401 response", async () => {
    mockFetch.mockResolvedValue({ status: 401 });

    await api("/test");

    expect(window.location.href).toBe("/");
  });

  it("passes through request options", async () => {
    await api("/test", {
      method: "POST",
      body: JSON.stringify({ data: "test" }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/test",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ data: "test" }),
      }),
    );
  });
});
