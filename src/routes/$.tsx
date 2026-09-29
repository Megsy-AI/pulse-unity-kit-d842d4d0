import { createFileRoute } from "@tanstack/react-router";
import { SpaMount } from "@/lib/spaMount";

export const Route = createFileRoute("/$")({
  ssr: false,
  component: SpaMount,
  head: ({ params }) => {
    const section = String(params._splat || "Companion").split("/")[0].replace(/[-_]/g, " ");
    const name = section.charAt(0).toUpperCase() + section.slice(1);
    const title = `${name} — Nomi`;
    const description = `${name} in Nomi, your personal AI companion for chat, tasks, reminders and daily life.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});
