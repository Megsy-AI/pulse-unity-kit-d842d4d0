import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { askNomi, type NomiAction } from "./ai";
import { detectPose } from "./intent";
import { makeT } from "./i18n";
import {
  DEFAULT_COMPANION,
  DEFAULT_PERMISSIONS,
  type NomiCompanion,
  type NomiIntegrationRequest,
  type NomiLanguage,
  type NomiMemory,
  type NomiMessage,
  type NomiNotification,
  type NomiPermissions,
  type NomiPose,
  type NomiProject,
  type NomiTask,
} from "./types";

const KEYS = {
  companion: "nomi_companion",
  messages: "nomi_messages",
  tasks: "nomi_tasks",
  memories: "nomi_memories",
  projects: "nomi_projects",
  permissions: "nomi_permissions",
  theme: "nomi_theme",
  language: "nomi_language",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage can be full or blocked — the app keeps working in memory */
  }
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16),
      );

const logErr = (label: string) => ({ error }: { error: unknown }) => {
  if (error) console.error(`nomi sync ${label}`, error);
};

interface NomiContextValue {
  ready: boolean;
  session: Session | null;
  companion: NomiCompanion;
  updateCompanion: (patch: Partial<NomiCompanion>) => void;
  messages: NomiMessage[];
  thinking: boolean;
  pose: NomiPose;
  speaking: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  tasks: NomiTask[];
  addTask: (task: Omit<NomiTask, "id" | "createdAt" | "done">) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  memories: NomiMemory[];
  addMemory: (content: string, category?: string) => void;
  toggleMemory: (id: string) => void;
  removeMemory: (id: string) => void;
  projects: NomiProject[];
  addProject: (name: string, description?: string, color?: string) => NomiProject;
  updateProject: (id: string, patch: Partial<Omit<NomiProject, "id" | "createdAt">>) => void;
  removeProject: (id: string) => void;
  notifications: NomiNotification[];
  markNotificationRead: (id: string) => void;
  integrationRequest: NomiIntegrationRequest | null;
  dismissIntegrationRequest: () => void;
  permissions: NomiPermissions;
  setPermission: (key: keyof NomiPermissions, value: boolean) => void;
  language: NomiLanguage;
  setLanguage: (lang: NomiLanguage) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  t: ReturnType<typeof makeT>;
  signOut: () => Promise<void>;
}

const NomiContext = createContext<NomiContextValue | null>(null);

