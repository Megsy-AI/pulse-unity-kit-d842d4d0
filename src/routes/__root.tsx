import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import "../styles/app.css";

const BOOT_STYLE = `
:root { color-scheme: light; }
  html, body { margin: 0; background-color: #f7f7f4; }
  #root { min-height: 100dvh; background-color: #f7f7f4; }
html.dark { color-scheme: dark; }
html.dark, html.dark body, html.dark #root { background-color: #17161c; }
`;

const THEME_BOOT_SCRIPT = `
(function(){try{
  var m = localStorage.getItem("nomi_theme") || "light";
  var t = m === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : m;
  var h = document.documentElement;
  h.classList.toggle("dark", t === "dark");
  h.style.colorScheme = t;
  var lang = localStorage.getItem("nomi_language") || "en";
  h.setAttribute("lang", lang);
  h.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
}catch(e){}})();
`;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#f7f7f4" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Cairo:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&display=swap" },
      { rel: "stylesheet", href: "https://db.onlinewebfonts.com/c/2bf40ab72ea4897a3fd9b6e48b233a19?family=Garamond" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <RootHtml>
      <Outlet />
    </RootHtml>
  );
}

function RootHtml({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <style dangerouslySetInnerHTML={{ __html: BOOT_STYLE }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <div id="root">{children}</div>
        <Scripts />
      </body>
    </html>
  );
}
