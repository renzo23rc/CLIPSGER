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
