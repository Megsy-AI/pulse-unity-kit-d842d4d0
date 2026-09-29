import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: string; content: string };

import type { NomiAction } from "@/nomi/types";

const TOOLS = [
  {
    type: "function",
    function: {
      name: "create_task",
      description:
        "Create a task or a timed reminder for the user. Use kind=reminder when the user wants to be reminded at a time. due_at must be an absolute ISO 8601 datetime with timezone offset, computed from the current time given in the system prompt.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          note: { type: "string" },
          kind: { type: "string", enum: ["task", "reminder"] },
          due_at: { type: "string", description: "ISO 8601 with offset, or omit" },
          project: { type: "string", description: "Existing project name, if relevant" },
        },
        required: ["title", "kind"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "complete_task",
      description: "Mark one of the user's open tasks as done, matched by title.",
      parameters: {
        type: "object",
        properties: { title: { type: "string" } },
        required: ["title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_memory",
      description:
        "Remember a durable fact about the user (preferences, people, routines, goals). Do not save trivial or one-off details.",
      parameters: {
        type: "object",
        properties: {
          content: { type: "string" },
          category: { type: "string", enum: ["preference", "person", "routine", "goal", "fact"] },
        },
        required: ["content", "category"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_project",
      description: "Create a project to group related tasks when the user starts a multi-step goal.",
      parameters: {
        type: "object",
        properties: { name: { type: "string" }, description: { type: "string" } },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "request_integration",
      description:
        "Ask the user to connect an integration that is needed but not enabled (email, calendar, calls, web).",
      parameters: {
        type: "object",
        properties: {
          integration: { type: "string", enum: ["email", "calendar", "calls", "web"] },
          reason: { type: "string" },
        },
        required: ["integration", "reason"],
        additionalProperties: false,
      },
    },
  },
];

function parseActions(calls: Array<{ function?: { name?: string; arguments?: string } }> | undefined) {
  const actions: NomiAction[] = [];
  for (const call of calls ?? []) {
    const name = call.function?.name;
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(call.function?.arguments || "{}");
    } catch {
      continue;
    }
    const str = (k: string) => (typeof args[k] === "string" ? (args[k] as string).slice(0, 500) : undefined);
    if (name === "create_task" && str("title")) {
      const due = str("due_at");
      actions.push({
        type: "create_task",
        title: str("title")!,
        note: str("note"),
        kind: args.kind === "reminder" ? "reminder" : "task",
        due_at: due && !Number.isNaN(Date.parse(due)) ? new Date(due).toISOString() : null,
        project: str("project"),
      });
    } else if (name === "complete_task" && str("title")) {
      actions.push({ type: "complete_task", title: str("title")! });
    } else if (name === "save_memory" && str("content")) {
      actions.push({ type: "save_memory", content: str("content")!, category: str("category") ?? "fact" });
    } else if (name === "create_project" && str("name")) {
      actions.push({ type: "create_project", name: str("name")!, description: str("description") });
    } else if (name === "request_integration" && str("integration")) {
      actions.push({
        type: "request_integration",
        integration: str("integration") as "email",
        reason: str("reason") ?? "",
      });
    }
  }
  return actions;
}

async function callGateway(apiKey: string, body: unknown) {
  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export const Route = createFileRoute("/api/nomi-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "ai_unavailable" }, { status: 503 });

        let body: { messages?: unknown };
        try {
          body = (await request.json()) as { messages?: unknown };
        } catch {
          return Response.json({ error: "invalid_body" }, { status: 400 });
        }

        const raw = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];
        const messages = raw
          .filter((m) => m && typeof m.content === "string" && m.content.trim())
          .slice(-17)
          .map((m) => ({
            role: m.role === "assistant" ? "assistant" : m.role === "system" ? "system" : "user",
            content: String(m.content).slice(0, 8000),
          }));

        if (!messages.length) return Response.json({ error: "messages_required" }, { status: 400 });

        try {
          const response = await callGateway(apiKey, {
            model: "google/gemini-3-flash-preview",
            messages,
            tools: TOOLS,
          });

          if (response.status === 429) return Response.json({ error: "rate_limited" }, { status: 429 });
          if (response.status === 402) return Response.json({ error: "credits_required" }, { status: 402 });
          if (!response.ok) {
            console.error("nomi-chat gateway error", response.status, await response.text());
            return Response.json({ error: "ai_failed" }, { status: 502 });
          }

          const payload = (await response.json()) as {
            choices?: Array<{
              message?: {
                content?: string | null;
                tool_calls?: Array<{ id?: string; function?: { name?: string; arguments?: string } }>;
              };
            }>;
          };
          const msg = payload.choices?.[0]?.message;
          const actions = parseActions(msg?.tool_calls);
          let reply = msg?.content?.trim() ?? "";

          // Model only called tools: ask it once more for a short confirmation.
          if (!reply && msg?.tool_calls?.length) {
            const follow = await callGateway(apiKey, {
              model: "google/gemini-3-flash-preview",
              messages: [
                ...messages,
                { role: "assistant", content: null, tool_calls: msg.tool_calls },
                ...msg.tool_calls.map((c) => ({ role: "tool", tool_call_id: c.id, content: "ok" })),
              ],
            });
            if (follow.ok) {
              const fp = (await follow.json()) as { choices?: Array<{ message?: { content?: string } }> };
              reply = fp.choices?.[0]?.message?.content?.trim() ?? "";
            }
          }

          if (!reply && !actions.length) return Response.json({ error: "empty_reply" }, { status: 502 });
          return Response.json({ reply, actions });
        } catch (error) {
          console.error("nomi-chat failed", error);
          return Response.json({ error: "ai_failed" }, { status: 502 });
        }
      },
    },
  },
});
