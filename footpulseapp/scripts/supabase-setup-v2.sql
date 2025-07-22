-- Configuration complète de la base de données FootPulse
-- Suppression des tables existantes si elles existent
DROP TABLE IF EXISTS club_player_interactions CASCADE;
DROP TABLE IF EXISTS video_analyses CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS clubs CASCADE;

-- Suppression des vues si elles existent
DROP VIEW IF EXISTS player_stats CASCADE;
DROP VIEW IF EXISTS leaderboard CASCADE;

-- Suppression des fonctions si elles existent
DROP FUNCTION IF EXISTS update_player_stats() CASCADE;

-- Table des clubs
CREATE TABLE clubs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    league VARCHAR(100),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des joueurs
CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    nationality VARCHAR(100),
    position VARCHAR(50) NOT NULL,
    preferred_foot VARCHAR(10),
    height INTEGER, -- en cm
    weight INTEGER, -- en kg
    current_club VARCHAR(255),
    jersey_number INTEGER,
    market_value DECIMAL(12,2),
    
    -- Statistiques de performance
    overall_rating INTEGER DEFAULT 0 CHECK (overall_rating >= 0 AND overall_rating <= 100),
    pace INTEGER DEFAULT 0 CHECK (pace >= 0 AND pace <= 100),
    shooting INTEGER DEFAULT 0 CHECK (shooting >= 0 AND shooting <= 100),
    passing INTEGER DEFAULT 0 CHECK (passing >= 0 AND passing <= 100),
    dribbling INTEGER DEFAULT 0 CHECK (dribbling >= 0 AND dribbling <= 100),
    defending INTEGER DEFAULT 0 CHECK (defending >= 0 AND defending <= 100),
    physical INTEGER DEFAULT 0 CHECK (physical >= 0 AND physical <= 100),
    
    -- Métadonnées
    profile_image_url TEXT,
    bio TEXT,
    social_media JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des analyses vidéo
CREATE TABLE video_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    video_title VARCHAR(255),
    analysis_type VARCHAR(50) DEFAULT 'general' CHECK (analysis_type IN ('general', 'technical', 'tactical', 'physical')),
    
    -- Résultats de l'analyse IA
    ai_analysis JSONB NOT NULL DEFAULT '{}',
    strengths TEXT[],
    weaknesses TEXT[],
    recommendations TEXT[],
    
    -- Scores détaillés
    technical_score INTEGER CHECK (technical_score >= 0 AND technical_score <= 100),
    tactical_score INTEGER CHECK (tactical_score >= 0 AND tactical_score <= 100),
    physical_score INTEGER CHECK (physical_score >= 0 AND physical_score <= 100),
    mental_score INTEGER CHECK (mental_score >= 0 AND mental_score <= 100),
    
    -- Métadonnées
    analysis_duration INTEGER, -- en secondes
    confidence_level DECIMAL(3,2) DEFAULT 0.85,
    processed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des interactions club-joueur
CREATE TABLE club_player_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('view', 'favorite', 'contact', 'offer', 'meeting')),
    interaction_data JSONB DEFAULT '{}',
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(club_id, player_id, interaction_type, created_at)
);

-- Index pour les performances
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_overall_rating ON players(overall_rating DESC);
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_video_analyses_player_id ON video_analyses(player_id);
CREATE INDEX idx_video_analyses_status ON video_analyses(status);
CREATE INDEX idx_club_interactions_club_id ON club_player_interactions(club_id);
CREATE INDEX idx_club_interactions_player_id ON club_player_interactions(player_id);
CREATE INDEX idx_club_interactions_type ON club_player_interactions(interaction_type);

-- Vue pour les statistiques des joueurs
CREATE VIEW player_stats AS
SELECT 
    p.id,
    p.full_name,
    p.position,
    p.overall_rating,
    p.current_club,
    COUNT(va.id) as total_analyses,
    AVG(va.technical_score) as avg_technical_score,
    AVG(va.tactical_score) as avg_tactical_score,
    AVG(va.physical_score) as avg_physical_score,
    AVG(va.mental_score) as avg_mental_score,
    COUNT(DISTINCT cpi.club_id) as interested_clubs,
    p.created_at
