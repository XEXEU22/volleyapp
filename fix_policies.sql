
-- Run this in Supabase SQL Editor to reset policies
-- https://supabase.com/dashboard/project/_/sql/new

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read" ON public.players;
DROP POLICY IF EXISTS "Allow public insert" ON public.players;
DROP POLICY IF EXISTS "Allow public update" ON public.players;
DROP POLICY IF EXISTS "Allow public delete" ON public.players;

-- Re-create policies allowing everything for everyone (public)
CREATE POLICY "Allow public read" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.players FOR DELETE USING (true);
