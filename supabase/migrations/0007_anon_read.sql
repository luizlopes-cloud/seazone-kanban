-- Allow anonymous read access (no-auth mode)
CREATE POLICY "anon_read_pipes"              ON pipes              FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_phases"             ON phases             FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_pipe_fields"        ON pipe_fields        FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_cards"              ON cards              FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_connections"        ON card_connections   FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_activities"         ON card_activities    FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_automations"        ON automation_rules   FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_conditionals"       ON field_conditionals FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_standby"            ON standby_entries    FOR SELECT TO anon USING (true);
CREATE POLICY "anon_write_cards"             ON cards              FOR ALL    TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_write_connections"       ON card_connections   FOR ALL    TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_write_activities"        ON card_activities    FOR ALL    TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_write_standby"           ON standby_entries    FOR ALL    TO anon USING (true) WITH CHECK (true);