FROM players p
LEFT JOIN video_analyses va ON p.id = va.player_id AND va.status = 'completed'
LEFT JOIN club_player_interactions cpi ON p.id = cpi.player_id AND cpi.interaction_type IN ('favorite', 'contact', 'offer')
GROUP BY p.id, p.full_name, p.position, p.overall_rating, p.current_club, p.created_at;

-- Vue pour le classement
CREATE VIEW leaderboard AS
SELECT 
    p.id,
    p.full_name,
    p.position,
    p.overall_rating,
    p.current_club,
    COALESCE(AVG(va.technical_score + va.tactical_score + va.physical_score + va.mental_score) / 4, p.overall_rating) as performance_score,
    COUNT(va.id) as analyses_count,
    COUNT(DISTINCT cpi.club_id) as club_interest,
    ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(va.technical_score + va.tactical_score + va.physical_score + va.mental_score) / 4, p.overall_rating) DESC) as rank
FROM players p
LEFT JOIN video_analyses va ON p.id = va.player_id AND va.status = 'completed'
LEFT JOIN club_player_interactions cpi ON p.id = cpi.player_id AND cpi.interaction_type IN ('favorite', 'contact', 'offer')
WHERE p.status = 'active'
GROUP BY p.id, p.full_name, p.position, p.overall_rating, p.current_club
ORDER BY performance_score DESC;

-- Fonction pour mettre à jour les statistiques des joueurs
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Mise à jour des statistiques basées sur les analyses vidéo
    UPDATE players 
    SET 
        overall_rating = GREATEST(
            overall_rating,
            COALESCE((
                SELECT AVG(technical_score + tactical_score + physical_score + mental_score) / 4
                FROM video_analyses 
                WHERE player_id = NEW.player_id AND status = 'completed'
            ), overall_rating)
        ),
        updated_at = NOW()
    WHERE id = NEW.player_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement les stats
CREATE TRIGGER trigger_update_player_stats
    AFTER INSERT OR UPDATE ON video_analyses
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_player_stats();

-- Politiques RLS (Row Level Security)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_player_interactions ENABLE ROW LEVEL SECURITY;

-- Politique pour les joueurs (lecture publique, modification par le propriétaire)
CREATE POLICY "Players are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Players can update own profile" ON players FOR UPDATE USING (auth.email() = email);
CREATE POLICY "Anyone can insert players" ON players FOR INSERT WITH CHECK (true);

-- Politique pour les analyses vidéo
CREATE POLICY "Video analyses are viewable by everyone" ON video_analyses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert video analyses" ON video_analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Video analyses can be updated by system" ON video_analyses FOR UPDATE USING (true);

-- Politique pour les clubs
CREATE POLICY "Clubs are viewable by everyone" ON clubs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert clubs" ON clubs FOR INSERT WITH CHECK (true);

-- Politique pour les interactions
CREATE POLICY "Club interactions are viewable by everyone" ON club_player_interactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert interactions" ON club_player_interactions FOR INSERT WITH CHECK (true);

-- Insertion de données de test
INSERT INTO clubs (name, country, league, logo_url) VALUES
('Paris Saint-Germain', 'France', 'Ligue 1', 'https://logos.com/psg.png'),
('FC Barcelona', 'Spain', 'La Liga', 'https://logos.com/barca.png'),
('Manchester City', 'England', 'Premier League', 'https://logos.com/city.png'),
('Real Madrid', 'Spain', 'La Liga', 'https://logos.com/madrid.png'),
('Bayern Munich', 'Germany', 'Bundesliga', 'https://logos.com/bayern.png');

