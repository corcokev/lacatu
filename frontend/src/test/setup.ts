import "@testing-library/jest-dom";

// Mock environment variables
Object.defineProperty(window, "import.meta", {
  value: {
    env: {
      VITE_API_BASE_URL: "http://localhost:3000",
      VITE_COGNITO_USER_POOL_ID: "us-east-1_test",
      VITE_COGNITO_CLIENT_ID: "test-client-id",
      VITE_COGNITO_DOMAIN: "test-domain",
    },
  },
});
