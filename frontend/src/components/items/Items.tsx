import { useItems } from "../../hooks/useItems";
import ItemRow from "./ItemRow";
import ItemInput from "./ItemInput";

export default function Items() {
  const { items, loading, saving, error, add, update, remove, reload } =
    useItems();

  return (
    <section className="mt-6 flex flex-col items-center">
      <h2 className="text-xl font-medium">Your items</h2>

      <div className="w-1/2">
        {items.map((item) => (
          <div key={item.item_id} className="mb-2 rounded-lg">
            <ItemRow item={item} onUpdate={update} onRemove={remove} />
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div className="opacity-70">No items yet.</div>
        )}
      </div>

      <ItemInput
        onAdd={add}
        onReload={reload}
        saving={saving}
        loading={loading}
      />

      {error && (
        <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}
    </section>
  );
}
