import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuthUser } from "aws-amplify/auth";
import Header from "./Header";

const mockUser: AuthUser = {
  username: "testuser",
  userId: "123",
  signInDetails: {
    loginId: "test@example.com",
  },
} as AuthUser;

describe("Header", () => {
  it("renders app title and logo", () => {
    render(<Header user={undefined} signOut={undefined} />);

    expect(screen.getByText("Lacatu")).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("displays user login info when user is provided", () => {
    render(<Header user={mockUser} signOut={vi.fn()} />);

    expect(screen.getByText("Signed in as")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("calls signOut when sign out button is clicked", async () => {
    const signOut = vi.fn();
    const user = userEvent.setup();

    render(<Header user={mockUser} signOut={signOut} />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("renders without user", () => {
    render(<Header user={undefined} signOut={undefined} />);

    expect(screen.queryByText("Signed in as")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
  });
});
