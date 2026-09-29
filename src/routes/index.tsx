import { createFileRoute } from "@tanstack/react-router";
import { SpaMount } from "@/lib/spaMount";

const title = "Nomi — Your Personal AI Companion";
const description = "Meet Nomi, a personal AI companion that remembers, organises tasks, and helps manage your digital life.";

export const Route = createFileRoute("/")({
  ssr: false,
  component: SpaMount,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
  }),
});
