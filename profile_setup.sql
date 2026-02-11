
-- Run this in your Supabase SQL Editor to create the profiles table
-- https://supabase.com/dashboard/project/rvzdpudrrodaeyxgyumc/sql/new

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT,
  level TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for the single profile (simplified for this app)
CREATE POLICY "Allow public read profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profile" ON public.profiles FOR UPDATE USING (true);

-- Insert a default profile if none exists (optional, could also handle in app)
INSERT INTO public.profiles (name, bio)
SELECT 'Seu Nome', 'Escreva algo sobre você...'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1);
