import { useEffect, useState } from "react";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  type Item,
} from "../services/itemsService";

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const items = await getItems();
      setItems(items);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function add(value: string) {
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticItem: Item = {
      item_id: tempId,
      value,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    setItems((prev) => [...prev, optimisticItem]);

    setSaving(true);
    setError(null);
    try {
      await createItem(value);
      await load(); // Refresh to get real item with server ID
    } catch (e: unknown) {
      // Revert optimistic update on error
      setItems((prev) => prev.filter((item) => item.item_id !== tempId));
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function update(itemId: string, value: string) {
    // Optimistic update
    const originalItems = items;
    setItems((prev) =>
      prev.map((item) =>
        item.item_id === itemId
          ? { ...item, value, updated_at: Date.now() }
          : item,
      ),
    );

    setSaving(true);
    setError(null);
    try {
      await updateItem(itemId, value);
      await load(); // Refresh to ensure consistency
    } catch (e: unknown) {
      // Revert optimistic update on error
      setItems(originalItems);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(itemId: string) {
    // Optimistic update
    const originalItems = items;
    setItems((prev) => prev.filter((item) => item.item_id !== itemId));

    setSaving(true);
    setError(null);
    try {
      await deleteItem(itemId);
      // No need to reload after successful delete
    } catch (e: unknown) {
      // Revert optimistic update on error
      setItems(originalItems);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return { items, loading, saving, error, add, update, remove, reload: load };
}
