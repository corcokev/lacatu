import { Amplify, type ResourcesConfig } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";

const requiredEnvVars = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  domain: import.meta.env.VITE_COGNITO_DOMAIN,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
} as const;

// Validate required environment variables
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(
      `Missing required environment variable: VITE_${key.toUpperCase()}`,
    );
  }
}

export function initAuth() {
  const cfg: ResourcesConfig = {
    Auth: {
      Cognito: {
        userPoolId: requiredEnvVars.userPoolId,
        userPoolClientId: requiredEnvVars.userPoolClientId,
        loginWith: {
          oauth: {
            domain: requiredEnvVars.domain,
            scopes: ["openid", "email"],
            redirectSignIn: [window.location.origin + "/"],
            redirectSignOut: [window.location.origin + "/"],
            responseType: "code" as const,
          },
        },
      },
    },
  };

  Amplify.configure(cfg);
}

// Helpers to call the protected API
export async function getIdToken(): Promise<string | null> {
  try {
    const s = await fetchAuthSession();
    return s.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

export const API_BASE = requiredEnvVars.apiBaseUrl;

// src/auth.ts
export async function authorizedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getIdToken();
  if (!token) throw new Error("Not authenticated");

  const headers = new Headers(init.headers ?? {});
  headers.set("Authorization", `Bearer ${token}`);

  // Only set Content-Type if we are sending a JSON body
  const hasBody = typeof init.body !== "undefined";
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
