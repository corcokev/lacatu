import { authorizedFetch } from "../auth";

export type Item = {
  itemId: string;
  value: string;
  createdAt: number;
  updatedAt: number;
};

export async function getItems(): Promise<Item[]> {
  const res = await authorizedFetch("/v1/items", { method: "GET" });
  if (!res.ok) throw new Error(`GET /v1/items failed (${res.status})`);
  const data = await res.json();
  const itemsArray = Array.isArray(data.items) ? data.items : [];
  return itemsArray.sort((a: Item, b: Item) => a.createdAt - b.createdAt);
}

export async function createItem(value: string): Promise<void> {
  const res = await authorizedFetch("/v1/items", {
    method: "POST",
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error(`POST /v1/items failed (${res.status})`);
}

export async function updateItem(itemId: string, value: string): Promise<void> {
  const res = await authorizedFetch(`/v1/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  });
  if (!res.ok)
    throw new Error(`PUT /v1/items/${itemId} failed (${res.status})`);
}

export async function deleteItem(itemId: string): Promise<void> {
  const res = await authorizedFetch(`/v1/items/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok)
    throw new Error(`DELETE /v1/items/${itemId} failed (${res.status})`);
}
