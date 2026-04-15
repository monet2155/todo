-- Migration: 001_initial_schema
-- Creates the five core tables with RLS policies

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name       TEXT NOT NULL,
  npc_type   TEXT NOT NULL CHECK (npc_type IN ('knight', 'rival', 'sage')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: own rows only"
  ON profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- quests
-- ============================================================
CREATE TABLE quests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  grade      TEXT NOT NULL CHECK (grade IN ('daily', 'weekly', 'main')),
  stat_type  TEXT NOT NULL CHECK (stat_type IN ('strength', 'intelligence', 'charisma')),
  xp         INTEGER NOT NULL DEFAULT 10,
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  due_date   DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quests: own rows only"
  ON quests
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- completions
-- ============================================================
CREATE TABLE completions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id     UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  week_number  INTEGER NOT NULL
);

ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "completions: own rows only"
  ON completions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- stats
-- ============================================================
CREATE TABLE stats (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  strength     INTEGER NOT NULL DEFAULT 0,
  intelligence INTEGER NOT NULL DEFAULT 0,
  charisma     INTEGER NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stats: own rows only"
  ON stats
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- recaps
-- ============================================================
CREATE TABLE recaps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  year        INTEGER NOT NULL,
  script      JSONB,
  video_url   TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'generating', 'done', 'failed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_number, year)
);

ALTER TABLE recaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recaps: own rows only (write)"
  ON recaps
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public read for sharing: any authenticated or anonymous user can read a recap by id
CREATE POLICY "recaps: public read"
  ON recaps
  FOR SELECT
  USING (true);
