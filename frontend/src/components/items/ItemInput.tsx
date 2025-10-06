import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface ItemInputProps {
  onAdd: (value: string) => void;
  onReload: () => void;
  saving: boolean;
  loading: boolean;
}

export default function ItemInput({
  onAdd,
  onReload,
  saving,
  loading,
}: ItemInputProps) {
  const [value, setValue] = useState("");

  const disabled = saving || !value.trim();

  async function handleAdd() {
    if (!value.trim()) return;
    await onAdd(value);
    setValue("");
  }

  return (
    <div className="my-3 flex w-1/2 gap-2">
      <Input
        placeholder="Enter a string…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) void handleAdd();
        }}
      />
      <Button onClick={() => void handleAdd()} disabled={disabled}>
        {saving ? "Saving…" : "Add"}
      </Button>
      <Button onClick={onReload} disabled={loading}>
        {loading ? "Loading…" : "Refresh"}
      </Button>
    </div>
  );
}
