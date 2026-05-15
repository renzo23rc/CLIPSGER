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
CREATE TABLE match_markers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    timestamp_seconds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE match_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marcadores son publicos" ON match_markers FOR SELECT USING (true);
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    body TEXT NOT NULL,
    timestamp_seconds INTEGER NOT NULL,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_match_time ON comments(match_id, timestamp_seconds, created_at);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comentarios lectura publica" ON comments FOR SELECT USING (true);

CREATE TABLE editors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE editors ENABLE ROW LEVEL SECURITY;
CREATE TABLE match_stats_definition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

INSERT INTO match_stats_definition (key, label, display_order) VALUES
  ('goles', 'Goles', 1),
  ('tiros', 'Tiros totales', 2),
  ('bloqueos', 'Bloqueos', 3),
  ('atajadas', 'Atajadas del arquero', 4),
  ('exclusiones_favor', 'Exclusiones a favor', 5),
  ('exclusiones_contra', 'Exclusiones en contra', 6),
  ('penales_favor', 'Penales a favor', 7),
  ('penales_contra', 'Penales en contra', 8),
  ('contraataques', 'Contraataques', 9),
  ('perdidas_robos', 'Perdidas / Robos', 10);

CREATE TABLE match_stats_enabled (
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    definition_id UUID REFERENCES match_stats_definition(id) ON DELETE CASCADE,
    PRIMARY KEY (match_id, definition_id)
);

CREATE TABLE match_stats_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    definition_id UUID REFERENCES match_stats_definition(id),
    team TEXT NOT NULL CHECK (team IN ('ger', 'rival')),
    value TEXT NOT NULL
);

CREATE TABLE match_stats_6v5 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    team TEXT NOT NULL CHECK (team IN ('ger', 'rival')),
    phase TEXT NOT NULL CHECK (phase IN ('6v5', '5v6')),
    intentos INTEGER DEFAULT 0,
    goles INTEGER DEFAULT 0
);

ALTER TABLE match_stats_enabled ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_stats_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_stats_6v5 ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_stats_definition ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stats lectura publica" ON match_stats_definition FOR SELECT USING (true);
CREATE POLICY "Stats enabled lectura publica" ON match_stats_enabled FOR SELECT USING (true);
CREATE POLICY "Stats values lectura publica" ON match_stats_values FOR SELECT USING (true);
CREATE POLICY "Stats 6v5 lectura publica" ON match_stats_6v5 FOR SELECT USING (true);
CREATE POLICY "Editores insertan partidos" ON matches FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()) AND editors.is_active = true)
);
CREATE POLICY "Editores actualizan partidos" ON matches FOR UPDATE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()) AND editors.is_active = true)
);
CREATE POLICY "Editores borran partidos" ON matches FOR DELETE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()) AND editors.is_active = true)
);

CREATE POLICY "Editores insertan clips" ON clips FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores actualizan clips" ON clips FOR UPDATE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores borran clips" ON clips FOR DELETE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);

CREATE POLICY "Editores insertan marcadores" ON match_markers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores borran marcadores" ON match_markers FOR DELETE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);

CREATE POLICY "Editores insertan stats" ON match_stats_enabled FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores borran stats" ON match_stats_enabled FOR DELETE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);

CREATE POLICY "Editores insertan stats values" ON match_stats_values FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores actualizan stats values" ON match_stats_values FOR UPDATE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);

CREATE POLICY "Editores insertan 6v5" ON match_stats_6v5 FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores actualizan 6v5" ON match_stats_6v5 FOR UPDATE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);

CREATE POLICY "Editores leen editors" ON editors FOR SELECT USING (true);
CREATE TABLE annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    editor_id UUID REFERENCES editors(id),
    body TEXT NOT NULL,
    timestamp_seconds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE annotation_tags (
    annotation_id UUID REFERENCES annotations(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (annotation_id, tag_id)
);

ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotation_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anotaciones lectura publica" ON annotations FOR SELECT USING (true);
CREATE POLICY "Tags lectura publica" ON tags FOR SELECT USING (true);
CREATE POLICY "Annotation tags lectura publica" ON annotation_tags FOR SELECT USING (true);

CREATE POLICY "Editores insertan anotaciones" ON annotations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores borran anotaciones" ON annotations FOR DELETE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores insertan tags" ON tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores insertan annotation tags" ON annotation_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
ALTER TABLE matches ADD COLUMN rival_name TEXT;
ALTER TABLE matches ADD COLUMN match_date DATE;
ALTER TABLE matches ADD COLUMN description TEXT;
