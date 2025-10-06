import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ItemInput from "./ItemInput";

describe("ItemInput", () => {
  const defaultProps = {
    onAdd: vi.fn(),
    onReload: vi.fn(),
    saving: false,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders input and buttons", () => {
    render(<ItemInput {...defaultProps} />);

    expect(screen.getByPlaceholderText("Enter a string…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });

  it("calls onAdd when add button is clicked", async () => {
    const user = userEvent.setup();

    render(<ItemInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("Enter a string…");
    await user.type(input, "test item");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(defaultProps.onAdd).toHaveBeenCalledWith("test item");
  });

  it("calls onAdd when Enter is pressed", async () => {
    const user = userEvent.setup();

    render(<ItemInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("Enter a string…");
    await user.type(input, "test item");
    await user.keyboard("{Enter}");

    expect(defaultProps.onAdd).toHaveBeenCalledWith("test item");
  });

  it("clears input after adding", async () => {
    const user = userEvent.setup();

    render(<ItemInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("Enter a string…");
    await user.type(input, "test item");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(input).toHaveValue("");
  });

  it("disables add button when input is empty", () => {
    render(<ItemInput {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("disables add button when saving", () => {
    render(<ItemInput {...defaultProps} saving={true} />);

    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });

  it("calls onReload when refresh button is clicked", async () => {
    const user = userEvent.setup();

    render(<ItemInput {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    expect(defaultProps.onReload).toHaveBeenCalledTimes(1);
  });

  it("shows loading state on refresh button", () => {
    render(<ItemInput {...defaultProps} loading={true} />);

    expect(screen.getByRole("button", { name: "Loading…" })).toBeDisabled();
  });
});
