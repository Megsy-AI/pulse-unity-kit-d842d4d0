import { FolderKanban, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNomi } from "../store";
import { PageHeader } from "../components/NomiShell";

export default function ProjectsPage() {
  const { projects, tasks, language } = useNomi();
  const ar = language === "ar";
  return <div><PageHeader title={ar ? "المشاريع" : "Projects"} subtitle={ar ? "نومي ينشئ المشاريع من محادثتك ويربط بها المهام تلقائيًا." : "Nomi creates projects from your conversation and links tasks automatically."} /><div className="mx-auto max-w-5xl px-5 pb-12 md:px-8">
    {projects.length ? <div className="grid gap-3 sm:grid-cols-2">{projects.map((project) => { const count = tasks.filter((task) => task.projectId === project.id).length; return <article key={project.id} className="rounded-3xl border border-border bg-card p-5"><span className="grid size-11 place-items-center rounded-full bg-secondary"><FolderKanban className="size-5" /></span><h2 className="mt-5 text-lg font-bold">{project.name}</h2>{project.description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{project.description}</p> : null}<p className="mt-5 text-xs font-semibold text-muted-foreground">{ar ? `${count} مهام` : `${count} tasks`}</p></article>; })}</div> : <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border px-6 text-center"><span className="grid size-12 place-items-center rounded-full bg-secondary"><FolderKanban className="size-5" /></span><h2 className="mt-5 text-lg font-bold">{ar ? "اترك البداية لنومي" : "Let Nomi start it"}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{ar ? "احكِ له عن هدف أو رحلة أو فكرة، وسيظهر المشروع هنا تلقائيًا." : "Tell Nomi about a goal, trip, or idea and the project will appear here automatically."}</p><Button asChild className="mt-5"><Link to="/chat"><MessageCircle className="size-4" />{ar ? "تحدث مع نومي" : "Chat with Nomi"}</Link></Button></div>}
  </div></div>;
}