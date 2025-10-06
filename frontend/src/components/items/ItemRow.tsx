import { useState } from "react";
import type { Item } from "../../services/itemsService";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface ItemRowProps {
  item: Item;
  onUpdate: (itemId: string, value: string) => void;
  onRemove: (itemId: string) => void;
}

export default function ItemRow({ item, onUpdate, onRemove }: ItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.value);

  function startEdit() {
    setIsEditing(true);
    setEditValue(item.value);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditValue(item.value);
  }

  function handleSave() {
    if (!editValue.trim()) return;
    onUpdate(item.item_id, editValue);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="flex gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") cancelEdit();
          }}
          autoFocus
        />
        <Button onClick={handleSave} disabled={!editValue.trim()}>
          Save
        </Button>
        <Button onClick={cancelEdit}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1 rounded-lg border px-3 py-2">{item.value}</div>
      <div className="flex gap-2">
        <Button onClick={startEdit}>Edit</Button>
        <Button variant="destructive" onClick={() => onRemove(item.item_id)}>
          Delete
        </Button>
      </div>
    </div>
  );
}
