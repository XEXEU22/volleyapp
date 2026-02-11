-- Rename position column to gender in players and profiles
ALTER TABLE players RENAME COLUMN position TO gender;
ALTER TABLE profiles RENAME COLUMN position TO gender;

-- Update RLS policies if they exist (they usually refer to IDs, but let's be safe)
-- Actually, the RLS policies I created yesterday refer to auth.uid() and user_id, 
-- but not to the position column specifically.
