import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Item } from "../../services/itemsService";
import Items from "./Items";

// Mock the useItems hook
const mockUseItems = vi.fn();
vi.mock("../../hooks/useItems", () => ({
  useItems: () => mockUseItems(),
}));

const mockItems: Item[] = [
  {
    itemId: "1",
    value: "Item 1",
    createdAt: 1234567890123,
    updatedAt: 1234567890123,
  },
  {
    itemId: "2",
    value: "Item 2",
    createdAt: 1234567890124,
    updatedAt: 1234567890124,
  },
];

describe("Items", () => {
  const defaultHookReturn = {
    items: mockItems,
    loading: false,
    saving: false,
    error: null,
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    reload: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseItems.mockReturnValue(defaultHookReturn);
  });

  it("renders items list", () => {
    render(<Items />);

    expect(screen.getByText("Your items")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("shows empty state when no items", () => {
    mockUseItems.mockReturnValue({
      ...defaultHookReturn,
      items: [],
    });

    render(<Items />);

    expect(screen.getByText("No items yet.")).toBeInTheDocument();
  });

  it("does not show empty state when loading", () => {
    mockUseItems.mockReturnValue({
      ...defaultHookReturn,
      items: [],
      loading: true,
    });

    render(<Items />);

    expect(screen.queryByText("No items yet.")).not.toBeInTheDocument();
  });

  it("displays error message when error exists", () => {
    mockUseItems.mockReturnValue({
      ...defaultHookReturn,
      error: "Failed to load items",
    });

    render(<Items />);

    expect(screen.getByText("Failed to load items")).toBeInTheDocument();
  });

  it("renders ItemInput component", () => {
    render(<Items />);

    expect(screen.getByPlaceholderText("Enter a string…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });
});
