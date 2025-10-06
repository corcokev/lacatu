import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "./HomePage";

// Mock Authenticator
vi.mock("@aws-amplify/ui-react", () => ({
  Authenticator: ({
    children,
  }: {
    children: (props: {
      user?: unknown;
      signOut?: () => void;
    }) => React.ReactElement;
  }) => (
    <div data-testid="authenticator">
      {children({ user: {}, signOut: vi.fn() })}
    </div>
  ),
}));

describe("HomePage", () => {
  const mockChildren = vi.fn(() => <div>Authenticated content</div>);

  beforeEach(() => {
    mockChildren.mockClear();
  });

  it("renders welcome screen initially", () => {
    render(<HomePage>{mockChildren}</HomePage>);

    expect(screen.getByText("Welcome to Lacatu")).toBeInTheDocument();
    expect(
      screen.getByText("Your serverless item management app"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Login / Sign Up" }),
    ).toBeInTheDocument();
  });

  it("shows authenticator when login button is clicked", async () => {
    const user = userEvent.setup();

    render(<HomePage>{mockChildren}</HomePage>);

    await user.click(screen.getByRole("button", { name: "Login / Sign Up" }));

    expect(screen.getByTestId("authenticator")).toBeInTheDocument();
    expect(mockChildren).toHaveBeenCalled();
  });

  it("does not show authenticator initially", () => {
    render(<HomePage>{mockChildren}</HomePage>);

    expect(screen.queryByTestId("authenticator")).not.toBeInTheDocument();
    expect(mockChildren).not.toHaveBeenCalled();
  });
});
