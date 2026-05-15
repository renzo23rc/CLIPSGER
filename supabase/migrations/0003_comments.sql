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
