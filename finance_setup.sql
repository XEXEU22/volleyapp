-- Execute este SQL no Supabase SQL Editor para criar a tabela de mensalidades:

CREATE TABLE IF NOT EXISTS public.member_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  amount NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, month, year)
);

-- Enable RLS
ALTER TABLE public.member_payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own payments" 
ON public.member_payments 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Note: Ensure players table also has user_id or equivalent if visibility is restricted.
-- Since current policies on players are public, we might need to adjust them for better security,
-- but for now, we follow the existing pattern of owner-based access for payments.
