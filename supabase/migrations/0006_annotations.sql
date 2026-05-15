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
