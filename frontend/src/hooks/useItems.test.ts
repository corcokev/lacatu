import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useItems } from "./useItems";
import type { Item } from "../services/itemsService";

// Mock the itemsService
vi.mock("../services/itemsService", () => ({
  getItems: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}));

describe("useItems", () => {
  const mockItems: Item[] = [
    { item_id: "1", value: "Test Item 1", created_at: 1000, updated_at: 1000 },
    { item_id: "2", value: "Test Item 2", created_at: 2000, updated_at: 2000 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads items on mount", async () => {
    const { getItems } = await import("../services/itemsService");
    vi.mocked(getItems).mockResolvedValue(mockItems);

    const { result } = renderHook(() => useItems());

    expect(result.current.loading).toBe(true);
    expect(result.current.items).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual(mockItems);
    expect(result.current.error).toBeNull();
  });

  it("handles loading error", async () => {
    const { getItems } = await import("../services/itemsService");
    vi.mocked(getItems).mockRejectedValue(new Error("Failed to load"));

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load");
    expect(result.current.items).toEqual([]);
  });

  it("adds item with optimistic update", async () => {
    const { getItems, createItem } = await import("../services/itemsService");
    vi.mocked(getItems).mockResolvedValue(mockItems);
    vi.mocked(createItem).mockResolvedValue();

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialItemCount = result.current.items.length;

    act(() => {
      result.current.add("New Item");
    });

    // Should immediately show optimistic item
    expect(result.current.items.length).toBe(initialItemCount + 1);
    expect(result.current.items[result.current.items.length - 1].value).toBe(
      "New Item",
    );
    expect(
      result.current.items[result.current.items.length - 1].item_id,
    ).toMatch(/^temp-/);

    await waitFor(() => {
      expect(result.current.saving).toBe(false);
    });

    expect(createItem).toHaveBeenCalledWith("New Item");
    expect(getItems).toHaveBeenCalledTimes(2); // Once on mount, once after add
  });

  it("reverts optimistic add on error", async () => {
    const { getItems, createItem } = await import("../services/itemsService");
    vi.mocked(getItems).mockResolvedValue(mockItems);
    vi.mocked(createItem).mockRejectedValue(new Error("Failed to create"));

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialItemCount = result.current.items.length;

    await act(async () => {
      await result.current.add("New Item");
    });

    // Should revert to original items after error
    expect(result.current.items.length).toBe(initialItemCount);
    expect(result.current.error).toBe("Failed to create");
    expect(result.current.saving).toBe(false);
  });

  it("updates item with optimistic update", async () => {
    const { getItems, updateItem } = await import("../services/itemsService");
    vi.mocked(getItems).mockResolvedValue(mockItems);
    vi.mocked(updateItem).mockResolvedValue();

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.update("1", "Updated Item");
    });

    // Should immediately show updated value
    const updatedItem = result.current.items.find(
      (item) => item.item_id === "1",
    );
    expect(updatedItem?.value).toBe("Updated Item");

    await waitFor(() => {
      expect(result.current.saving).toBe(false);
    });

    expect(updateItem).toHaveBeenCalledWith("1", "Updated Item");
  });

  it("removes item with optimistic update", async () => {
    const { getItems, deleteItem } = await import("../services/itemsService");
    vi.mocked(getItems).mockResolvedValue(mockItems);
    vi.mocked(deleteItem).mockResolvedValue();

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialItemCount = result.current.items.length;

    act(() => {
      result.current.remove("1");
    });

    // Should immediately remove item
    expect(result.current.items.length).toBe(initialItemCount - 1);
    expect(
      result.current.items.find((item) => item.item_id === "1"),
    ).toBeUndefined();

    await waitFor(() => {
      expect(result.current.saving).toBe(false);
    });

    expect(deleteItem).toHaveBeenCalledWith("1");
  });

  it("reverts optimistic update on error", async () => {
    const { getItems, updateItem } = await import("../services/itemsService");
    vi.mocked(getItems).mockResolvedValue(mockItems);
    vi.mocked(updateItem).mockRejectedValue(new Error("Failed to update"));

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const originalValue = result.current.items.find(
      (item) => item.item_id === "1",
    )?.value;

    await act(async () => {
      await result.current.update("1", "Updated Item");
    });

    // Should revert to original value after error
    const revertedItem = result.current.items.find(
      (item) => item.item_id === "1",
    );
    expect(revertedItem?.value).toBe(originalValue);
    expect(result.current.error).toBe("Failed to update");
  });

  it("reverts optimistic delete on error", async () => {
    const { getItems, deleteItem } = await import("../services/itemsService");
    vi.mocked(getItems).mockResolvedValue(mockItems);
    vi.mocked(deleteItem).mockRejectedValue(new Error("Failed to delete"));

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialItemCount = result.current.items.length;

    await act(async () => {
      await result.current.remove("1");
    });

    // Should restore deleted item after error
    expect(result.current.items.length).toBe(initialItemCount);
    expect(
      result.current.items.find((item) => item.item_id === "1"),
    ).toBeDefined();
    expect(result.current.error).toBe("Failed to delete");
  });

  it("reloads items", async () => {
    const { getItems } = await import("../services/itemsService");
    vi.mocked(getItems).mockResolvedValue(mockItems);

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.reload();
    });

    expect(getItems).toHaveBeenCalledTimes(2); // Once on mount, once on reload
  });
});
