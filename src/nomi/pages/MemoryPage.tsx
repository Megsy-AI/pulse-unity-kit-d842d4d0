import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useNomi } from "../store";
import { NomiAvatar } from "../avatar/NomiAvatar";
import { PageHeader } from "../components/NomiShell";

export default function MemoryPage() {
  const { companion, memories, addMemory, toggleMemory, removeMemory, t, language } = useNomi();
  const [value, setValue] = useState("");
  const ar = language === "ar";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim()) return;
    addMemory(value.trim());
    setValue("");
  };

  return (
    <div>
      <PageHeader title={t("memory")} subtitle={t("memoryHint")} />

      <div className="mx-auto w-full max-w-2xl px-5 pb-10 md:px-6">
        <form onSubmit={submit} className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={ar ? "مثلاً: بحب القهوة سادة" : "e.g. I drink my coffee black"}
            className="h-11 rounded-md"
          />
          <Button type="submit" className="h-11 rounded-md px-5">
            <Plus className="size-4" />
            {t("add")}
          </Button>
        </form>

        {memories.length === 0 ? (
          <div className="mt-10 flex flex-col items-center text-center">
            <NomiAvatar companion={companion} pose="think" size={170} />
            <p className="mt-3 text-sm text-muted-foreground">{t("noMemories")}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            {memories.map((memory) => (
              <div
                key={memory.id}
                className="group flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 shadow-sm"
              >
                <Switch
                  checked={memory.enabled}
                  onCheckedChange={() => toggleMemory(memory.id)}
                  aria-label={memory.content}
                />
                <p className="min-w-0 flex-1 text-[15px]">{memory.content}</p>
                <Button
                  type="button"
                  onClick={() => removeMemory(memory.id)}
                  aria-label={t("delete")}
                  variant="ghost" size="icon-sm" className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
