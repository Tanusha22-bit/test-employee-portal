-- ============================================================
-- EMPLOYEE PORTAL — Claritas Asia
-- Paste this entire file into the Bolt Database SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  work_email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN (
    'hr_manager','hr_executive','hr_intern',
    'it_manager','it_executive','it_intern',
    'superadmin','system_admin','employee'
  )),
  is_active BOOLEAN NOT NULL DEFAULT true,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onboardings (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','offboarded')),
  hr_email TEXT,
  it_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS work_details (
  id BIGSERIAL PRIMARY KEY,
  onboarding_id BIGINT NOT NULL REFERENCES onboardings(id) ON DELETE CASCADE,
  employee_status TEXT NOT NULL DEFAULT 'active' CHECK (employee_status IN ('active','resigned')),
  staff_status TEXT NOT NULL DEFAULT 'new' CHECK (staff_status IN ('existing','new')),
  employment_type TEXT NOT NULL CHECK (employment_type IN ('permanent','intern','contract')),
  role TEXT CHECK (role IN (
    'manager','senior_executive','executive_associate','director_hod',
    'hr_manager','hr_executive','hr_intern',
    'it_manager','it_executive','it_intern',
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
  invoice_document TEXT,
  assigned_employee_id BIGINT,
  asset_assigned_date DATE,
  expected_return_date DATE,
  asset_condition TEXT DEFAULT 'new' CHECK (asset_condition IN ('new','good','fair','damaged')),
  maintenance_status TEXT DEFAULT 'none' CHECK (maintenance_status IN ('none','under_maintenance','repair_required')),
  last_maintenance_date DATE,
  asset_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS aarfs (
  id BIGSERIAL PRIMARY KEY,
  onboarding_id BIGINT NOT NULL REFERENCES onboardings(id) ON DELETE CASCADE,
  aarf_reference TEXT NOT NULL UNIQUE,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  acknowledgement_token TEXT UNIQUE,
  it_manager_acknowledged BOOLEAN DEFAULT false,
  it_manager_acknowledged_at TIMESTAMPTZ,
  it_manager_user_id BIGINT REFERENCES users(id),
  it_manager_remarks TEXT,
  it_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  onboarding_id BIGINT REFERENCES onboardings(id) ON DELETE SET NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
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
  aarf_file_path TEXT,
  google_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offboardings (
  id BIGSERIAL PRIMARY KEY,
  onboarding_id BIGINT NOT NULL REFERENCES onboardings(id) ON DELETE CASCADE,
  exit_date DATE NOT NULL,
  reason TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