export function NomiProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [companion, setCompanion] = useState<NomiCompanion>(DEFAULT_COMPANION);
  const [messages, setMessages] = useState<NomiMessage[]>([]);
  const [tasks, setTasks] = useState<NomiTask[]>([]);
  const [memories, setMemories] = useState<NomiMemory[]>([]);
  const [projects, setProjects] = useState<NomiProject[]>([]);
  const [notifications, setNotifications] = useState<NomiNotification[]>([]);
  const [integrationRequest, setIntegrationRequest] = useState<NomiIntegrationRequest | null>(null);
  const [permissions, setPermissions] = useState<NomiPermissions>(DEFAULT_PERMISSIONS);
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [pose, setPose] = useState<NomiPose>("wave");
  const speakTimer = useRef<number | null>(null);

  /* ---------------------------------------------------------------- boot */
  useEffect(() => {
    setCompanion(read<NomiCompanion>(KEYS.companion, DEFAULT_COMPANION));
    setMessages(readList<NomiMessage>(KEYS.messages));
    setTasks(readList<NomiTask>(KEYS.tasks));
    setMemories(readList<NomiMemory>(KEYS.memories));
    setProjects(readList<NomiProject>(KEYS.projects));
    setPermissions(read<NomiPermissions>(KEYS.permissions, DEFAULT_PERMISSIONS));
    setThemeState((localStorage.getItem(KEYS.theme) as "light" | "dark") || "light");
    setReady(true);

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "INITIAL_SESSION" || event === "USER_UPDATED")
        setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  /* ------------------------------------------------- html theme / dir */
  useEffect(() => {
    if (!ready) return;
    const html = document.documentElement;
    html.classList.toggle("dark", theme === "dark");
    html.style.colorScheme = theme;
    localStorage.setItem(KEYS.theme, theme);
  }, [theme, ready]);

  useEffect(() => {
    if (!ready) return;
    const html = document.documentElement;
    html.setAttribute("lang", companion.language);
    html.setAttribute("dir", companion.language === "ar" ? "rtl" : "ltr");
    localStorage.setItem(KEYS.language, companion.language);
  }, [companion.language, ready]);

  /* ------------------------------------------------------- persistence */
  useEffect(() => { if (ready) write(KEYS.companion, companion); }, [companion, ready]);
  useEffect(() => { if (ready) write(KEYS.messages, messages.slice(-80)); }, [messages, ready]);
  useEffect(() => { if (ready) write(KEYS.tasks, tasks); }, [tasks, ready]);
  useEffect(() => { if (ready) write(KEYS.memories, memories); }, [memories, ready]);
  useEffect(() => { if (ready) write(KEYS.projects, projects); }, [projects, ready]);
  useEffect(() => { if (ready) write(KEYS.permissions, permissions); }, [permissions, ready]);

  /* ----------------------------------------------- cloud sync (signed in) */
  const userId = session?.user?.id ?? null;

  const companionRow = useCallback(
    (c: NomiCompanion, id: string) => ({
      user_id: id,
      name: c.name,
      shape: c.shape,
      base_color: c.baseColor,
      accent_color: c.accentColor,
      glasses: c.glasses,
      outfit: c.outfit,
      personality: c.personality,
      tone: c.tone,
      language: c.language,
      voice: c.voice,
      onboarded: c.onboarded,
    }),
    [],
  );

  useEffect(() => {
    if (!userId || !ready) return;
    let cancelled = false;

    (async () => {
      const [comp, rows, mems, perms, projs, msgs, notes] = await Promise.all([
        supabase.from("nomi_companions").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("nomi_tasks").select("*").eq("user_id", userId).order("created_at"),
        supabase.from("nomi_memories").select("*").eq("user_id", userId).order("created_at"),
        supabase.from("nomi_permissions").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("nomi_projects").select("*").eq("user_id", userId).order("created_at"),
        supabase.from("nomi_messages").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(80),
        supabase.from("nomi_notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
      ]);
      if (cancelled) return;

      // First sign-in on this device: upload what the guest already made.
      const localCompanion = read<NomiCompanion>(KEYS.companion, DEFAULT_COMPANION);
      if (comp.data) {
        const c = comp.data;
        setCompanion((previous) => ({
          ...previous,
          name: c.name,
          shape: c.shape as NomiCompanion["shape"],
          baseColor: c.base_color,
          accentColor: c.accent_color,
          glasses: (c.glasses as NomiCompanion["glasses"]) ?? previous.glasses,
          outfit: (c.outfit as NomiCompanion["outfit"]) ?? previous.outfit,
          personality: c.personality as NomiCompanion["personality"],
          tone: c.tone as NomiCompanion["tone"],
          language: c.language as NomiLanguage,
          voice: c.voice as NomiCompanion["voice"],
          onboarded: c.onboarded || previous.onboarded,
        }));
      } else if (localCompanion.onboarded) {
        void supabase.from("nomi_companions").upsert(companionRow(localCompanion, userId), { onConflict: "user_id" }).then(logErr("companion"));
      }

      if (projs.data?.length) {
        setProjects(projs.data.map((p) => ({
          id: p.id, name: p.name, description: p.description ?? undefined, color: p.color, archived: p.archived, createdAt: p.created_at,
        })));
      } else {
        const local = readList<NomiProject>(KEYS.projects);
        if (local.length)
          void supabase.from("nomi_projects").insert(local.map((p) => ({ id: p.id, user_id: userId, name: p.name, description: p.description ?? null, color: p.color, archived: p.archived }))).then(logErr("projects"));
      }

      if (rows.data?.length) {
        setTasks(rows.data.map((r) => ({
          id: r.id, title: r.title, note: r.note ?? undefined, kind: (r.kind as NomiTask["kind"]) ?? "task",
          dueAt: r.due_at, done: r.done, createdAt: r.created_at, projectId: r.project_id,
        })));
      } else {
        const local = readList<NomiTask>(KEYS.tasks);
        if (local.length)
          void supabase.from("nomi_tasks").insert(local.map((t) => ({ id: t.id, user_id: userId, title: t.title, note: t.note ?? null, kind: t.kind, due_at: t.dueAt ?? null, done: t.done, project_id: t.projectId ?? null }))).then(logErr("tasks"));
      }

      if (mems.data?.length) {
        setMemories(mems.data.map((m) => ({ id: m.id, category: m.category, content: m.content, enabled: m.enabled, createdAt: m.created_at })));
      } else {
        const local = readList<NomiMemory>(KEYS.memories);
        if (local.length)
          void supabase.from("nomi_memories").insert(local.map((m) => ({ id: m.id, user_id: userId, category: m.category, content: m.content, enabled: m.enabled }))).then(logErr("memories"));
      }

      if (msgs.data?.length) {
        setMessages(msgs.data.reverse().map((m) => ({
          id: m.id, role: m.role === "assistant" ? "assistant" : "user", content: m.content,
          pose: (m.pose as NomiPose) ?? "idle", createdAt: m.created_at,
        })));
      }

      if (perms.data) {
        const p = perms.data;
        setPermissions({ calls: p.calls, email: p.email, calendar: p.calendar, web: p.web, microphone: p.microphone, memory: p.memory });
      }

      if (notes.data)
        setNotifications(notes.data.map((n) => ({ id: n.id, taskId: n.task_id, title: n.title, body: n.body, read: n.read, createdAt: n.created_at })));
    })();

    return () => { cancelled = true; };
  }, [userId, ready, companionRow]);

  /* ------------------------------------------- live reminders (realtime) */
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`nomi-notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "nomi_notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as { id: string; task_id: string | null; title: string; body: string | null; read: boolean; created_at: string };
          setNotifications((prev) => [{ id: n.id, taskId: n.task_id, title: n.title, body: n.body, read: n.read, createdAt: n.created_at }, ...prev]);
          toast(n.title, { description: n.body ?? undefined });
          if (typeof Notification !== "undefined" && Notification.permission === "granted")
            new Notification(n.title, { body: n.body ?? undefined, icon: "/favicon.ico" });
        },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [userId]);

  /* Guest reminders: no server, so check locally once a minute. */
  const firedLocal = useRef(new Set<string>());
  useEffect(() => {
    if (userId || !ready) return;
    const tick = () => {
      const now = Date.now();
      for (const t of tasks) {
        if (t.done || !t.dueAt || firedLocal.current.has(t.id)) continue;
        if (Date.parse(t.dueAt) <= now) {
          firedLocal.current.add(t.id);
          toast(t.title, { description: t.note });
          if (typeof Notification !== "undefined" && Notification.permission === "granted")
            new Notification(t.title, { body: t.note });
        }
      }
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [userId, ready, tasks]);

  /* ------------------------------------------------------------ actions */
  const updateCompanion = useCallback(
    (patch: Partial<NomiCompanion>) =>
      setCompanion((prev) => {
        const next = { ...prev, ...patch };
        if (userId)
          void supabase.from("nomi_companions").upsert(companionRow(next, userId), { onConflict: "user_id" }).then(logErr("companion"));
        return next;
      }),
    [userId, companionRow],
  );

  const markSpeaking = useCallback((text: string) => {
    setSpeaking(true);
    if (speakTimer.current) window.clearTimeout(speakTimer.current);
    const duration = Math.min(9000, 1200 + text.length * 45);
    speakTimer.current = window.setTimeout(() => setSpeaking(false), duration);
  }, []);

  const addProject = useCallback<NomiContextValue["addProject"]>(
    (name, description, color = "#2F5BEA") => {
      const row: NomiProject = { id: uid(), name, description, color, archived: false, createdAt: new Date().toISOString() };
      setProjects((prev) => [...prev, row]);
      if (userId)
        void supabase.from("nomi_projects").insert({ id: row.id, user_id: userId, name, description: description ?? null, color }).then(logErr("project"));
      return row;
    },
    [userId],
  );

  const updateProject = useCallback<NomiContextValue["updateProject"]>(
    (id, patch) => {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      if (userId) {
        const db: { name?: string; description?: string | null; color?: string; archived?: boolean } = {};
        if (patch.name !== undefined) db.name = patch.name;
        if (patch.description !== undefined) db.description = patch.description;
        if (patch.color !== undefined) db.color = patch.color;
        if (patch.archived !== undefined) db.archived = patch.archived;
        void supabase.from("nomi_projects").update(db).eq("id", id).then(logErr("project"));
      }
    },
    [userId],
  );

  const removeProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTasks((prev) => prev.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)));
      if (userId) void supabase.from("nomi_projects").delete().eq("id", id).then(logErr("project"));
    },
    [userId],
  );

  const addTask = useCallback<NomiContextValue["addTask"]>(
    (task) => {
      const row: NomiTask = { ...task, id: uid(), done: false, createdAt: new Date().toISOString() };
      setTasks((prev) => [...prev, row]);
      if (userId)
        void supabase.from("nomi_tasks").insert({
          id: row.id, user_id: userId, title: row.title, note: row.note ?? null, kind: row.kind,
          due_at: row.dueAt ?? null, project_id: row.projectId ?? null,
        }).then(logErr("task"));
    },
    [userId],
  );

  const toggleTask = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
        const changed = next.find((t) => t.id === id);
        if (userId && changed) void supabase.from("nomi_tasks").update({ done: changed.done }).eq("id", id).then(logErr("task"));
        return next;
      });
    },
    [userId],
  );

  const removeTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (userId) void supabase.from("nomi_tasks").delete().eq("id", id).then(logErr("task"));
    },
    [userId],
  );

  const addMemory = useCallback(
    (content: string, category = "preference") => {
      const row: NomiMemory = { id: uid(), category, content, enabled: true, createdAt: new Date().toISOString() };
      setMemories((prev) => [...prev, row]);
      if (userId) void supabase.from("nomi_memories").insert({ id: row.id, user_id: userId, category, content }).then(logErr("memory"));
    },
    [userId],
  );

  const toggleMemory = useCallback(
    (id: string) => {
      setMemories((prev) => {
        const next = prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
        const changed = next.find((m) => m.id === id);
        if (userId && changed) void supabase.from("nomi_memories").update({ enabled: changed.enabled }).eq("id", id).then(logErr("memory"));
        return next;
      });
    },
    [userId],
  );

  const removeMemory = useCallback(
    (id: string) => {
      setMemories((prev) => prev.filter((m) => m.id !== id));
      if (userId) void supabase.from("nomi_memories").delete().eq("id", id).then(logErr("memory"));
    },
    [userId],
  );

  const applyActions = useCallback(
    (actions: NomiAction[]) => {
      const createdProjects = new Map<string, string>();
      for (const a of actions) {
        if (a.type === "create_project") {
          const exists = projects.find((p) => p.name.toLowerCase() === a.name.toLowerCase());
          createdProjects.set(a.name.toLowerCase(), exists?.id ?? addProject(a.name, a.description).id);
        }
      }
      for (const a of actions) {
        if (a.type === "create_task") {
          const key = a.project?.toLowerCase();
          const projectId = key ? (createdProjects.get(key) ?? projects.find((p) => p.name.toLowerCase() === key)?.id ?? null) : null;
          addTask({ title: a.title, note: a.note, kind: a.kind, dueAt: a.due_at ?? null, projectId });
          if (a.kind === "reminder" && typeof Notification !== "undefined" && Notification.permission === "default")
            void Notification.requestPermission();
        } else if (a.type === "complete_task") {
          const needle = a.title.toLowerCase();
          const match = tasks.find((t) => !t.done && (t.title.toLowerCase().includes(needle) || needle.includes(t.title.toLowerCase())));
          if (match) toggleTask(match.id);
        } else if (a.type === "save_memory") {
          if (permissions.memory && !memories.some((m) => m.content.toLowerCase() === a.content.toLowerCase()))
            addMemory(a.content, a.category);
        } else if (a.type === "request_integration") {
          setIntegrationRequest({ integration: a.integration, reason: a.reason });
        }
      }
    },
    [projects, tasks, memories, permissions.memory, addProject, addTask, toggleTask, addMemory],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || thinking) return;

      const detected = detectPose(clean);
      const userMessage: NomiMessage = { id: uid(), role: "user", content: clean, pose: detected, createdAt: new Date().toISOString() };
      const history = [...messages, userMessage];
      setMessages(history);
      setPose(detected);
      setThinking(true);

      if (userId)
        void supabase.from("nomi_messages").insert({ id: userMessage.id, user_id: userId, role: "user", content: clean, pose: detected }).then(logErr("message"));

      const enabled = (Object.keys(permissions) as Array<keyof NomiPermissions>).filter((k) => permissions[k]);
      const { reply, actions } = await askNomi(history, { companion, memories, tasks, projects, enabledIntegrations: enabled });
      applyActions(actions);

      const assistantMessage: NomiMessage = { id: uid(), role: "assistant", content: reply, pose: detected, createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, assistantMessage]);
      setThinking(false);
      markSpeaking(reply);

      if (userId)
        void supabase.from("nomi_messages").insert({ id: assistantMessage.id, user_id: userId, role: "assistant", content: reply, pose: detected }).then(logErr("message"));
    },
    [companion, memories, tasks, projects, permissions, messages, thinking, userId, markSpeaking, applyActions],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    if (userId) void supabase.from("nomi_messages").delete().eq("user_id", userId).then(logErr("messages"));
  }, [userId]);

  const markNotificationRead = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      if (userId) void supabase.from("nomi_notifications").update({ read: true }).eq("id", id).then(logErr("notification"));
    },
    [userId],
  );

  const setPermission = useCallback(
    (key: keyof NomiPermissions, value: boolean) => {
      setPermissions((prev) => {
        const next = { ...prev, [key]: value };
        if (userId) void supabase.from("nomi_permissions").upsert({ user_id: userId, ...next }, { onConflict: "user_id" }).then(logErr("permissions"));
        return next;
      });
    },
    [userId],
  );

  const setLanguage = useCallback((lang: NomiLanguage) => updateCompanion({ language: lang }), [updateCompanion]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setNotifications([]);
  }, []);

  const value = useMemo<NomiContextValue>(
    () => ({
      ready, session, companion, updateCompanion, messages, thinking, pose, speaking, sendMessage, clearChat,
      tasks, addTask, toggleTask, removeTask, memories, addMemory, toggleMemory, removeMemory,
      projects, addProject, updateProject, removeProject, notifications, markNotificationRead,
      integrationRequest, dismissIntegrationRequest: () => setIntegrationRequest(null),
      permissions, setPermission, language: companion.language, setLanguage, theme, setTheme: setThemeState,
      t: makeT(companion.language), signOut,
    }),
    [
      ready, session, companion, updateCompanion, messages, thinking, pose, speaking, sendMessage, clearChat,
      tasks, addTask, toggleTask, removeTask, memories, addMemory, toggleMemory, removeMemory,
      projects, addProject, updateProject, removeProject, notifications, markNotificationRead,
      integrationRequest, permissions, setPermission, setLanguage, theme, signOut,
    ],
  );

  return <NomiContext.Provider value={value}>{children}</NomiContext.Provider>;
}

export function useNomi() {
  const ctx = useContext(NomiContext);
  if (!ctx) throw new Error("useNomi must be used inside NomiProvider");
  return ctx;
}
