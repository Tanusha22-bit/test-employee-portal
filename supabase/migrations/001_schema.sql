-- ══════════════════════════════════════════════════════════════════════
-- Employee Portal — Full Schema Migration
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════════

-- ── Profiles (extends auth.users) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  work_email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN (
    'hr_manager','hr_executive','hr_intern',
    'it_manager','it_executive','it_intern',
    'superadmin','system_admin','employee'
  )),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Onboardings ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboardings (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','offboarded')),
  hr_email TEXT,
  it_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Personal Details ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS personal_details (
  id BIGSERIAL PRIMARY KEY,
  onboarding_id BIGINT NOT NULL REFERENCES onboardings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  official_document_id TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male','female')),
  marital_status TEXT NOT NULL CHECK (marital_status IN ('single','married','divorced','widowed')),
  religion TEXT NOT NULL,
  race TEXT NOT NULL,
  residential_address TEXT NOT NULL,
  personal_contact_number TEXT NOT NULL,
  personal_email TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Work Details ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_details (
  id BIGSERIAL PRIMARY KEY,
  onboarding_id BIGINT NOT NULL REFERENCES onboardings(id) ON DELETE CASCADE,
  employee_status TEXT NOT NULL DEFAULT 'active' CHECK (employee_status IN ('active','resigned')),
  staff_status TEXT NOT NULL DEFAULT 'new' CHECK (staff_status IN ('existing','new')),
  employment_type TEXT NOT NULL CHECK (employment_type IN ('permanent','intern','contract')),
  role TEXT CHECK (role IN (
    'manager','senior_executive','executive_associate','director_hod',
    'hr_manager','hr_executive','hr_intern','it_manager','it_executive','it_intern',
    'superadmin','system_admin','others'
  )),
  designation TEXT NOT NULL,
  department TEXT,
  company TEXT NOT NULL,
  office_location TEXT NOT NULL,
  reporting_manager TEXT NOT NULL,
  start_date DATE NOT NULL,
  exit_date DATE,
  company_email TEXT,
  google_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Asset Provisioning ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_provisionings (
  id BIGSERIAL PRIMARY KEY,
  onboarding_id BIGINT NOT NULL REFERENCES onboardings(id) ON DELETE CASCADE,
  laptop_provision BOOLEAN DEFAULT false,
  monitor_set BOOLEAN DEFAULT false,
  converter BOOLEAN DEFAULT false,
  company_phone BOOLEAN DEFAULT false,
  sim_card BOOLEAN DEFAULT false,
  access_card_request BOOLEAN DEFAULT false,
  office_keys TEXT,
  others TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Asset Inventories ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_inventories (
  id BIGSERIAL PRIMARY KEY,
  asset_tag TEXT NOT NULL UNIQUE,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('laptop','monitor','converter','phone','sim_card','access_card','other')),
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','assigned','under_maintenance','retired','unavailable')),
  notes TEXT,
  processor TEXT,
  ram_size TEXT,
  storage TEXT,
  operating_system TEXT,
  screen_size TEXT,
  spec_others TEXT,
  purchase_date DATE,
  purchase_vendor TEXT,
  purchase_cost DECIMAL(10,2),
  warranty_expiry_date DATE,
  assigned_employee_id BIGINT,
  asset_assigned_date DATE,
  expected_return_date DATE,
  asset_condition TEXT DEFAULT 'new' CHECK (asset_condition IN ('new','good','fair','damaged')),
  maintenance_status TEXT DEFAULT 'none' CHECK (maintenance_status IN ('none','under_maintenance','repair_required')),
  last_maintenance_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Asset Assignments ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_assignments (
  id BIGSERIAL PRIMARY KEY,
  onboarding_id BIGINT NOT NULL REFERENCES onboardings(id) ON DELETE CASCADE,
  asset_inventory_id BIGINT NOT NULL REFERENCES asset_inventories(id),
  assigned_date DATE NOT NULL,
  returned_date DATE,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned','returned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── AARFs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aarfs (
  id BIGSERIAL PRIMARY KEY,
  onboarding_id BIGINT NOT NULL REFERENCES onboardings(id) ON DELETE CASCADE,
  aarf_reference TEXT NOT NULL UNIQUE,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  acknowledgement_token TEXT UNIQUE,
  it_manager_acknowledged BOOLEAN DEFAULT false,
  it_manager_acknowledged_at TIMESTAMPTZ,
  it_manager_user_id UUID REFERENCES auth.users(id),
  it_manager_remarks TEXT,
  it_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Employees ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  onboarding_id BIGINT REFERENCES onboardings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  active_from DATE NOT NULL,
  active_until DATE,
  full_name TEXT,
  official_document_id TEXT,
  date_of_birth DATE,
  sex TEXT,
  marital_status TEXT,
  religion TEXT,
  race TEXT,
  residential_address TEXT,
  personal_contact_number TEXT,
  personal_email TEXT,
  bank_account_number TEXT,
  designation TEXT,
  department TEXT,
  company TEXT,
  office_location TEXT,
  reporting_manager TEXT,
  company_email TEXT,
  start_date DATE,
  exit_date DATE,
  employment_type TEXT,
  work_role TEXT,
  google_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Offboardings ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offboardings (
  id BIGSERIAL PRIMARY KEY,
  onboarding_id BIGINT NOT NULL REFERENCES onboardings(id) ON DELETE CASCADE,
  exit_date DATE NOT NULL,
  reason TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboardings ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_provisionings ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE aarfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE offboardings ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── Profiles policies ──────────────────────────────────────────────────
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "HR/IT/Admin can view all profiles" ON profiles FOR SELECT USING (
  get_my_role() IN ('hr_manager','hr_executive','hr_intern','it_manager','it_executive','it_intern','superadmin','system_admin')
);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Auth can insert profiles" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- ── Onboardings policies ───────────────────────────────────────────────
CREATE POLICY "HR/Admin can manage onboardings" ON onboardings FOR ALL USING (
  get_my_role() IN ('hr_manager','hr_executive','hr_intern','superadmin','system_admin')
);
CREATE POLICY "IT can view onboardings" ON onboardings FOR SELECT USING (
  get_my_role() IN ('it_manager','it_executive','it_intern')
);

-- ── Personal/Work details ──────────────────────────────────────────────
CREATE POLICY "HR/Admin full access personal_details" ON personal_details FOR ALL USING (
  get_my_role() IN ('hr_manager','hr_executive','hr_intern','superadmin','system_admin')
);
CREATE POLICY "IT can view personal_details" ON personal_details FOR SELECT USING (
  get_my_role() IN ('it_manager','it_executive','it_intern')
);
CREATE POLICY "Employees can view own personal_details" ON personal_details FOR SELECT USING (
  onboarding_id IN (SELECT onboarding_id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "HR/Admin full access work_details" ON work_details FOR ALL USING (
  get_my_role() IN ('hr_manager','hr_executive','hr_intern','superadmin','system_admin')
);
CREATE POLICY "IT can view work_details" ON work_details FOR SELECT USING (
  get_my_role() IN ('it_manager','it_executive','it_intern')
);
CREATE POLICY "Employees can view own work_details" ON work_details FOR SELECT USING (
  onboarding_id IN (SELECT onboarding_id FROM employees WHERE user_id = auth.uid())
);

-- ── Asset tables ───────────────────────────────────────────────────────
CREATE POLICY "IT/Admin full access asset_inventories" ON asset_inventories FOR ALL USING (
  get_my_role() IN ('it_manager','it_executive','it_intern','superadmin','system_admin')
);
CREATE POLICY "HR can view asset_inventories" ON asset_inventories FOR SELECT USING (
  get_my_role() IN ('hr_manager','hr_executive','hr_intern')
);
CREATE POLICY "Employees can view own assigned assets" ON asset_inventories FOR SELECT USING (
  assigned_employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "IT/Admin full access asset_assignments" ON asset_assignments FOR ALL USING (
  get_my_role() IN ('it_manager','it_executive','it_intern','superadmin','system_admin')
);
CREATE POLICY "HR can view asset_assignments" ON asset_assignments FOR SELECT USING (
  get_my_role() IN ('hr_manager','hr_executive','hr_intern')
);
CREATE POLICY "Employees can view own assignments" ON asset_assignments FOR SELECT USING (
  onboarding_id IN (SELECT onboarding_id FROM employees WHERE user_id = auth.uid())
);

-- ── AARFs ──────────────────────────────────────────────────────────────
CREATE POLICY "IT/Admin full access aarfs" ON aarfs FOR ALL USING (
  get_my_role() IN ('it_manager','it_executive','it_intern','superadmin','system_admin')
);
CREATE POLICY "HR can view aarfs" ON aarfs FOR SELECT USING (
  get_my_role() IN ('hr_manager','hr_executive','hr_intern')
);
CREATE POLICY "Public can view own AARF by token" ON aarfs FOR SELECT USING (acknowledgement_token IS NOT NULL);
CREATE POLICY "Employees can acknowledge own AARF" ON aarfs FOR UPDATE USING (
  onboarding_id IN (SELECT onboarding_id FROM employees WHERE user_id = auth.uid())
);

-- ── Employees ──────────────────────────────────────────────────────────
CREATE POLICY "HR/Admin full access employees" ON employees FOR ALL USING (
  get_my_role() IN ('hr_manager','hr_executive','hr_intern','superadmin','system_admin')
);
CREATE POLICY "IT can view employees" ON employees FOR SELECT USING (
  get_my_role() IN ('it_manager','it_executive','it_intern')
);
CREATE POLICY "Users can view own employee record" ON employees FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own employee record" ON employees FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert own employee record" ON employees FOR INSERT WITH CHECK (user_id = auth.uid());

-- ── Asset provisioning ─────────────────────────────────────────────────
CREATE POLICY "HR/IT/Admin manage asset_provisionings" ON asset_provisionings FOR ALL USING (
  get_my_role() IN ('hr_manager','hr_executive','hr_intern','it_manager','it_executive','it_intern','superadmin','system_admin')
);
CREATE POLICY "Employees view own asset_provisionings" ON asset_provisionings FOR SELECT USING (
  onboarding_id IN (SELECT onboarding_id FROM employees WHERE user_id = auth.uid())
);

-- ══════════════════════════════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, work_email, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'employee',
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ══════════════════════════════════════════════════════════════════════
-- SEED DATA (run separately if needed, after setting up auth users)
-- ══════════════════════════════════════════════════════════════════════
-- NOTE: Create users via Supabase Auth first, then run the seed below.
-- See DEPLOYMENT.md for full setup instructions.
