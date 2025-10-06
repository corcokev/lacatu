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

  it("adds item successfully", async () => {
    const { getItems, createItem } = await import("../services/itemsService");
    vi.mocked(getItems).mockResolvedValue(mockItems);
    vi.mocked(createItem).mockResolvedValue();

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.add("New Item");
    });

    expect(createItem).toHaveBeenCalledWith("New Item");
    expect(getItems).toHaveBeenCalledTimes(2); // Once on mount, once after add
    expect(result.current.saving).toBe(false);
  });

  it("handles add error", async () => {
    const { getItems, createItem } = await import("../services/itemsService");
    vi.mocked(getItems).mockResolvedValue(mockItems);
    vi.mocked(createItem).mockRejectedValue(new Error("Failed to create"));

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.add("New Item");
    });

    expect(result.current.error).toBe("Failed to create");
    expect(result.current.saving).toBe(false);
  });

  it("updates item successfully", async () => {
    const { getItems, updateItem } = await import("../services/itemsService");
    vi.mocked(getItems).mockResolvedValue(mockItems);
    vi.mocked(updateItem).mockResolvedValue();

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.update("1", "Updated Item");
    });

    expect(updateItem).toHaveBeenCalledWith("1", "Updated Item");
    expect(result.current.saving).toBe(false);
  });

  it("removes item successfully", async () => {
    const { getItems, deleteItem } = await import("../services/itemsService");
    vi.mocked(getItems).mockResolvedValue(mockItems);
    vi.mocked(deleteItem).mockResolvedValue();

    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.remove("1");
    });

    expect(deleteItem).toHaveBeenCalledWith("1");
    expect(result.current.saving).toBe(false);
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
