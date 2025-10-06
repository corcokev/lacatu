import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

// Mock the components
vi.mock("./components/items/Items", () => ({
  default: () => <div data-testid="items">Items Component</div>,
}));

vi.mock("./components/header/Header", () => ({
  default: ({
    user,
  }: {
    user: { username?: string } | null;
    signOut: () => void;
  }) => (
    <div data-testid="header">
      Header Component - User: {user?.username || "Anonymous"}
    </div>
  ),
}));

vi.mock("./components/home/HomePage", () => ({
  default: ({
    children,
  }: {
    children: (props: {
      user: { username: string };
      signOut: () => void;
    }) => React.ReactNode;
  }) => (
    <div data-testid="homepage">
      {children({ user: { username: "testuser" }, signOut: vi.fn() })}
    </div>
  ),
}));

describe("App", () => {
  it("renders main components", () => {
    render(<App />);

    expect(screen.getByTestId("homepage")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("items")).toBeInTheDocument();
  });

  it("renders with correct structure", () => {
    render(<App />);

    const main = screen.getByRole("main");
    expect(main).toHaveClass("flex", "flex-col", "gap-4", "p-4");
  });
});
