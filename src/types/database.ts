export type UserRole =
  | 'hr_manager' | 'hr_executive' | 'hr_intern'
  | 'it_manager' | 'it_executive' | 'it_intern'
  | 'superadmin' | 'system_admin' | 'employee'

export type EmploymentType = 'permanent' | 'intern' | 'contract'
export type AssetType = 'laptop' | 'monitor' | 'converter' | 'phone' | 'sim_card' | 'access_card' | 'other'
export type AssetStatus = 'available' | 'assigned' | 'under_maintenance' | 'retired' | 'unavailable'
export type AssetCondition = 'new' | 'good' | 'fair' | 'damaged'
export type OnboardingStatus = 'pending' | 'active' | 'offboarded'

// ── Profile (extends Supabase auth.users) ─────────────────────────────────────
export interface Profile {
  id: string
  name: string
  work_email: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── Onboarding ────────────────────────────────────────────────────────────────
export interface Onboarding {
  id: number
  status: OnboardingStatus
  hr_email: string | null
  it_email: string | null
  created_at: string
  updated_at: string
}

export interface PersonalDetail {
  id: number
  onboarding_id: number
  full_name: string
  official_document_id: string
  date_of_birth: string
  sex: 'male' | 'female'
  marital_status: string
  religion: string
  race: string
  residential_address: string
  personal_contact_number: string
  personal_email: string
  bank_account_number: string
  created_at: string
  updated_at: string
}

export interface WorkDetail {
  id: number
  onboarding_id: number
  employee_status: 'active' | 'resigned'
  staff_status: 'existing' | 'new'
  employment_type: EmploymentType
  role: UserRole | null
  designation: string
  department: string | null
  company: string
  office_location: string
  reporting_manager: string
  start_date: string
  exit_date: string | null
  company_email: string | null
  google_id: string | null
  created_at: string
  updated_at: string
}

export interface AssetProvisioning {
  id: number
  onboarding_id: number
  laptop_provision: boolean
  monitor_set: boolean
  converter: boolean
  company_phone: boolean
  sim_card: boolean
  access_card_request: boolean
  office_keys: string | null
  others: string | null
  created_at: string
  updated_at: string
}

export interface AssetInventory {
  id: number
  asset_tag: string
  asset_name: string
  asset_type: AssetType
  brand: string | null
  model: string | null
  serial_number: string | null
  status: AssetStatus
  notes: string | null
  processor: string | null
  ram_size: string | null
  storage: string | null
  operating_system: string | null
  screen_size: string | null
  spec_others: string | null
  purchase_date: string | null
  purchase_vendor: string | null
  purchase_cost: number | null
  warranty_expiry_date: string | null
  assigned_employee_id: number | null
  asset_assigned_date: string | null
  expected_return_date: string | null
  asset_condition: AssetCondition
  maintenance_status: string
  last_maintenance_date: string | null
  created_at: string
  updated_at: string
}

export interface AssetAssignment {
  id: number
  onboarding_id: number
  asset_inventory_id: number
  assigned_date: string
  returned_date: string | null
  status: 'assigned' | 'returned'
  created_at: string
  updated_at: string
  asset?: AssetInventory
}

export interface Aarf {
  id: number
  onboarding_id: number
  aarf_reference: string
  acknowledged: boolean
  acknowledged_at: string | null
  acknowledgement_token: string | null
  it_manager_acknowledged: boolean
  it_manager_acknowledged_at: string | null
  it_manager_user_id: string | null
  it_manager_remarks: string | null
  it_notes: string | null
  created_at: string
  updated_at: string
}

export interface Employee {
  id: number
  onboarding_id: number | null
  user_id: string | null
  active_from: string
  active_until: string | null
  full_name: string | null
  official_document_id: string | null
  date_of_birth: string | null
  sex: string | null
  marital_status: string | null
  religion: string | null
  race: string | null
  residential_address: string | null
  personal_contact_number: string | null
  personal_email: string | null
  bank_account_number: string | null
  designation: string | null
  department: string | null
  company: string | null
  office_location: string | null
  reporting_manager: string | null
  company_email: string | null
  start_date: string | null
  exit_date: string | null
  employment_type: string | null
  work_role: string | null
  google_id: string | null
  created_at: string
  updated_at: string
}

export interface Offboarding {
  id: number
  onboarding_id: number
  exit_date: string
  reason: string | null
  remarks: string | null
  created_at: string
}

// ── Joined types for views ────────────────────────────────────────────────────
export interface OnboardingFull {
  onboarding: Onboarding
  personal: PersonalDetail | null
  work: WorkDetail | null
  provisioning: AssetProvisioning | null
  assignments: (AssetAssignment & { asset: AssetInventory })[]
  aarf: Aarf | null
}

type Relationships = Record<string, never>

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile,'created_at'|'updated_at'>; Update: Partial<Profile>; Relationships: Relationships }
      onboardings: { Row: Onboarding; Insert: Omit<Onboarding,'id'|'created_at'|'updated_at'>; Update: Partial<Onboarding>; Relationships: Relationships }
      personal_details: { Row: PersonalDetail; Insert: Omit<PersonalDetail,'id'>; Update: Partial<PersonalDetail>; Relationships: Relationships }
      work_details: { Row: WorkDetail; Insert: Omit<WorkDetail,'id'>; Update: Partial<WorkDetail>; Relationships: Relationships }
      asset_provisionings: { Row: AssetProvisioning; Insert: Omit<AssetProvisioning,'id'>; Update: Partial<AssetProvisioning>; Relationships: Relationships }
      asset_inventories: { Row: AssetInventory; Insert: Omit<AssetInventory,'id'|'created_at'>; Update: Partial<AssetInventory>; Relationships: Relationships }
      asset_assignments: { Row: AssetAssignment; Insert: Omit<AssetAssignment,'id'>; Update: Partial<AssetAssignment>; Relationships: Relationships }
      aarfs: { Row: Aarf; Insert: Omit<Aarf,'id'|'created_at'>; Update: Partial<Aarf>; Relationships: Relationships }
      employees: { Row: Employee; Insert: Omit<Employee,'id'>; Update: Partial<Employee>; Relationships: Relationships }
      offboardings: { Row: Offboarding; Insert: Omit<Offboarding,'id'|'created_at'>; Update: Partial<Offboarding>; Relationships: Relationships }
    }
  }
}
