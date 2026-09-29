
CREATE TABLE public.nomi_companions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  name text not null default 'Nomi',
  shape text not null default 'round',
  base_color text not null default '#7C5CFF',
  accent_color text not null default '#FFB86B',
  personality text not null default 'friendly',
  tone text not null default 'warm',
  language text not null default 'en',
  voice text not null default 'soft',
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nomi_companions TO authenticated;
GRANT ALL ON public.nomi_companions TO service_role;
ALTER TABLE public.nomi_companions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own nomi companion" ON public.nomi_companions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.nomi_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  note text,
  kind text not null default 'task',
  due_at timestamptz,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
CREATE INDEX nomi_tasks_user_idx ON public.nomi_tasks(user_id, created_at desc);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nomi_tasks TO authenticated;
GRANT ALL ON public.nomi_tasks TO service_role;
ALTER TABLE public.nomi_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own nomi tasks" ON public.nomi_tasks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.nomi_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'preference',
  content text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
CREATE INDEX nomi_memories_user_idx ON public.nomi_memories(user_id, created_at desc);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nomi_memories TO authenticated;
GRANT ALL ON public.nomi_memories TO service_role;
ALTER TABLE public.nomi_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own nomi memories" ON public.nomi_memories FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.nomi_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  pose text,
  created_at timestamptz not null default now()
);
CREATE INDEX nomi_messages_user_idx ON public.nomi_messages(user_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nomi_messages TO authenticated;
GRANT ALL ON public.nomi_messages TO service_role;
ALTER TABLE public.nomi_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own nomi messages" ON public.nomi_messages FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.nomi_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  calls boolean not null default false,
  email boolean not null default false,
  calendar boolean not null default false,
  web boolean not null default false,
  microphone boolean not null default false,
  memory boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nomi_permissions TO authenticated;
GRANT ALL ON public.nomi_permissions TO service_role;
ALTER TABLE public.nomi_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own nomi permissions" ON public.nomi_permissions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.nomi_call_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  summary text,
  created_at timestamptz not null default now()
);
CREATE INDEX nomi_call_sessions_user_idx ON public.nomi_call_sessions(user_id, started_at desc);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nomi_call_sessions TO authenticated;
GRANT ALL ON public.nomi_call_sessions TO service_role;
ALTER TABLE public.nomi_call_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own nomi calls" ON public.nomi_call_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.nomi_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER nomi_companions_touch BEFORE UPDATE ON public.nomi_companions
  FOR EACH ROW EXECUTE FUNCTION public.nomi_touch_updated_at();
CREATE TRIGGER nomi_tasks_touch BEFORE UPDATE ON public.nomi_tasks
  FOR EACH ROW EXECUTE FUNCTION public.nomi_touch_updated_at();
CREATE TRIGGER nomi_memories_touch BEFORE UPDATE ON public.nomi_memories
  FOR EACH ROW EXECUTE FUNCTION public.nomi_touch_updated_at();
CREATE TRIGGER nomi_permissions_touch BEFORE UPDATE ON public.nomi_permissions
  FOR EACH ROW EXECUTE FUNCTION public.nomi_touch_updated_at();
