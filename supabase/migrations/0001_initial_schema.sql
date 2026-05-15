-- supabase/migrations/0001_initial_schema.sql
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    video_type TEXT NOT NULL CHECK (video_type IN ('youtube', 'mp4')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_seconds INTEGER NOT NULL,
    end_seconds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Básico (Lectura pública)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partidos son publicos" ON matches FOR SELECT USING (true);
CREATE POLICY "Clips son publicos" ON clips FOR SELECT USING (true);
