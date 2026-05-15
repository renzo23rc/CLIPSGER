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
