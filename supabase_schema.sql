-- SparkChat - Supabase Schema

Run these SQL commands in your Supabase SQL Editor to set up the database.

-- 1. Enable Realtime
-- Go to Database -> Replication -> supabase_realtime and enable it for the tables below.

-- 2. Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY, 
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  age INTEGER CHECK (age >= 18),
  country TEXT,
  avatar_url TEXT,
  is_online BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'online', -- online, searching, chatting
  current_partner_id TEXT, 
  is_google_user BOOLEAN DEFAULT false,
  searching_for TEXT, -- To help with random chat matching
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Messages Table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  is_temporary BOOLEAN DEFAULT false, -- If true, delete when session ends
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Friendships Table
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- 5. Blocks Table
CREATE TABLE blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  blocked_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- 6. RLS (Row Level Security) - Simplified for now, but recommended for production
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Basic policies (Simplified for client-side managed auth)
CREATE POLICY "Public profiles are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update profiles" ON users FOR UPDATE USING (true); 

CREATE POLICY "Messages are readable by everyone" ON messages FOR SELECT USING (true);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Friendships are manageable" ON friendships FOR ALL USING (true);

CREATE POLICY "Blocks are manageable" ON blocks FOR ALL USING (true);

-- 7. Realtime setup
-- Add tables to the supabase_realtime publication
-- ALTER PUBLICATION supabase_realtime ADD TABLE users, messages, friendships, blocks;
