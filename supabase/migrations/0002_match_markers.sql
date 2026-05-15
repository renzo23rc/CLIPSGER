CREATE TABLE match_markers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    timestamp_seconds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE match_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marcadores son publicos" ON match_markers FOR SELECT USING (true);
