import { Bell, Check, ListChecks, MessageCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNomi } from "../store";
import { PageHeader } from "../components/NomiShell";

export default function TasksPage() {
  const { tasks, toggleTask, removeTask, t, language } = useNomi();
  const ar = language === "ar";
  const ordered = [...tasks.filter((task) => !task.done), ...tasks.filter((task) => task.done)];
  return <div><PageHeader title={t("tasks")} subtitle={ar ? "المهام التي التقطها نومي ورتّبها من محادثاتك." : "Tasks Nomi captured and organised from your conversations."} /><div className="mx-auto w-full max-w-3xl px-5 pb-12">
    {ordered.length ? <div className="space-y-2">{ordered.map((task) => <div key={task.id} className={cn("group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-opacity", task.done && "opacity-55")}><Button type="button" onClick={() => toggleTask(task.id)} aria-label={task.title} variant={task.done ? "default" : "outline"} size="icon-sm" className="size-7 shrink-0">{task.done ? <Check className="size-3.5" /> : null}</Button><div className="min-w-0 flex-1"><p className={cn("truncate text-[15px] font-medium", task.done && "line-through")}>{task.title}</p>{task.dueAt ? <p className="text-xs text-muted-foreground">{new Date(task.dueAt).toLocaleString(ar ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}</p> : null}</div>{task.kind === "reminder" ? <Bell className="size-4 text-muted-foreground" /> : <ListChecks className="size-4 text-muted-foreground" />}<Button type="button" onClick={() => removeTask(task.id)} aria-label={t("delete")} variant="ghost" size="icon-sm" className="text-muted-foreground opacity-100 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"><Trash2 className="size-4" /></Button></div>)}</div> : <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border px-6 text-center"><span className="grid size-12 place-items-center rounded-full bg-secondary"><ListChecks className="size-5" /></span><h2 className="mt-5 text-lg font-bold">{ar ? "كل شيء هادئ" : "All clear"}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{ar ? "اطلب من نومي مهمة أو تذكيرًا أثناء المحادثة وسيضعه هنا." : "Ask Nomi for a task or reminder in chat and it will appear here."}</p><Button asChild className="mt-5"><Link to="/chat"><MessageCircle className="size-4" />{ar ? "اطلب من نومي" : "Ask Nomi"}</Link></Button></div>}
  </div></div>;
}