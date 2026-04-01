-- ============================================================
-- SEAZONE KANBAN — AUTH + RLS
-- ============================================================

-- User profiles
CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text,
  email      text,
  avatar_url text,
  role       text DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at timestamptz DEFAULT now()
);

-- Auto-create profile on new user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable RLS
ALTER TABLE pipes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases             ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipe_fields        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards              ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_connections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_activities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_conditionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints  ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE standby_entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read config tables
CREATE POLICY "auth_read_pipes"              ON pipes              FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_phases"             ON phases             FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_pipe_fields"        ON pipe_fields        FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_cards"              ON cards              FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_connections"        ON card_connections   FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_activities"         ON card_activities    FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_automations"        ON automation_rules   FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_conditionals"       ON field_conditionals FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_webhook_endpoints"  ON webhook_endpoints  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_webhook_deliveries" ON webhook_deliveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_standby"            ON standby_entries    FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_profiles"           ON profiles           FOR SELECT TO authenticated USING (true);

-- Operators can write cards and related data
CREATE POLICY "auth_write_cards"       ON cards            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_connections" ON card_connections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_activities"  ON card_activities  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_standby"     ON standby_entries  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_deliveries"  ON webhook_deliveries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Own profile
CREATE POLICY "own_profile_all" ON profiles FOR ALL TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Admins can modify config (pipes, phases, fields, automations, conditionals)
CREATE POLICY "admin_write_pipes"       ON pipes              FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin') WITH CHECK (true);
CREATE POLICY "admin_write_phases"      ON phases             FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin') WITH CHECK (true);
CREATE POLICY "admin_write_fields"      ON pipe_fields        FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin') WITH CHECK (true);
CREATE POLICY "admin_write_automations" ON automation_rules   FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin') WITH CHECK (true);
CREATE POLICY "admin_write_conditionals"ON field_conditionals FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin') WITH CHECK (true);
CREATE POLICY "admin_write_webhooks"    ON webhook_endpoints  FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin') WITH CHECK (true);
