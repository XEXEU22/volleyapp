
-- Run this in your Supabase SQL Editor to create the avatars bucket
-- https://supabase.com/dashboard/project/rvzdpudrrodaeyxgyumc/sql/new

-- 1. Create a bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up Access Controls (RLS) for the bucket
-- Allow public access to read files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Allow public access to upload files (no auth required for this app)
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Allow public access to update/delete files
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');
