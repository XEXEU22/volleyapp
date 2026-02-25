-- Execute este SQL no Supabase para criar a tabela de movimentações de caixa:

CREATE TABLE IF NOT EXISTS public.cash_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'Geral',
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own transactions" 
ON public.cash_transactions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
