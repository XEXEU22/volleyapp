-- Execute este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rvzdpudrrodaeyxgyumc/sql/new

CREATE TABLE IF NOT EXISTS public.players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 3.0,
  level TEXT NOT NULL DEFAULT 'Nível Pro',
  avatar_url TEXT,
  is_mvp BOOLEAN DEFAULT false,
  skill_ataque INTEGER NOT NULL DEFAULT 3 CHECK (skill_ataque BETWEEN 1 AND 5),
  skill_defesa INTEGER NOT NULL DEFAULT 3 CHECK (skill_defesa BETWEEN 1 AND 5),
  skill_recepcao INTEGER NOT NULL DEFAULT 3 CHECK (skill_recepcao BETWEEN 1 AND 5),
  skill_levantamento INTEGER NOT NULL DEFAULT 3 CHECK (skill_levantamento BETWEEN 1 AND 5),
  skill_saque INTEGER NOT NULL DEFAULT 3 CHECK (skill_saque BETWEEN 1 AND 5),
  skill_bloqueio INTEGER NOT NULL DEFAULT 3 CHECK (skill_bloqueio BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access (no auth required for this app)
CREATE POLICY "Allow public read" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.players FOR DELETE USING (true);
