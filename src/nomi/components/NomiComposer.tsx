import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Paperclip, Phone, Plus, Square } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface NomiComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  busy: boolean;
  placeholder: string;
  ar: boolean;
}

export function NomiComposer({ value, onChange, onSend, busy, placeholder, ar }: NomiComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const expanded = focused || value.trim().length > 0;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  }, [value]);

  return (
    <motion.form
      layout
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
      className={cn("nomi-composer", expanded && "nomi-composer-expanded")}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        rows={1}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            onSend();
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="nomi-composer-textarea"
      />

      <div className={cn("nomi-composer-controls", !expanded && "nomi-composer-controls-compact")}>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" className="nomi-composer-tool" aria-label={ar ? "إضافة" : "Add"}>
              <Plus />
            </Button>
          </PopoverTrigger>
          <PopoverContent align={ar ? "end" : "start"} side="top" className="w-52 p-1.5">
            <Button type="button" variant="ghost" className="h-10 w-full justify-start rounded-xl px-3">
              <Paperclip className="size-4" />{ar ? "إرفاق ملف" : "Attach file"}
            </Button>
          </PopoverContent>
        </Popover>

        <span className="flex-1" />
        <AnimatePresence mode="popLayout" initial={false}>
          {busy ? (
            <motion.div key="stop" initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }}>
              <Button type="button" size="icon-sm" variant="destructive" className="size-9" aria-label={ar ? "إيقاف" : "Stop"}>
                <Square className="size-3 fill-current" />
              </Button>
            </motion.div>
          ) : value.trim() ? (
            <motion.div key="send" initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }}>
              <Button type="submit" size="icon-sm" className="size-9" aria-label={ar ? "إرسال" : "Send"}>
                <ArrowUp className="size-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div key="call" initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }}>
              <Button asChild type="button" size="icon-sm" variant="ghost" className="nomi-composer-call size-9" aria-label={ar ? "اتصل بنومي" : "Call Nomi"}>
                <Link to="/call"><Phone className="size-4" /></Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  );
}