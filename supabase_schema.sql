-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id                 UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name               VARCHAR(100) NOT NULL,
  email              VARCHAR(150) UNIQUE NOT NULL,
  phone              VARCHAR(20)  DEFAULT NULL,
  password           VARCHAR(255) NOT NULL,
  reset_token        VARCHAR(255) DEFAULT NULL,
  reset_token_expiry BIGINT       DEFAULT NULL,
  created_at         TIMESTAMPTZ  DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  DEFAULT NOW()
);

-- Items Table
CREATE TABLE IF NOT EXISTS items (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  description TEXT         DEFAULT NULL,
  status      VARCHAR(20)  DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'completed')),
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_status  ON items(status);

-- ⚠️ Disable Row Level Security (since we use our own JWT auth, not Supabase Auth)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
