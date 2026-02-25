-- Execute este SQL no Supabase SQL Editor para adicionar os novos campos e corrigir o erro de salvamento:
-- https://supabase.com/dashboard/project/rvzdpudrrodaeyxgyumc/sql/new

-- 1. Garante que a coluna user_id seja única (necessário para o salvamento funcionar)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

-- 2. Adiciona os novos campos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Opcional: Adicionar comentário para documentação
COMMENT ON COLUMN public.profiles.age IS 'Idade do jogador';
COMMENT ON COLUMN public.profiles.phone IS 'Telefone/WhatsApp de contato';
