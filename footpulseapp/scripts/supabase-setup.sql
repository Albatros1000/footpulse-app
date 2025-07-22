-- Script de création des tables Supabase pour FootPulse

-- Table des joueurs
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  age INTEGER NOT NULL,
  height INTEGER,
  weight INTEGER,
  club TEXT,
  strong_foot TEXT,
  jersey_number TEXT,
  experience TEXT,
  global_score INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des analyses vidéo
CREATE TABLE IF NOT EXISTS video_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  video_url TEXT,
  global_score INTEGER DEFAULT 0,
  technique INTEGER DEFAULT 0,
  vitesse INTEGER DEFAULT 0,
  physique INTEGER DEFAULT 0,
  mental INTEGER DEFAULT 0,
  tactique INTEGER DEFAULT 0,
  precision INTEGER DEFAULT 0,
  strengths TEXT[],
  weaknesses TEXT[],
  recommendations TEXT[],
  position_analysis TEXT,
  potential TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des clubs (pour plus tard)
CREATE TABLE IF NOT EXISTS clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  level TEXT,
  region TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des interactions clubs-joueurs
CREATE TABLE IF NOT EXISTS club_player_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'view', 'interest', 'contact', 'offer'
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_players_global_score ON players(global_score DESC);
CREATE INDEX IF NOT EXISTS idx_video_analyses_player_id ON video_analyses(player_id);
CREATE INDEX IF NOT EXISTS idx_video_analyses_created_at ON video_analyses(created_at DESC);

-- RLS (Row Level Security) - Sécurité
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_player_interactions ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (les joueurs peuvent voir leurs propres données)
CREATE POLICY "Players can view own data" ON players
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Players can update own data" ON players
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Les analyses sont visibles par le propriétaire
CREATE POLICY "Players can view own analyses" ON video_analyses
  FOR SELECT USING (
    player_id IN (SELECT id FROM players WHERE auth.uid()::text = id::text)
  );

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_players_updated_at 
  BEFORE UPDATE ON players 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vues utiles pour les statistiques
CREATE OR REPLACE VIEW player_stats AS
SELECT 
  p.id,
  p.name,
  p.position,
  p.age,
  p.club,
  p.global_score,
  va.technique,
  va.vitesse,
  va.physique,
  va.mental,
  va.tactique,
  va.precision,
  va.potential,
  va.created_at as last_analysis
FROM players p
LEFT JOIN video_analyses va ON p.id = va.player_id
WHERE va.status = 'completed'
ORDER BY va.created_at DESC;

-- Vue pour le leaderboard
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  name,
  position,
  age,
  club,
  global_score,
  ROW_NUMBER() OVER (ORDER BY global_score DESC) as rank
FROM players
WHERE global_score > 0
ORDER BY global_score DESC
LIMIT 100;
