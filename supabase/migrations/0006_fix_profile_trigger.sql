-- Fix: allow trigger to insert into profiles bypassing RLS
-- The SECURITY DEFINER + SET row_security = off ensures the trigger
-- can always create a profile when a new auth user is inserted.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Also add service_role bypass policy for profiles
CREATE POLICY "service_role_profiles" ON profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
