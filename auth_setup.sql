
-- 1. Update players table
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing data to a default user or keep as null (user action may be needed to assign old data)
-- For a fresh start, we'll just allow existing data to remain without user_id

-- 2. Update profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 3. Reset RLS Policies for players
DROP POLICY IF EXISTS "public_access_policy" ON public.players;
DROP POLICY IF EXISTS "public_insert_policy" ON public.players;
DROP POLICY IF EXISTS "public_update_policy" ON public.players;
DROP POLICY IF EXISTS "public_delete_policy" ON public.players;
DROP POLICY IF EXISTS "Allow public read" ON public.players;
DROP POLICY IF EXISTS "Allow public insert" ON public.players;
DROP POLICY IF EXISTS "Allow public update" ON public.players;
DROP POLICY IF EXISTS "Allow public delete" ON public.players;

CREATE POLICY "Users can view their own players" ON public.players
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own players" ON public.players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own players" ON public.players
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own players" ON public.players
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Reset RLS Policies for profiles
DROP POLICY IF EXISTS "Allow public read profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Storage policies update
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

CREATE POLICY "Users can view any avatar" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);
