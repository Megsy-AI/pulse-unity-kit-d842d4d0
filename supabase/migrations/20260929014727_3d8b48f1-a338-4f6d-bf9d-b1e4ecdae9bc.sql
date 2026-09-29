-- lovable-cron-fallback-reviewed: reminders are user-chosen future times; minute cadence keeps delivery within 60s and the job is a single indexed SQL update
ALTER TABLE public.nomi_companions ADD COLUMN IF NOT EXISTS glasses text NOT NULL DEFAULT 'cobalt-round', ADD COLUMN IF NOT EXISTS outfit text NOT NULL DEFAULT 'varsity';

CREATE TABLE public.nomi_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#2F5BEA',
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nomi_projects TO authenticated;
GRANT ALL ON public.nomi_projects TO service_role;
ALTER TABLE public.nomi_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nomi_projects_own" ON public.nomi_projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX nomi_projects_user_idx ON public.nomi_projects(user_id);

ALTER TABLE public.nomi_tasks ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.nomi_projects(id) ON DELETE SET NULL, ADD COLUMN IF NOT EXISTS reminded_at timestamptz;
ALTER TABLE public.nomi_messages ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.nomi_projects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS nomi_tasks_due_idx ON public.nomi_tasks(due_at) WHERE done = false AND reminded_at IS NULL;
CREATE INDEX IF NOT EXISTS nomi_messages_user_idx ON public.nomi_messages(user_id, created_at);

CREATE TABLE public.nomi_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_id uuid REFERENCES public.nomi_tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.nomi_notifications TO authenticated;
GRANT ALL ON public.nomi_notifications TO service_role;
ALTER TABLE public.nomi_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nomi_notifications_select_own" ON public.nomi_notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "nomi_notifications_update_own" ON public.nomi_notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "nomi_notifications_delete_own" ON public.nomi_notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX nomi_notifications_user_idx ON public.nomi_notifications(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.nomi_set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER nomi_projects_updated_at BEFORE UPDATE ON public.nomi_projects FOR EACH ROW EXECUTE FUNCTION public.nomi_set_updated_at();

CREATE OR REPLACE FUNCTION public.nomi_dispatch_due_reminders() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  WITH due AS (
    UPDATE public.nomi_tasks SET reminded_at = now()
    WHERE done = false AND reminded_at IS NULL AND due_at IS NOT NULL AND due_at <= now()
    RETURNING id, user_id, title, note
  )
  INSERT INTO public.nomi_notifications(user_id, task_id, title, body)
  SELECT user_id, id, title, note FROM due;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END; $$;
REVOKE ALL ON FUNCTION public.nomi_dispatch_due_reminders() FROM PUBLIC, anon, authenticated;

SELECT cron.schedule('nomi-dispatch-reminders', '* * * * *', 'SELECT public.nomi_dispatch_due_reminders()');

ALTER PUBLICATION supabase_realtime ADD TABLE public.nomi_notifications;