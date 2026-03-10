-- Migration: Add handle_new_user trigger to auto-insert profiles on signup
-- The trigger respects the role chosen by the user in raw_user_meta_data,
-- while still assigning 'admin' to the very first user and defaulting to 'observer'.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role;
BEGIN
  -- First user becomes admin, all others default to observer.
  -- Note: there is a theoretical race condition if two users sign up simultaneously
  -- before any profile exists; in practice this only affects initial system setup.
  IF NOT EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'observer';
  END IF;

  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, assigned_role)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
