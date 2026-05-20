-- Allow anyone to insert comments (public feature)
CREATE POLICY "Cualquiera puede insertar comentarios" 
ON comments FOR INSERT WITH CHECK (true);
