import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  type Item,
} from "./itemsService";

// Mock the auth module
vi.mock("../auth", () => ({
  authorizedFetch: vi.fn(),
}));

describe("itemsService", () => {
  const mockAuthorizedFetch = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    const { authorizedFetch } = await import("../auth");
    vi.mocked(authorizedFetch).mockImplementation(mockAuthorizedFetch);
  });

  describe("getItems", () => {
    it("fetches and sorts items correctly", async () => {
      const mockItems: Item[] = [
        { itemId: "2", value: "Second", createdAt: 2000, updatedAt: 2000 },
        { itemId: "1", value: "First", createdAt: 1000, updatedAt: 1000 },
      ];

      mockAuthorizedFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: mockItems }),
      });

      const result = await getItems();

      expect(mockAuthorizedFetch).toHaveBeenCalledWith("/v1/items", {
        method: "GET",
      });
      expect(result).toEqual([
        { itemId: "1", value: "First", createdAt: 1000, updatedAt: 1000 },
        { itemId: "2", value: "Second", createdAt: 2000, updatedAt: 2000 },
      ]);
    });

    it("handles empty items array", async () => {
      mockAuthorizedFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      const result = await getItems();

      expect(result).toEqual([]);
    });

    it("handles missing items property", async () => {
      mockAuthorizedFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await getItems();

      expect(result).toEqual([]);
    });

    it("throws error on failed request", async () => {
      mockAuthorizedFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(getItems()).rejects.toThrow("GET /v1/items failed (500)");
    });
  });

  describe("createItem", () => {
    it("creates item successfully", async () => {
      mockAuthorizedFetch.mockResolvedValue({ ok: true });

      await createItem("test item");

      expect(mockAuthorizedFetch).toHaveBeenCalledWith("/v1/items", {
        method: "POST",
        body: JSON.stringify({ value: "test item" }),
      });
    });

    it("throws error on failed request", async () => {
      mockAuthorizedFetch.mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(createItem("test")).rejects.toThrow(
        "POST /v1/items failed (400)",
      );
    });
  });

  describe("updateItem", () => {
    it("updates item successfully", async () => {
      mockAuthorizedFetch.mockResolvedValue({ ok: true });

      await updateItem("item123", "updated value");

      expect(mockAuthorizedFetch).toHaveBeenCalledWith("/v1/items/item123", {
        method: "PUT",
        body: JSON.stringify({ value: "updated value" }),
      });
    });

    it("throws error on failed request", async () => {
      mockAuthorizedFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(updateItem("item123", "test")).rejects.toThrow(
        "PUT /v1/items/item123 failed (404)",
      );
    });
  });

  describe("deleteItem", () => {
    it("deletes item successfully", async () => {
      mockAuthorizedFetch.mockResolvedValue({ ok: true });

      await deleteItem("item123");

      expect(mockAuthorizedFetch).toHaveBeenCalledWith("/v1/items/item123", {
        method: "DELETE",
      });
    });

    it("throws error on failed request", async () => {
      mockAuthorizedFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(deleteItem("item123")).rejects.toThrow(
        "DELETE /v1/items/item123 failed (404)",
      );
    });
  });
});