-- Insertion de joueurs de test avec des données réalistes
INSERT INTO players (
    email, full_name, date_of_birth, nationality, position, preferred_foot, 
    height, weight, current_club, jersey_number, market_value,
    overall_rating, pace, shooting, passing, dribbling, defending, physical,
    profile_image_url, bio, is_verified
) VALUES
(
    'kylian.mbappe@test.com', 'Kylian Mbappé', '1998-12-20', 'France', 'Attaquant', 'Droit',
    178, 73, 'Real Madrid', 9, 180000000.00,
    91, 97, 89, 80, 92, 36, 77,
    'https://img.com/mbappe.jpg', 'Attaquant rapide et technique, champion du monde 2018', true
),
(
    'pedri.gonzalez@test.com', 'Pedri González', '2002-11-25', 'Spain', 'Milieu', 'Droit',
    174, 60, 'FC Barcelona', 8, 100000000.00,
    85, 70, 65, 91, 88, 55, 68,
    'https://img.com/pedri.jpg', 'Milieu créatif avec une excellente vision de jeu', true
),
(
    'erling.haaland@test.com', 'Erling Haaland', '2000-07-21', 'Norway', 'Attaquant', 'Gauche',
    194, 88, 'Manchester City', 9, 170000000.00,
    88, 89, 91, 65, 80, 45, 88,
    'https://img.com/haaland.jpg', 'Buteur prolifique avec une force physique impressionnante', true
),
(
    'jude.bellingham@test.com', 'Jude Bellingham', '2003-06-29', 'England', 'Milieu', 'Droit',
    186, 75, 'Real Madrid', 5, 120000000.00,
    86, 76, 78, 86, 83, 78, 82,
    'https://img.com/bellingham.jpg', 'Milieu complet avec un excellent potentiel', true
),
(
    'jamal.musiala@test.com', 'Jamal Musiala', '2003-02-26', 'Germany', 'Milieu offensif', 'Droit',
    180, 70, 'Bayern Munich', 42, 90000000.00,
    84, 78, 72, 85, 90, 42, 71,
    'https://img.com/musiala.jpg', 'Milieu offensif technique avec un excellent dribble', true
);

-- Insertion d'analyses vidéo de test
INSERT INTO video_analyses (
    player_id, video_url, video_title, analysis_type,
    ai_analysis, strengths, weaknesses, recommendations,
    technical_score, tactical_score, physical_score, mental_score,
    analysis_duration, confidence_level, status, processed_at
) VALUES
(
    (SELECT id FROM players WHERE email = 'kylian.mbappe@test.com'),
    'https://youtube.com/watch?v=mbappe_highlights',
    'Mbappé - Analyse technique',
    'technical',
    '{"speed_analysis": "Vitesse exceptionnelle", "finishing": "Finition précise", "movement": "Déplacements intelligents"}',
    ARRAY['Vitesse explosive', 'Finition des deux pieds', 'Jeu en profondeur'],
    ARRAY['Jeu de tête à améliorer', 'Constance dans les gros matchs'],
    ARRAY['Travailler les centres', 'Améliorer le leadership'],
    92, 88, 85, 87, 180, 0.94, 'completed', NOW() - INTERVAL '1 day'
),
(
    (SELECT id FROM players WHERE email = 'pedri.gonzalez@test.com'),
    'https://youtube.com/watch?v=pedri_passing',
    'Pedri - Vision de jeu',
    'tactical',
    '{"passing_accuracy": "95%", "key_passes": "8 per game", "press_resistance": "Excellent"}',
    ARRAY['Passes courtes précises', 'Vision de jeu', 'Résistance au pressing'],
    ARRAY['Force physique', 'Jeu aérien'],
    ARRAY['Renforcement musculaire', 'Travail sur les duels'],
    88, 92, 65, 89, 165, 0.91, 'completed', NOW() - INTERVAL '2 days'
);

-- Insertion d'interactions club-joueur de test
INSERT INTO club_player_interactions (club_id, player_id, interaction_type, interaction_data, notes) VALUES
(
    (SELECT id FROM clubs WHERE name = 'FC Barcelona'),
    (SELECT id FROM players WHERE email = 'kylian.mbappe@test.com'),
    'view',
    '{"viewed_at": "2024-01-15", "scout_rating": 9.5}',
    'Joueur suivi de près par nos recruteurs'
),
(
    (SELECT id FROM clubs WHERE name = 'Manchester City'),
    (SELECT id FROM players WHERE email = 'pedri.gonzalez@test.com'),
    'favorite',
    '{"priority": "high", "budget_allocated": 80000000}',
    'Cible prioritaire pour le mercato estival'
);

-- Mise à jour des timestamps
UPDATE players SET updated_at = NOW();
UPDATE video_analyses SET updated_at = NOW();
UPDATE clubs SET updated_at = NOW();

-- Affichage des statistiques finales
SELECT 'Configuration terminée!' as status;
SELECT COUNT(*) as total_players FROM players;
SELECT COUNT(*) as total_analyses FROM video_analyses;
SELECT COUNT(*) as total_clubs FROM clubs;
SELECT COUNT(*) as total_interactions FROM club_player_interactions;
