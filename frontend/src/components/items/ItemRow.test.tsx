import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Item } from "../../services/itemsService";
import ItemRow from "./ItemRow";

const mockItem: Item = {
  itemId: "123",
  value: "Test item",
  createdAt: 1234567890123,
  updatedAt: 1234567890123,
};

describe("ItemRow", () => {
  const defaultProps = {
    item: mockItem,
    onUpdate: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders item value and action buttons", () => {
    render(<ItemRow {...defaultProps} />);

    expect(screen.getByText("Test item")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("enters edit mode when edit button is clicked", async () => {
    const user = userEvent.setup();

    render(<ItemRow {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByDisplayValue("Test item")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("calls onUpdate when save is clicked", async () => {
    const user = userEvent.setup();

    render(<ItemRow {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const input = screen.getByDisplayValue("Test item");
    await user.clear(input);
    await user.type(input, "Updated item");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(defaultProps.onUpdate).toHaveBeenCalledWith("123", "Updated item");
  });

  it("calls onUpdate when Enter is pressed", async () => {
    const user = userEvent.setup();

    render(<ItemRow {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const input = screen.getByDisplayValue("Test item");
    await user.clear(input);
    await user.type(input, "Updated item");
    await user.keyboard("{Enter}");

    expect(defaultProps.onUpdate).toHaveBeenCalledWith("123", "Updated item");
  });

  it("cancels edit when cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(<ItemRow {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Test item")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Test item")).not.toBeInTheDocument();
  });

  it("cancels edit when Escape is pressed", async () => {
    const user = userEvent.setup();

    render(<ItemRow {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.keyboard("{Escape}");

    expect(screen.getByText("Test item")).toBeInTheDocument();
  });

  it("calls onRemove when delete button is clicked", async () => {
    const user = userEvent.setup();

    render(<ItemRow {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(defaultProps.onRemove).toHaveBeenCalledWith("123");
  });

  it("disables save button when input is empty", async () => {
    const user = userEvent.setup();

    render(<ItemRow {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const input = screen.getByDisplayValue("Test item");
    await user.clear(input);

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
